<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ChevronRight, ChevronDown } from 'lucide-vue-next'

import { PageFrame } from '@/components/common/page'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AccountInput from '@/components/account/AccountInput.vue'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { LedgerService } from '@/services/general-ledger/ledger'
import type { LedgerSummary, LedgerEntry, AuxiliaryLedgerSummary } from '@/services/general-ledger/ledger'
import type { Period } from '@/services/general-ledger'
import type { Account } from '@/services/general-ledger/account/types'
import { useAccountStore } from '@/store/account'

const props = defineProps<{
  sobId: string
}>()

const NO_DIMENSION = '__none__'

const { n, t } = useI18n()
const route = useRoute()
const router = useRouter()
const { allAccounts } = toRefs(useAccountStore().state)

const selectedAccount = ref<Account | undefined>()
const selectedCategoryKey = ref<string | undefined>()
const fromPeriod = ref<Period | undefined>()
const toPeriod = ref<Period | undefined>()

const summary = ref<LedgerSummary | undefined>()
const entries = ref<LedgerEntry[]>([])
const entriesTotal = ref(0)
const entriesHasMore = ref(false)
const entriesPage = ref(1)

const auxSummaries = ref<AuxiliaryLedgerSummary[]>([])
const auxHasMore = ref(false)

const expandedAuxId = ref<string | undefined>()
const expandedEntries = ref<LedgerEntry[]>([])

const isLoading = ref(false)

function toPeriodString(period: Period): string {
  return `${period.fiscalYear}-${String(period.periodNumber).padStart(2, '0')}`
}

const hasData = computed(() => !!selectedAccount.value && !!fromPeriod.value && !!toPeriod.value)

const auxiliaryCategories = computed(() => selectedAccount.value?.auxiliaryCategories ?? [])

const selectedCategoryTitle = computed(() => {
  if (!selectedCategoryKey.value) return t('ledger.explorer.dimensionMember')
  return auxiliaryCategories.value.find((c) => c.key === selectedCategoryKey.value)?.title
    ?? t('ledger.explorer.dimensionMember')
})

const runningBalances = computed(() => {
  if (!summary.value) return []
  let balance = summary.value.openingAmount
  return entries.value.map((entry) => {
    balance += entry.amount
    return balance
  })
})

const expandedRunningBalances = computed(() => {
  const auxSummary = auxSummaries.value.find((a) => a.auxiliaryAccountId === expandedAuxId.value)
  let balance = auxSummary?.openingAmount ?? 0
  return expandedEntries.value.map((entry) => {
    balance += entry.amount
    return balance
  })
})

onMounted(() => {
  const accountIdFromQuery = route.query.accountId as string | undefined
  if (accountIdFromQuery) {
    selectedAccount.value = allAccounts.value.find((a) => a.id === accountIdFromQuery)
  }
})

watch(selectedAccount, (newAccount) => {
  if (!newAccount) return
  const categoryKeys = (newAccount.auxiliaryCategories ?? []).map((c) => c.key)
  if (selectedCategoryKey.value && !categoryKeys.includes(selectedCategoryKey.value)) {
    selectedCategoryKey.value = undefined
  }
})

watch([selectedAccount, fromPeriod, toPeriod], async ([account, from, to]) => {
  if (!account || !from || !to) return
  await loadData(account, from, to)
})

watch(selectedCategoryKey, async () => {
  expandedAuxId.value = undefined
  expandedEntries.value = []
  if (!selectedAccount.value || !fromPeriod.value || !toPeriod.value) return
  await loadData(selectedAccount.value, fromPeriod.value, toPeriod.value)
})

async function loadData(account: Account, from: Period, to: Period) {
  isLoading.value = true
  entries.value = []
  auxSummaries.value = []
  entriesPage.value = 1

  const fromStr = toPeriodString(from)
  const toStr = toPeriodString(to)

  try {
    const { data: summaryData } = await LedgerService.getLedgerSummary(props.sobId, account.id, fromStr, toStr)
    summary.value = summaryData

    if (selectedCategoryKey.value) {
      const { data: auxData } = await LedgerService.getAuxiliaryLedgerSummary(
        props.sobId,
        account.id,
        selectedCategoryKey.value,
        fromStr,
        toStr,
      )
      if (auxData) {
        auxSummaries.value = auxData.content
        auxHasMore.value = auxData.pageNumber < auxData.totalPage
      }
    } else {
      const { data: entriesData } = await LedgerService.getLedgerEntries(props.sobId, account.id, fromStr, toStr)
      if (entriesData) {
        entries.value = entriesData.content
        entriesTotal.value = entriesData.numberOfElements
        entriesHasMore.value = entriesData.pageNumber < entriesData.totalPage
      }
    }
  } finally {
    isLoading.value = false
  }
}

