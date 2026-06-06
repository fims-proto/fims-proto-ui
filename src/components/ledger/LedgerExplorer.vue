<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import AccountInput from '@/components/account/AccountInput.vue'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { LedgerService } from '@/services/general-ledger/ledger'
import type { LedgerDimensionSummaryItem, LedgerEntry } from '@/services/general-ledger/ledger'
import type { Period } from '@/services/general-ledger'
import type { AccountDetail } from '@/services/general-ledger/account/types'
import { AccountService } from '@/services/general-ledger/account'
import { DimensionService } from '@/services/dimension'
import type { DimensionCategory } from '@/services/dimension'
import { useAccountStore } from '@/store/account'
import { usePeriodStore } from '@/store/period'

import { createLedgerColumns, createDimensionOptionColumns, createTransactionColumns } from './columns'
import { treefyLedgersFromLeaves, filterLedgersByBalance } from './treefy'
import type { LedgerTreeNode } from './treefy'

type ViewMode = 'account' | 'dimension' | 'transactions'

const props = defineProps<{
  sobId: string
  fromPeriod?: string
  toPeriod?: string
  accountId?: string
  dimensionCategoryId?: string
  dimensionOptionId?: string
  view?: string
}>()

const route = useRoute()
const router = useRouter()
const { allAccounts } = toRefs(useAccountStore().state)
const { allPeriods } = toRefs(usePeriodStore().state)

// --- Derived from props (no local filter state) ---

const selectedAccount = computed(() => allAccounts.value.find((a) => a.id === props.accountId))

const currentView = computed<ViewMode>(() => {
  if (props.view === 'dimension' || props.view === 'transactions') return props.view
  return 'account'
})

function toPeriodString(period: Period): string {
  return `${period.fiscalYear}-${String(period.periodNumber).padStart(2, '0')}`
}

function parsePeriod(str: string | undefined): Period | undefined {
  if (!str) return undefined
  const [y, m] = str.split('-').map(Number)
  return allPeriods.value.find((p) => p.fiscalYear === y && p.periodNumber === m)
}

const initialFromPeriod = computed(() => parsePeriod(props.fromPeriod))
const initialToPeriod = computed(() => parsePeriod(props.toPeriod))

// --- Local state: fetched data only ---

const accountDetail = ref<AccountDetail | undefined>()
const allCategories = ref<DimensionCategory[]>([])

const ledgers = ref<LedgerTreeNode[]>([])
const ledgersHasMore = ref(false)
const ledgersPage = ref(1)
const ledgersTotal = ref(0)

const dimensionOptions = ref<LedgerDimensionSummaryItem[]>([])
const dimensionOptionsHasMore = ref(false)
const dimensionOptionsPage = ref(1)
const dimensionOptionsTotal = ref(0)

const transactions = ref<LedgerEntry[]>([])
const transactionsHasMore = ref(false)
const transactionsPage = ref(1)
const transactionsTotal = ref(0)

const isLoading = ref(false)

// --- Computed UI state ---

const accountDimensionCategories = computed(() => accountDetail.value?.dimensionCategories ?? [])

const availableCategories = computed<Array<{ id: string; name: string }>>(() => {
  if (props.accountId) return accountDimensionCategories.value
  return allCategories.value
})

const accountViewEnabled = computed(() => !props.accountId)
const dimensionViewEnabled = computed(() => !!props.dimensionCategoryId && !props.dimensionOptionId)
const transactionsViewEnabled = computed(() => !!(props.accountId || props.dimensionOptionId))

const runningBalances = computed(() => {
  if (!props.accountId) return [] as number[]
  let balance = 0
  return transactions.value.map((entry) => {
    balance += entry.amount
    return balance
  })
})

const ledgerColumns = computed(() => createLedgerColumns())

const dimensionOptionColumns = computed(() => createDimensionOptionColumns())

const transactionColumns = computed(() => createTransactionColumns(runningBalances))

// --- Navigation helpers ---

function pushQuery(patch: Record<string, string | undefined>) {
  router.push({ query: { ...route.query, ...patch } })
}

// Returns the most specific enabled view given the remaining filter state.
// Used when clearing a filter to land on a sensible default.
function bestView(
  accountId: string | undefined,
  dimensionCategoryId: string | undefined,
  dimensionOptionId: string | undefined,
): ViewMode {
  if (accountId || dimensionOptionId) return 'transactions'
  if (dimensionCategoryId) return 'dimension'
  return 'account'
}

function handleRangeSelected(start: Period, end: Period) {
  pushQuery({ fromPeriod: toPeriodString(start), toPeriod: toPeriodString(end) })
}

