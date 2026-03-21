<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { CheckCircle2, XCircle, Loader2, RefreshCw, BookLock, BookOpen } from 'lucide-vue-next'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

import { PeriodService, type PreCloseCheck } from '@/services/general-ledger'
import { usePeriodStore } from '@/store/period'
import { useToastStore } from '@/store/toast'
import { useConfirmationStore } from '@/store/confirmation'
import { PERIOD_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t } = useI18n()
const periodStore = usePeriodStore()
const toastStore = useToastStore()
const confirmationStore = useConfirmationStore()
const bus = useEventBus(PERIOD_CHANGED)

const { allPeriods } = toRefs(periodStore.state)

const preCloseCheck = ref<PreCloseCheck | null>(null)
const isLoading = ref(false)
const isClosing = ref(false)

const period = computed(() => allPeriods.value.find((p) => p.id === props.periodId))
const isCurrent = computed(() => period.value?.isCurrent ?? false)
const isClosed = computed(() => period.value?.isClosed ?? false)
const isOpen = computed(() => !isCurrent.value && !isClosed.value)

const allChecksPassed = computed(
  () =>
    preCloseCheck.value != null &&
    preCloseCheck.value.unpostedJournals.passed &&
    preCloseCheck.value.trialBalance.passed &&
    preCloseCheck.value.profitAndLossBalance.passed,
)

const canClose = computed(() => isCurrent.value && allChecksPassed.value && !isClosing.value)

// Reload pre-close check whenever periodId changes
watch(period, () => load(), { immediate: true })

function checkIcon(passed?: boolean) {
  if (isLoading.value || preCloseCheck.value === null) return 'loading'
  return passed ? 'passed' : 'failed'
}

function periodLabel() {
  if (!period.value) return ''
  return t('period.periodText', [period.value.fiscalYear, period.value.periodNumber])
}

async function load() {
  if (!isCurrent.value) return
  isLoading.value = true
  preCloseCheck.value = null
  try {
    const { data } = await PeriodService.getPreCloseCheck(props.sobId, props.periodId)
    if (data) {
      preCloseCheck.value = data
    }
  } finally {
    isLoading.value = false
  }
}

function handleClose() {
  confirmationStore.action.confirm({
    title: t('common.confirmationHeader'),
    message: t('period.management.confirmClose'),
    onConfirm: async () => {
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
    },
  })
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
        <Button :disabled="!canClose" @click="handleClose">
          <Loader2 v-if="isClosing" class="size-4 animate-spin" />
          <BookLock v-else class="size-4" />
          {{ $t('period.management.closePeriod') }}
        </Button>
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
                v-if="checkIcon(preCloseCheck?.unpostedJournals.passed) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.unpostedJournals.passed) === 'passed'"
                class="size-5 text-green-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.unpostedJournals') }}
              <Badge
                v-if="preCloseCheck"
                :variant="preCloseCheck.unpostedJournals.passed ? 'default' : 'destructive'"
                class="ml-auto text-xs"
              >
                {{ $t('period.management.unpostedJournals.count', [preCloseCheck.unpostedJournals.count]) }}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <!-- Passed -->
            <p v-if="preCloseCheck.unpostedJournals.passed" class="text-muted-foreground text-sm">
              {{ $t('period.management.unpostedJournals.noUnposted') }}
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
                v-if="checkIcon(preCloseCheck?.profitAndLossBalance.passed) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.profitAndLossBalance.passed) === 'passed'"
                class="size-5 text-green-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.pnlBalance') }}
              <Button
                v-show="preCloseCheck && !preCloseCheck.profitAndLossBalance.passed"
                variant="ghost"
                size="sm"
                class="ml-auto"
              >
                {{ $t('period.management.pnlAccounts.carryForward') }}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <!-- Passed -->
            <p v-if="preCloseCheck.profitAndLossBalance.passed" class="text-muted-foreground text-sm">
              {{ $t('period.management.pnlAccounts.zeroed') }}
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

        <!-- Check 3: Trial Balance -->
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="flex items-center gap-2 text-base">
              <Loader2
                v-if="checkIcon(preCloseCheck?.trialBalance.passed) === 'loading'"
                class="text-muted-foreground size-5 animate-spin"
              />
              <CheckCircle2
                v-else-if="checkIcon(preCloseCheck?.trialBalance.passed) === 'passed'"
                class="size-5 text-green-500"
              />
              <XCircle v-else class="text-destructive size-5" />
              {{ $t('period.management.checkItems.trialBalance') }}
            </CardTitle>
            <CardDescription>{{ $t('period.management.trialBalance.description') }}</CardDescription>
          </CardHeader>
          <CardContent v-if="preCloseCheck">
            <div class="grid grid-cols-3 gap-4">
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
      <BookLock class="text-muted-foreground mb-3 size-10" />
      <p class="text-muted-foreground text-sm font-medium">
        {{ periodLabel() }}
      </p>
      <p class="text-muted-foreground mt-1 text-xs">
        {{ $t('period.management.alreadyClosed') }}
      </p>
    </div>
  </PageFrame>
</template>
