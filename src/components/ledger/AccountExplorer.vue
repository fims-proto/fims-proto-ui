<script setup lang="ts">
import { computed, onMounted, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { PageFrame } from '@/components/common/page'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import AccountInput from '@/components/account/AccountInput.vue'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { LedgerService } from '@/services/general-ledger/ledger'
import type { LedgerSummary, LedgerEntry } from '@/services/general-ledger/ledger'
import type { Period } from '@/services/general-ledger'
import type { AccountSlim } from '@/services/general-ledger/account/types'
import { useAccountStore } from '@/store/account'

const props = defineProps<{
  sobId: string
}>()

const { n } = useI18n()
const route = useRoute()
const router = useRouter()
const { allAccounts } = toRefs(useAccountStore().state)

const selectedAccount = ref<AccountSlim | undefined>()
const fromPeriod = ref<Period | undefined>()
const toPeriod = ref<Period | undefined>()

const summary = ref<LedgerSummary | undefined>()
const entries = ref<LedgerEntry[]>([])
const entriesTotal = ref(0)
const entriesHasMore = ref(false)
const entriesPage = ref(1)

const isLoading = ref(false)

function toPeriodString(period: Period): string {
  return `${period.fiscalYear}-${String(period.periodNumber).padStart(2, '0')}`
}

const hasData = computed(() => !!selectedAccount.value && !!fromPeriod.value && !!toPeriod.value)

const runningBalances = computed(() => {
  if (!summary.value) return []
  let balance = summary.value.openingAmount
  return entries.value.map((entry) => {
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

watch([selectedAccount, fromPeriod, toPeriod], async ([account, from, to]) => {
  if (!account || !from || !to) return
  await loadData(account, from, to)
})

async function loadData(account: AccountSlim, from: Period, to: Period) {
  isLoading.value = true
  entries.value = []
  entriesPage.value = 1

  const fromStr = toPeriodString(from)
  const toStr = toPeriodString(to)

  try {
    const { data: summaryData } = await LedgerService.getLedgerSummary(props.sobId, account.id, fromStr, toStr)
    summary.value = summaryData

    const { data: entriesData } = await LedgerService.getLedgerEntries(props.sobId, account.id, fromStr, toStr)
    if (entriesData) {
      entries.value = entriesData.content
      entriesTotal.value = entriesData.numberOfElements
      entriesHasMore.value = entriesData.pageNumber < entriesData.totalPage
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

function handleRangeSelected(start: Period, end: Period) {
  fromPeriod.value = start
  toPeriod.value = end
}

function goToJournal(journalId: string) {
  router.push({ name: 'journalDetail', params: { sobId: props.sobId, journalId: journalId } })
}
</script>

<template>
  <PageFrame :title="$t('ledger.explorer.title')" no-scroll>
    <template #end>
      <AccountInput v-model="selectedAccount" class="w-64" />
      <PeriodSelector :sob-id="sobId" mode="range" @range-selected="handleRangeSelected" />
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

        <!-- Entry table -->
        <div class="min-h-0 flex-1 overflow-auto rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{{ $t('ledger.explorer.date') }}</TableHead>
                <TableHead>{{ $t('ledger.explorer.journalNumber') }}</TableHead>
                <TableHead>{{ $t('ledger.explorer.entryText') }}</TableHead>
                <TableHead class="text-right">{{ $t('ledger.explorer.debitAmount') }}</TableHead>
                <TableHead class="text-right">{{ $t('ledger.explorer.creditAmount') }}</TableHead>
                <TableHead class="text-right">{{ $t('ledger.explorer.runningBalance') }}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-if="entries.length">
                <TableRow v-for="(entry, index) in entries" :key="entry.journalId + index">
                  <TableCell>{{ entry.transactionDate }}</TableCell>
                  <TableCell>
                    <Button variant="link" class="h-auto p-0" @click="goToJournal(entry.journalId)">
                      {{ entry.journalNumber }}
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
    </div>
  </PageFrame>
</template>