async function handleAccountChange(accountId: string | undefined) {
  if (!accountId) {
    accountDetail.value = undefined
    pushQuery({ accountId: undefined, view: bestView(undefined, props.dimensionCategoryId, props.dimensionOptionId) })
    return
  }
  const { data } = await AccountService.getAccountById(props.sobId, accountId)
  accountDetail.value = data
  const categories = data?.dimensionCategories ?? []
  const categoryStillValid = props.dimensionCategoryId && categories.some((c) => c.id === props.dimensionCategoryId)
  if (categoryStillValid) {
    pushQuery({ accountId, view: 'transactions' })
  } else {
    pushQuery({ accountId, dimensionCategoryId: undefined, dimensionOptionId: undefined, view: 'transactions' })
  }
}

function handleCategoryChange(categoryId: string | undefined) {
  if (categoryId) {
    pushQuery({ dimensionCategoryId: categoryId, dimensionOptionId: undefined, view: 'dimension' })
  } else {
    pushQuery({
      dimensionCategoryId: undefined,
      dimensionOptionId: undefined,
      view: bestView(props.accountId, undefined, undefined),
    })
  }
}

function handleOptionChange(optionId: string | undefined) {
  if (optionId) {
    // Setting an option without an account → go to account view to see per-account breakdown
    pushQuery({ dimensionOptionId: optionId, view: props.accountId ? 'transactions' : 'account' })
  } else {
    pushQuery({ dimensionOptionId: undefined, view: bestView(props.accountId, props.dimensionCategoryId, undefined) })
  }
}

function handleViewChange(value: unknown) {
  if (typeof value === 'string') {
    const patch: Record<string, string | undefined> = { view: value }
    if (value === 'dimension') patch.dimensionOptionId = undefined
    pushQuery(patch)
  }
}

// --- Data loading ---

// Load all-categories list once (when no account is selected we need all categories)
watch(
  () => props.sobId,
  async (sobId) => {
    const { data } = await DimensionService.getDimensionCategories(sobId, { page: 1, size: 100 })
    if (data) allCategories.value = data.content
  },
  { immediate: true },
)

// Fetch account detail whenever accountId prop changes
watch(
  () => props.accountId,
  async (id) => {
    if (!id) {
      accountDetail.value = undefined
      return
    }
    if (accountDetail.value?.id === id) return
    const { data } = await AccountService.getAccountById(props.sobId, id)
    accountDetail.value = data
  },
  { immediate: true },
)

// Main data watch: reload page 1 whenever any filter or view changes
watch(
  () =>
    [
      props.fromPeriod,
      props.toPeriod,
      props.accountId,
      props.dimensionCategoryId,
      props.dimensionOptionId,
      props.view,
    ] as const,
  async ([from, to]) => {
    if (!from || !to) return
    isLoading.value = true
    ledgersPage.value = 1
    dimensionOptionsPage.value = 1
    transactionsPage.value = 1
    try {
      const loads: Promise<void>[] = []
      if (currentView.value === 'account') {
        loads.push(loadLedgers(from, to, 1))
      } else if (currentView.value === 'transactions' && (props.accountId || props.dimensionOptionId)) {
        loads.push(loadTransactions(from, to, 1))
      }
      if (props.dimensionCategoryId) {
        loads.push(loadDimensionOptions(from, to, 1))
      }
      await Promise.all(loads)
    } finally {
      isLoading.value = false
    }
  },
  { immediate: true },
)

async function loadLedgers(from: string, to: string, page: number) {
  ledgersPage.value = page
  const { data } = await LedgerService.getLedgersPage(props.sobId, from, to, props.dimensionOptionId, {
    page,
    size: 40,
  })
  if (data) {
    const tree = filterLedgersByBalance(treefyLedgersFromLeaves(data.content, allAccounts.value))
    ledgers.value = page === 1 ? tree : tree // tree is always rebuilt from scratch
    ledgersTotal.value = data.numberOfElements
    ledgersHasMore.value = data.pageNumber < data.totalPage
  }
}

async function loadDimensionOptions(from: string, to: string, page: number) {
  if (!props.dimensionCategoryId) return
  dimensionOptionsPage.value = page
  const { data } = await LedgerService.getDimensionOptions(
    props.sobId,
    props.dimensionCategoryId,
    from,
    to,
    props.accountId,
    { page, size: 40 },
  )
  if (data) {
    dimensionOptions.value = page === 1 ? data.content : [...dimensionOptions.value, ...data.content]
    dimensionOptionsTotal.value = data.numberOfElements
    dimensionOptionsHasMore.value = data.pageNumber < data.totalPage
  }
}

async function loadTransactions(from: string, to: string, page: number) {
  transactionsPage.value = page
  const { data } = await LedgerService.getTransactions(
    props.sobId,
    from,
    to,
    props.accountId,
    props.dimensionOptionId,
    { page, size: 40 },
  )
  if (data) {
    transactions.value = page === 1 ? data.content : [...transactions.value, ...data.content]
    transactionsTotal.value = data.numberOfElements
    transactionsHasMore.value = data.pageNumber < data.totalPage
  }
}