async function loadMoreEntries() {
  if (!selectedAccount.value || !fromPeriod.value || !toPeriod.value) return
  entriesPage.value++
  const { data } = await LedgerService.getLedgerEntries(
    props.sobId,
    selectedAccount.value.id,
    toPeriodString(fromPeriod.value),
    toPeriodString(toPeriod.value),
    { page: entriesPage.value, size: 40 },
  )
  if (data) {
    entries.value = [...entries.value, ...data.content]
    entriesHasMore.value = data.pageNumber < data.totalPage
  }
}

async function toggleAuxExpand(aux: AuxiliaryLedgerSummary) {
  if (expandedAuxId.value === aux.auxiliaryAccountId) {
    expandedAuxId.value = undefined
    expandedEntries.value = []
    return
  }

  expandedAuxId.value = aux.auxiliaryAccountId
  expandedEntries.value = []

  if (!selectedAccount.value || !fromPeriod.value || !toPeriod.value) return
  const { data } = await LedgerService.getLedgerEntries(
    props.sobId,
    selectedAccount.value.id,
    toPeriodString(fromPeriod.value),
    toPeriodString(toPeriod.value),
    { page: 1, size: 40 },
    aux.auxiliaryAccountId,
  )
  if (data) {
    expandedEntries.value = data.content
  }
}

function handleRangeSelected(start: Period, end: Period) {
  fromPeriod.value = start
  toPeriod.value = end
}

function goToVoucher(voucherId: string) {
  router.push({ name: 'voucherDetail', params: { sobId: props.sobId, voucherId } })
}
</script>

