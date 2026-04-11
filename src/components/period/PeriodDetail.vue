<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, XCircle, AlertTriangle, Loader2, RefreshCw, BookOpen } from 'lucide-vue-next'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ConfirmationButton } from '@/components/common/confirmation'

import { PeriodService, JournalService, type PreCloseCheck, type PreCloseCheckStatus } from '@/services/general-ledger'
import { usePeriodStore } from '@/store/period'
import { useToastStore } from '@/store/toast'
import { PERIOD_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t } = useI18n()
const periodStore = usePeriodStore()
const toastStore = useToastStore()
const bus = useEventBus(PERIOD_CHANGED)

const { allPeriods } = toRefs(periodStore.state)

const preCloseCheck = ref<PreCloseCheck | null>(null)
const monthlyClosingJournalId = ref<string | null>(null)
const yearEndClosingJournalId = ref<string | null>(null)
const isLoading = ref(false)
const isClosing = ref(false)
const isCreatingMonthlyClosingJournal = ref(false)
const isCreatingYearEndClosingJournal = ref(false)

const period = computed(() => allPeriods.value.find((p) => p.id === props.periodId))
const isCurrent = computed(() => period.value?.isCurrent ?? false)
const isClosed = computed(() => period.value?.isClosed ?? false)
const isOpen = computed(() => !isCurrent.value && !isClosed.value)
const periodStr = computed(() => {
  if (!period.value) return null
  return `${period.value.fiscalYear}-${String(period.value.periodNumber).padStart(2, '0')}`
})

const allChecksPassed = computed(() => {
  if (preCloseCheck.value == null) return false
  const { unpostedJournals, trialBalance, profitAndLossBalance, currentYearProfitAccount } = preCloseCheck.value

  const coreChecksPassed =
    unpostedJournals.status === 'PASSED' && trialBalance.status === 'PASSED' && profitAndLossBalance.status === 'PASSED'

  // Only require currentYearProfitAccount check in period 12 (year-end).
  // For all other periods, the card is hidden and not a closing prerequisite.
  const isLastPeriod = period.value?.periodNumber === 12
  const currentYearProfitPassed = !isLastPeriod || currentYearProfitAccount.status === 'PASSED'

  return coreChecksPassed && currentYearProfitPassed
})

const canClose = computed(
  () =>
    isCurrent.value &&
    allChecksPassed.value &&
    !isClosing.value &&
    !isCreatingMonthlyClosingJournal.value &&
    !isCreatingYearEndClosingJournal.value,
)

// Reload pre-close check whenever periodId changes
watch(period, () => load(), { immediate: true })

function checkIcon(status?: PreCloseCheckStatus) {
  if (isLoading.value || preCloseCheck.value === null) return 'loading'
  if (status === 'PASSED') return 'passed'
  if (status === 'UNDETERMINED') return 'undetermined'
  return 'failed'
}

function periodLabel() {
  if (!period.value) return ''
  return t('period.periodText', [period.value.fiscalYear, period.value.periodNumber])
}

async function load() {
  if (!isCurrent.value) return
  isLoading.value = true
  preCloseCheck.value = null
  monthlyClosingJournalId.value = null
  yearEndClosingJournalId.value = null
  try {
    const [checkResult, idsResult] = await Promise.all([
      PeriodService.getPreCloseCheck(props.sobId, props.periodId),
      periodStr.value
        ? JournalService.getClosingJournalIds(props.sobId, periodStr.value)
        : Promise.resolve({ data: null }),
    ])
    if (checkResult.data) preCloseCheck.value = checkResult.data
    if (idsResult.data) {
      monthlyClosingJournalId.value = idsResult.data.monthlyClosingJournalId ?? null
      yearEndClosingJournalId.value = idsResult.data.yearEndClosingJournalId ?? null
    }
  } finally {
    isLoading.value = false
  }
}

async function onClose() {
  isClosing.value = true
  try {
    const { exception } = await PeriodService.closePeriod(props.sobId, props.periodId)
    if (!exception) {
      toastStore.action.success(t('common.requestCompleted'), {
        description: t('period.management.closeSuccess'),
      })
      bus.emit()
      await periodStore.action.refreshPeriods(props.sobId)
    }
  } finally {
    isClosing.value = false
  }
}

async function onCreateMonthlyClosingJournal() {
  isCreatingMonthlyClosingJournal.value = true
  try {
    const { data, exception } = await JournalService.createMonthlyClosingJournal(props.sobId)
    if (!exception && data) {
      monthlyClosingJournalId.value = data.journalId
      toastStore.action.success(t('common.requestCompleted'), {
        description: t('period.management.pnlAccounts.generateSuccess'),
      })
      await load()
    }
  } finally {
    isCreatingMonthlyClosingJournal.value = false
  }
}