async function loadMore() {
  if (!props.fromPeriod || !props.toPeriod) return
  if (currentView.value === 'account') await loadLedgers(props.fromPeriod, props.toPeriod, ledgersPage.value + 1)
  else if (currentView.value === 'dimension')
    await loadDimensionOptions(props.fromPeriod, props.toPeriod, dimensionOptionsPage.value + 1)
  else if (currentView.value === 'transactions')
    await loadTransactions(props.fromPeriod, props.toPeriod, transactionsPage.value + 1)
}

const hasMore = computed(() => {
  if (currentView.value === 'account') return ledgersHasMore.value
  if (currentView.value === 'dimension') return dimensionOptionsHasMore.value
  return transactionsHasMore.value
})

const loadedCount = computed(() => {
  if (currentView.value === 'account') return ledgers.value.length
  if (currentView.value === 'dimension') return dimensionOptions.value.length
  return transactions.value.length
})

const totalCount = computed(() => {
  if (currentView.value === 'account') return ledgersTotal.value
  if (currentView.value === 'dimension') return dimensionOptionsTotal.value
  return transactionsTotal.value
})
</script>

<template>
  <PageFrame :title="$t('ledger.title')" no-scroll>
    <template #end>
      <PeriodSelector
        :sob-id="sobId"
        mode="range"
        :initial-start="initialFromPeriod"
        :initial-end="initialToPeriod"
        @range-selected="handleRangeSelected"
      />
    </template>

    <div class="flex h-full flex-col gap-3">
      <!-- Filter bar + toggle group on one line -->
      <div class="flex shrink-0 flex-wrap items-end gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('account.accountTitle') }}</span>
          <AccountInput
            :model-value="selectedAccount"
            class="w-64"
            @update:model-value="handleAccountChange($event?.id)"
          />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.dimensionCategory') }}</span>
          <Select
            :model-value="dimensionCategoryId ?? 'none'"
            :disabled="!availableCategories.length"
            @update:model-value="handleCategoryChange($event !== 'none' ? ($event as string) : undefined)"
          >
            <SelectTrigger class="w-40">
              <SelectValue :placeholder="$t('ledger.dimensionCategory')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{{ $t('ledger.explorer.noDimensionCategory') }}</SelectItem>
              <SelectItem v-for="cat in availableCategories" :key="cat.id" :value="cat.id">
                {{ cat.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.dimensionOption') }}</span>
          <Select
            :model-value="dimensionOptionId ?? 'none'"
            :disabled="!dimensionCategoryId"
            @update:model-value="handleOptionChange($event !== 'none' ? ($event as string) : undefined)"
          >
            <SelectTrigger class="w-40">
              <SelectValue :placeholder="$t('ledger.dimensionOption')" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">{{ $t('ledger.explorer.noDimensionCategory') }}</SelectItem>
              <SelectItem v-for="opt in dimensionOptions" :key="opt.dimensionOption.id" :value="opt.dimensionOption.id">
                {{ opt.dimensionOption.name }}
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.viewMode.label') }}</span>
          <ToggleGroup type="single" :model-value="currentView" @update:model-value="handleViewChange">
            <ToggleGroupItem value="account" :disabled="!accountViewEnabled">
              {{ $t('ledger.viewMode.account') }}
            </ToggleGroupItem>
            <ToggleGroupItem value="dimension" :disabled="!dimensionViewEnabled">
              {{ $t('ledger.viewMode.dimension') }}
            </ToggleGroupItem>
            <ToggleGroupItem value="transactions" :disabled="!transactionsViewEnabled">
              {{ $t('ledger.viewMode.transactions') }}
            </ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <!-- Table area -->
      <div class="min-h-0 flex-1 overflow-auto">
        <template v-if="currentView === 'account'">
          <DataTable
            :columns="ledgerColumns"
            :data="ledgers"
            :is-loading="isLoading"
            :get-sub-rows="(row) => row.children"
            :on-row-click="(row) => handleAccountChange(row.accountId)"
            initial-expanded
            hide-toolbar
            bordered
          />
        </template>

        <template v-else-if="currentView === 'dimension'">
          <DataTable
            :columns="dimensionOptionColumns"
            :data="dimensionOptions"
            :is-loading="isLoading"
            :on-row-click="
              (item) =>
                pushQuery({
                  dimensionOptionId: item.dimensionOption.id,
                  view: props.accountId ? 'transactions' : 'account',
                })
            "
            hide-toolbar
            bordered
          />
        </template>

        <template v-else-if="currentView === 'transactions'">
          <DataTable
            :columns="transactionColumns"
            :data="transactions"
            :is-loading="isLoading"
            :on-row-click="
              (entry) => router.push({ name: 'journalDetail', params: { sobId, journalId: entry.journalId } })
            "
            hide-toolbar
            bordered
          />
        </template>

        <div v-if="hasMore" class="mt-2">
          <Button variant="secondary" class="w-full font-normal" :disabled="isLoading" @click="loadMore">
            {{ isLoading ? $t('common.loading') : $t('common.loadMore', [loadedCount, totalCount]) }}
          </Button>
        </div>
      </div>
    </div>
  </PageFrame>
</template>