<template>
  <PageFrame :title="$t('ledger.explorer.title')" no-scroll>
    <template #end>
      <AccountInput v-model="selectedAccount" class="w-64" />
      <PeriodSelector :sob-id="sobId" mode="range" @range-selected="handleRangeSelected" />
      <Select
        v-if="auxiliaryCategories.length > 0"
        :model-value="selectedCategoryKey ?? NO_DIMENSION"
        @update:model-value="selectedCategoryKey = $event === NO_DIMENSION ? undefined : ($event as string)"
      >
        <SelectTrigger class="w-40">
          <SelectValue :placeholder="$t('ledger.explorer.dimension')" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem :value="NO_DIMENSION">{{ $t('ledger.explorer.noDimension') }}</SelectItem>
          <SelectItem v-for="category in auxiliaryCategories" :key="category.key" :value="category.key">
            {{ category.title }}
          </SelectItem>
        </SelectContent>
      </Select>
    </template>

    <div class="flex h-full flex-col gap-4">
      <template v-if="!hasData">
        <div class="text-muted-foreground flex h-full items-center justify-center text-sm">
          {{ $t('ledger.explorer.noAccountSelected') }}
        </div>
      </template>

      <template v-else>
        <!-- Balance summary card -->
        <Card class="shrink-0">
          <CardContent>
            <div class="grid grid-cols-4 gap-4">
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('ledger.explorer.openingBalance') }}</p>
                <p class="text-2xl font-bold">{{ summary ? n(summary.openingAmount, 'decimal') : '—' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('ledger.explorer.periodDebit') }}</p>
                <p class="text-2xl font-bold">{{ summary ? n(summary.periodDebit, 'decimal') : '—' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('ledger.explorer.periodCredit') }}</p>
                <p class="text-2xl font-bold">{{ summary ? n(summary.periodCredit, 'decimal') : '—' }}</p>
              </div>
              <div class="space-y-1">
                <p class="text-muted-foreground text-sm">{{ $t('ledger.explorer.endingBalance') }}</p>
                <p class="text-2xl font-bold">{{ summary ? n(summary.endingAmount, 'decimal') : '—' }}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <!-- No dimension: entry table -->
        <template v-if="!selectedCategoryKey">
          <div class="min-h-0 flex-1 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{{ $t('ledger.explorer.date') }}</TableHead>
                  <TableHead>{{ $t('ledger.explorer.voucherNumber') }}</TableHead>
                  <TableHead>{{ $t('ledger.explorer.entryText') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.debitAmount') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.creditAmount') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.runningBalance') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="entries.length">
                  <TableRow v-for="(entry, index) in entries" :key="entry.voucherId + index">
                    <TableCell>{{ entry.transactionDate }}</TableCell>
                    <TableCell>
                      <Button variant="link" class="h-auto p-0" @click="goToVoucher(entry.voucherId)">
                        {{ entry.voucherNumber }}
                      </Button>
                    </TableCell>
                    <TableCell>{{ entry.text }}</TableCell>
                    <TableCell class="text-right tabular-nums">
                      {{ entry.amount > 0 ? n(entry.amount, 'decimal') : '' }}
                    </TableCell>
                    <TableCell class="text-right tabular-nums">
                      {{ entry.amount < 0 ? n(-entry.amount, 'decimal') : '' }}
                    </TableCell>
                    <TableCell class="text-right tabular-nums">
                      {{ n(runningBalances[index] ?? 0, 'decimal') }}
                    </TableCell>
                  </TableRow>
                </template>
                <template v-else>
                  <TableRow>
                    <TableCell colspan="6" class="h-24 text-center">{{ $t('common.noData') }}</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
          <div v-if="entriesHasMore" class="shrink-0">
            <Button variant="secondary" class="w-full font-normal" :disabled="isLoading" @click="loadMoreEntries">
              {{ isLoading ? $t('common.loading') : $t('common.loadMore', [entries.length, entriesTotal]) }}
            </Button>
          </div>
        </template>

        <!-- Dimension mode: auxiliary summary table -->
        <template v-else>
          <div class="min-h-0 flex-1 overflow-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead class="w-8" />
                  <TableHead>{{ selectedCategoryTitle }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.openingBalance') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.debitAmount') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.creditAmount') }}</TableHead>
                  <TableHead class="text-right">{{ $t('ledger.explorer.endingBalance') }}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <template v-if="auxSummaries.length">
                  <template v-for="aux in auxSummaries" :key="aux.auxiliaryAccountId">
                    <TableRow class="hover:bg-muted/50 cursor-pointer" @click="toggleAuxExpand(aux)">
                      <TableCell>
                        <ChevronDown v-if="expandedAuxId === aux.auxiliaryAccountId" class="size-4" />
                        <ChevronRight v-else class="size-4" />
                      </TableCell>
                      <TableCell class="font-medium">{{ aux.auxiliaryAccountTitle }}</TableCell>
                      <TableCell class="text-right tabular-nums">{{ n(aux.openingAmount, 'decimal') }}</TableCell>
                      <TableCell class="text-right tabular-nums">{{ n(aux.periodDebit, 'decimal') }}</TableCell>
                      <TableCell class="text-right tabular-nums">{{ n(aux.periodCredit, 'decimal') }}</TableCell>
                      <TableCell class="text-right tabular-nums">{{ n(aux.endingAmount, 'decimal') }}</TableCell>
                    </TableRow>

                    <!-- Expanded entries for this auxiliary value -->
                    <TableRow v-if="expandedAuxId === aux.auxiliaryAccountId" class="bg-muted/30">
                      <TableCell colspan="6" class="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{{ $t('ledger.explorer.date') }}</TableHead>
                              <TableHead>{{ $t('ledger.explorer.voucherNumber') }}</TableHead>
                              <TableHead>{{ $t('ledger.explorer.entryText') }}</TableHead>
                              <TableHead class="text-right">{{ $t('ledger.explorer.debitAmount') }}</TableHead>
                              <TableHead class="text-right">{{ $t('ledger.explorer.creditAmount') }}</TableHead>
                              <TableHead class="text-right">{{ $t('ledger.explorer.runningBalance') }}</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            <template v-if="expandedEntries.length">
                              <TableRow v-for="(entry, index) in expandedEntries" :key="entry.voucherId + index">
                                <TableCell>{{ entry.transactionDate }}</TableCell>
                                <TableCell>
                                  <Button variant="link" class="h-auto p-0" @click.stop="goToVoucher(entry.voucherId)">
                                    {{ entry.voucherNumber }}
                                  </Button>
                                </TableCell>
                                <TableCell>{{ entry.text }}</TableCell>
                                <TableCell class="text-right tabular-nums">
                                  {{ entry.amount > 0 ? n(entry.amount, 'decimal') : '' }}
                                </TableCell>
                                <TableCell class="text-right tabular-nums">
                                  {{ entry.amount < 0 ? n(-entry.amount, 'decimal') : '' }}
                                </TableCell>
                                <TableCell class="text-right tabular-nums">
                                  {{ n(expandedRunningBalances[index] ?? 0, 'decimal') }}
                                </TableCell>
                              </TableRow>
                            </template>
                            <template v-else>
                              <TableRow>
                                <TableCell colspan="6" class="h-16 text-center">
                                  {{ $t('common.noData') }}
                                </TableCell>
                              </TableRow>
                            </template>
                          </TableBody>
                        </Table>
                      </TableCell>
                    </TableRow>
                  </template>
                </template>
                <template v-else>
                  <TableRow>
                    <TableCell colspan="6" class="h-24 text-center">{{ $t('common.noData') }}</TableCell>
                  </TableRow>
                </template>
              </TableBody>
            </Table>
          </div>
        </template>
      </template>
    </div>
  </PageFrame>
</template>
