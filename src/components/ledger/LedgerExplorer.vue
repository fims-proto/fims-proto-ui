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
import type { AccountSlim, AccountDetail } from '@/services/general-ledger/account/types'
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
const accountHasDimensions = computed(() => accountDimensionCategories.value.length > 0)

const availableCategories = computed<Array<{ id: string; name: string }>>(() => {
  if (props.accountId) return accountDimensionCategories.value
  return allCategories.value
})

const transactionsEnabled = computed(() => !!(props.accountId || props.dimensionOptionId))
const aggregatedViewEnabled = computed(() => !props.accountId || accountHasDimensions.value)

const runningBalances = computed(() => {
  if (!props.accountId) return [] as number[]
  let balance = 0
  return transactions.value.map((entry) => {
    balance += entry.amount
    return balance
  })
})

// The aggregated toggle item shows 'dimension' when the selected account has dimensions
// (even before a category is chosen), or when no account is selected but a category is set.
const aggregatedView = computed<'account' | 'dimension'>(() => {
  if (props.accountId && accountHasDimensions.value) return 'dimension'
  if (!props.accountId && props.dimensionCategoryId) return 'dimension'
  return 'account'
})

const ledgerColumns = computed(() =>
  createLedgerColumns((row) => {
    if (!row.isLeaf) return
    pushQuery({ accountId: row.accountId, view: 'transactions' })
  }),
)

const dimensionOptionColumns = computed(() =>
  createDimensionOptionColumns((item) => {
    pushQuery({ dimensionOptionId: item.dimensionOption.id, view: 'account' })
  }),
)

const transactionColumns = computed(() => createTransactionColumns(props.sobId, runningBalances))

// --- Navigation helpers ---

function pushQuery(patch: Record<string, string | undefined>) {
  router.push({ query: { ...route.query, ...patch } })
}

function handleRangeSelected(start: Period, end: Period) {
  pushQuery({ fromPeriod: toPeriodString(start), toPeriod: toPeriodString(end) })
}

async function handleAccountChange(account: AccountSlim | undefined) {
  if (!account) {
    pushQuery({ accountId: undefined, dimensionCategoryId: undefined, dimensionOptionId: undefined, view: 'account' })
    return
  }
  const { data } = await AccountService.getAccountById(props.sobId, account.id)
  const categories = data?.dimensionCategories ?? []
  if (categories.length && !props.dimensionOptionId) {
    // Auto-select the first category and switch to dimension view
    const firstCategoryId = props.dimensionCategoryId ?? categories[0]?.id
    if (!firstCategoryId) return
    pushQuery({
      accountId: account.id,
      dimensionCategoryId: firstCategoryId,
      dimensionOptionId: undefined,
      view: 'dimension',
    })
  } else {
    pushQuery({ accountId: account.id, view: 'transactions' })
  }
}

function handleCategoryChange(value: unknown) {
  const categoryId = typeof value === 'string' && value !== 'none' ? value : undefined
  if (categoryId) {
    pushQuery({ dimensionCategoryId: categoryId, dimensionOptionId: undefined, view: 'dimension' })
  } else {
    pushQuery({ dimensionCategoryId: undefined, dimensionOptionId: undefined })
  }
}

function handleOptionChange(value: unknown) {
  const optionId = typeof value === 'string' && value !== 'none' ? value : undefined
  if (optionId) {
    const newView: ViewMode = props.accountId ? 'transactions' : 'account'
    pushQuery({ dimensionOptionId: optionId, view: newView })
  } else {
    pushQuery({ dimensionOptionId: undefined })
  }
}

function handleViewChange(value: unknown) {
  if (typeof value === 'string') pushQuery({ view: value })
}

// --- Data loading ---

// Fetch account detail whenever accountId prop changes
watch(
  () => props.accountId,
  async (id) => {
    accountDetail.value = undefined
    if (id) {
      const { data } = await AccountService.getAccountById(props.sobId, id)
      accountDetail.value = data
    }
  },
  { immediate: true },
)

// Load all-categories list once (when no account is selected we need all categories)
watch(
  () => props.sobId,
  async (sobId) => {
    const { data } = await DimensionService.getDimensionCategories(sobId, { page: 1, size: 100 })
    if (data) allCategories.value = data.content
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
      if (currentView.value === 'account') {
        await loadLedgers(from, to, 1)
      } else if (currentView.value === 'dimension' && props.dimensionCategoryId) {
        await loadDimensionOptions(from, to, 1)
      } else if (currentView.value === 'transactions' && (props.accountId || props.dimensionOptionId)) {
        await loadTransactions(from, to, 1)
      }
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
          <AccountInput :model-value="selectedAccount" class="w-64" @update:model-value="handleAccountChange" />
        </div>

        <div v-if="availableCategories.length" class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.dimensionCategory') }}</span>
          <Select :model-value="dimensionCategoryId ?? 'none'" @update:model-value="handleCategoryChange($event)">
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

        <div v-if="dimensionCategoryId" class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.dimensionOption') }}</span>
          <Select :model-value="dimensionOptionId ?? 'none'" @update:model-value="handleOptionChange($event)">
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

        <!-- View toggle: aggregated view (account OR dimension) + transactions -->
        <div class="flex flex-col gap-1">
          <span class="text-muted-foreground text-xs">{{ $t('ledger.viewMode.label') }}</span>
          <ToggleGroup type="single" :model-value="currentView" @update:model-value="handleViewChange">
            <ToggleGroupItem v-if="aggregatedViewEnabled" :value="aggregatedView">
              {{ aggregatedView === 'dimension' ? $t('ledger.viewMode.dimension') : $t('ledger.viewMode.account') }}
            </ToggleGroupItem>
            <ToggleGroupItem v-if="transactionsEnabled" value="transactions">
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
            hide-toolbar
            bordered
          />
        </template>

        <template v-else-if="currentView === 'transactions'">
          <DataTable :columns="transactionColumns" :data="transactions" :is-loading="isLoading" hide-toolbar bordered />
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