async function onCreateYearEndClosingJournal() {
  isCreatingYearEndClosingJournal.value = true
  try {
    const { data, exception } = await JournalService.createYearEndClosingJournal(props.sobId)
    if (!exception && data) {
      yearEndClosingJournalId.value = data.journalId
      toastStore.action.success(t('common.requestCompleted'), {
        description: t('period.management.currentYearProfitAccount.generateSuccess'),
      })
      await load()
    }
  } finally {
    isCreatingYearEndClosingJournal.value = false
  }
}
</script>

<template>
  <PageFrame :title="$t('period.management.title')">
    <template #end>
      <template v-if="isCurrent">
        <Button variant="ghost" :disabled="isLoading" @click="load">
          <RefreshCw :class="['size-4', isLoading && 'animate-spin']" />
          {{ $t('common.refresh') }}
        </Button>
        <ConfirmationButton :disabled="!canClose" :message="$t('period.management.confirmClose')" @confirm="onClose">
          <Loader2 v-if="isClosing" class="size-4 animate-spin" />
          {{ $t('period.management.closePeriod') }}
        </ConfirmationButton>
      </template>
    </template>

    <!-- Current period: full pre-close checks -->
    <template v-if="isCurrent">
      <div class="flex flex-col gap-4">
        <!-- Current period header -->
        <div class="flex items-center gap-2">
          <span class="text-muted-foreground text-sm">{{ $t('period.management.currentPeriod') }}:</span>
          <span class="text-sm font-semibold">{{ periodLabel() }}</span>
        </div>

        <!-- Check 1: Unposted Journals -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-base">
              <Loader2
                v-if="checkIcon(preCloseCheck?.unpostedJournals.status) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.unpostedJournals.status) === 'passed'"
                class="size-5 text-green-500"
              />
              <AlertTriangle
                v-else-if="checkIcon(preCloseCheck?.unpostedJournals.status) === 'undetermined'"
                class="size-5 text-yellow-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.unpostedJournals') }}
              <Badge
                v-if="preCloseCheck"
                :variant="preCloseCheck.unpostedJournals.status === 'PASSED' ? 'default' : 'destructive'"
                class="ml-auto text-xs"
              >
                {{ $t('period.management.unpostedJournals.count', [preCloseCheck.unpostedJournals.count]) }}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <!-- Passed -->
            <p v-if="preCloseCheck.unpostedJournals.status === 'PASSED'" class="text-muted-foreground text-sm">
              {{ $t('period.management.unpostedJournals.noUnposted') }}
            </p>
            <!-- Undetermined -->
            <p
              v-else-if="preCloseCheck.unpostedJournals.status === 'UNDETERMINED'"
              class="text-muted-foreground text-sm"
            >
              {{ $t('period.management.checkUndetermined') }}
            </p>
            <!-- Not passed: show journal table -->
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{{ $t('period.management.unpostedJournals.documentNumber') }}</TableHead>
                    <TableHead>{{ $t('period.management.unpostedJournals.transactionDate') }}</TableHead>
                    <TableHead>{{ $t('period.management.unpostedJournals.headerText') }}</TableHead>
                    <TableHead class="text-right">{{ $t('period.management.unpostedJournals.amount') }}</TableHead>
                    <TableHead class="text-center">{{ $t('period.management.unpostedJournals.isReviewed') }}</TableHead>
                    <TableHead class="text-center">{{ $t('period.management.unpostedJournals.isAudited') }}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="journal in preCloseCheck.unpostedJournals.journals" :key="journal.id">
                    <TableCell>
                      <RouterLink
                        :to="{ name: 'journalDetail', params: { sobId: props.sobId, journalId: journal.id } }"
                        class="text-primary text-xs hover:underline"
                      >
                        {{ journal.documentNumber }}
                      </RouterLink>
                    </TableCell>
                    <TableCell class="text-muted-foreground text-xs">{{ journal.transactionDate }}</TableCell>
                    <TableCell class="text-xs">{{ journal.headerText }}</TableCell>
                    <TableCell class="text-right text-xs">{{ $n(journal.amount, 'decimal') }}</TableCell>
                    <TableCell class="text-center">
                      <CheckCircle2 v-if="journal.isReviewed" class="mx-auto size-3.5 text-green-500" />
                      <XCircle v-else class="text-muted-foreground mx-auto size-3.5" />
                    </TableCell>
                    <TableCell class="text-center">
                      <CheckCircle2 v-if="journal.isAudited" class="mx-auto size-3.5 text-green-500" />
                      <XCircle v-else class="text-muted-foreground mx-auto size-3.5" />
                    </TableCell>
                  </TableRow>

                  <!-- Show more hint if count > 3 -->
                  <TableRow v-if="preCloseCheck.unpostedJournals.count > 3">
                    <TableCell colspan="6">
                      <RouterLink
                        :to="{ name: 'journalList', params: { sobId: props.sobId } }"
                        class="text-primary text-xs hover:underline"
                      >
                        {{ $t('period.management.unpostedJournals.showMore') }}
                      </RouterLink>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <!-- Check 2: P&L Balance -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-base">
              <Loader2
                v-if="checkIcon(preCloseCheck?.profitAndLossBalance.status) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.profitAndLossBalance.status) === 'passed'"
                class="size-5 text-green-500"
              />
              <AlertTriangle
                v-else-if="checkIcon(preCloseCheck?.profitAndLossBalance.status) === 'undetermined'"
                class="size-5 text-yellow-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.pnlBalance') }}
              <Button
                v-if="monthlyClosingJournalId"
                variant="ghost"
                size="sm"
                class="ml-auto"
                @click="
                  $router.push({
                    name: 'journalDetail',
                    params: { sobId: props.sobId, journalId: monthlyClosingJournalId },
                  })
                "
              >
                {{ $t('period.management.pnlAccounts.viewJournal') }}
              </Button>
              <ConfirmationButton
                v-else-if="preCloseCheck && preCloseCheck.profitAndLossBalance.status === 'FAILED'"
                variant="ghost"
                size="sm"
                class="ml-auto"
                :disabled="isCreatingMonthlyClosingJournal"
                :message="$t('period.management.pnlAccounts.confirmCarryForward')"
                @confirm="onCreateMonthlyClosingJournal"
              >
                <Loader2 v-if="isCreatingMonthlyClosingJournal" class="size-4 animate-spin" />
                {{ $t('period.management.pnlAccounts.carryForward') }}
              </ConfirmationButton>
            </CardTitle>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <!-- Passed -->
            <p v-if="preCloseCheck.profitAndLossBalance.status === 'PASSED'" class="text-muted-foreground text-sm">
              {{ $t('period.management.pnlAccounts.zeroed') }}
            </p>
            <!-- Undetermined -->
            <p
              v-else-if="preCloseCheck.profitAndLossBalance.status === 'UNDETERMINED'"
              class="text-muted-foreground text-sm"
            >
              {{ $t('period.management.checkUndetermined') }}
            </p>
            <!-- Not passed: show account table -->
            <div v-else>
              <Table class="mb-3">
                <TableHeader>
                  <TableRow>
                    <TableHead>{{ $t('period.management.pnlAccounts.accountNumber') }}</TableHead>
                    <TableHead>{{ $t('period.management.pnlAccounts.accountTitle') }}</TableHead>
                    <TableHead class="text-right">{{ $t('journal.debit') }}</TableHead>
                    <TableHead class="text-right">{{ $t('journal.credit') }}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow v-for="account in preCloseCheck.profitAndLossBalance.accounts" :key="account.accountNumber">
                    <TableCell class="text-xs">{{ account.accountNumber }}</TableCell>
                    <TableCell class="text-xs">{{ account.accountTitle }}</TableCell>
                    <TableCell class="text-right text-xs">
                      {{ account.endingAmount > 0 ? $n(account.endingAmount, 'decimal') : '' }}
                    </TableCell>
                    <TableCell class="text-right text-xs">
                      {{ account.endingAmount < 0 ? $n(Math.abs(account.endingAmount), 'decimal') : '' }}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <!-- Check 3: Year-End Retained Revenue -->
        <Card v-if="preCloseCheck && period?.periodNumber === 12">
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-base">
              <Loader2
                v-if="checkIcon(preCloseCheck?.currentYearProfitAccount.status) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.currentYearProfitAccount.status) === 'passed'"
                class="size-5 text-green-500"
              />
              <AlertTriangle
                v-else-if="checkIcon(preCloseCheck?.currentYearProfitAccount.status) === 'undetermined'"
                class="size-5 text-yellow-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.currentYearProfitAccount') }}
              <Button
                v-if="yearEndClosingJournalId"
                variant="ghost"
                size="sm"
                class="ml-auto"
                @click="
                  $router.push({
                    name: 'journalDetail',
                    params: { sobId: props.sobId, journalId: yearEndClosingJournalId },
                  })
                "
              >
                {{ $t('period.management.currentYearProfitAccount.viewJournal') }}
              </Button>
              <ConfirmationButton
                v-else-if="preCloseCheck && preCloseCheck.currentYearProfitAccount.status === 'FAILED'"
                variant="ghost"
                size="sm"
                class="ml-auto"
                :disabled="isCreatingYearEndClosingJournal"
                :message="$t('period.management.currentYearProfitAccount.confirmGenerate')"
                @confirm="onCreateYearEndClosingJournal"
              >
                <Loader2 v-if="isCreatingYearEndClosingJournal" class="size-4 animate-spin" />
                {{ $t('period.management.currentYearProfitAccount.generateJournal') }}
              </ConfirmationButton>
            </CardTitle>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <!-- Passed -->
            <p v-if="preCloseCheck.currentYearProfitAccount.status === 'PASSED'" class="text-muted-foreground text-sm">
              {{ $t('period.management.currentYearProfitAccount.passed') }}
            </p>
            <!-- Undetermined -->
            <p
              v-else-if="preCloseCheck.currentYearProfitAccount.status === 'UNDETERMINED'"
              class="text-muted-foreground text-sm"
            >
              {{ $t('period.management.checkUndetermined') }}
            </p>
            <!-- Not passed: show account table -->
            <div v-else>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{{ $t('period.management.currentYearProfitAccount.accountNumber') }}</TableHead>
                    <TableHead>{{ $t('period.management.currentYearProfitAccount.accountTitle') }}</TableHead>
                    <TableHead class="text-right">{{
                      $t('period.management.currentYearProfitAccount.endingAmount')
                    }}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell class="text-xs">{{ preCloseCheck.currentYearProfitAccount.accountNumber }}</TableCell>
                    <TableCell class="text-xs">{{ preCloseCheck.currentYearProfitAccount.accountTitle }}</TableCell>
                    <TableCell class="text-right text-xs">{{
                      $n(preCloseCheck.currentYearProfitAccount.endingAmount, 'decimal')
                    }}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <!-- Check 4: Trial Balance -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-base">
              <Loader2
                v-if="checkIcon(preCloseCheck?.trialBalance.status) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.trialBalance.status) === 'passed'"
                class="size-5 text-green-500"
              />
              <AlertTriangle
                v-else-if="checkIcon(preCloseCheck?.trialBalance.status) === 'undetermined'"
                class="size-5 text-yellow-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.trialBalance') }}
            </CardTitle>
            <CardDescription>{{ $t('period.management.trialBalance.description') }}</CardDescription>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <p v-if="preCloseCheck.trialBalance.status === 'UNDETERMINED'" class="text-muted-foreground text-sm">
              {{ $t('period.management.checkUndetermined') }}
            </p>
            <div v-else class="grid grid-cols-3 gap-4">
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">
                  {{ $t('period.management.trialBalance.openingAmount') }}
                </p>
                <p
                  :class="[
                    'text-2xl font-bold',
                    { 'text-destructive': preCloseCheck.trialBalance.openingAmount !== 0 },
                  ]"
                >
                  {{ $n(preCloseCheck.trialBalance.openingAmount, 'decimal') }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('period.management.trialBalance.periodAmount') }}</p>
                <p
                  :class="['text-2xl font-bold', { 'text-destructive': preCloseCheck.trialBalance.periodAmount !== 0 }]"
                >
                  {{ $n(preCloseCheck.trialBalance.periodAmount, 'decimal') }}
                </p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('period.management.trialBalance.endingAmount') }}</p>
                <p
                  :class="['text-2xl font-bold', { 'text-destructive': preCloseCheck.trialBalance.endingAmount !== 0 }]"
                >
                  {{ $n(preCloseCheck.trialBalance.endingAmount, 'decimal') }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </template>

    <!-- Open but not current period -->
    <div
      v-else-if="isOpen"
      class="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center"
    >
      <BookOpen class="text-muted-foreground mb-3 size-10" />
      <p class="text-muted-foreground text-sm font-medium">
        {{ periodLabel() }}
      </p>
      <p class="text-muted-foreground mt-1 text-xs">
        {{ $t('period.management.notCurrent') }}
      </p>
    </div>

    <!-- Already closed period -->
    <div
      v-else-if="isClosed"
      class="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center"
    >
      <p class="text-muted-foreground text-sm font-medium">
        {{ periodLabel() }}
      </p>
      <p class="text-muted-foreground mt-1 text-xs">
        {{ $t('period.management.alreadyClosed') }}
      </p>
    </div>
  </PageFrame>
</template>
