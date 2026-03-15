<script setup lang="ts">
import { computed, ref } from 'vue'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { viewColumns } from './columns'
import { treefyLedgers, filterLedgersByBalance, type LedgerTreeNode } from './treefy'
import { LedgerService } from '@/services/general-ledger/ledger'
import { CLASS_OPTIONS, type Period } from '@/services/general-ledger'
import { useExplorerPeriodStore } from '@/store/explorer-period'

const props = defineProps<{
  sobId: string
}>()

const ledgers = ref<LedgerTreeNode[]>([])
const isLoading = ref(false)

const explorerPeriodStore = useExplorerPeriodStore()
const persistedSelection = computed(() => explorerPeriodStore.state.selections[props.sobId])

function toPeriodString(period: Period): string {
  return `${period.fiscalYear}-${String(period.periodNumber).padStart(2, '0')}`
}

function handleRangeSelected(start: Period, end: Period) {
  explorerPeriodStore.action.setRange(props.sobId, start, end)
  loadLedgers(start, end)
}

async function loadLedgers(startPeriod: Period, endPeriod: Period) {
  isLoading.value = true
  try {
    const response = await LedgerService.getLedgers(props.sobId, toPeriodString(startPeriod), toPeriodString(endPeriod))
    if (response.data) {
      ledgers.value = filterLedgersByBalance(treefyLedgers(response.data))
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <PageFrame :title="$t('ledger.title')">
    <template #end>
      <PeriodSelector
        :sob-id="sobId"
        mode="range"
        :initial-start="persistedSelection?.startPeriod"
        :initial-end="persistedSelection?.endPeriod"
        @range-selected="handleRangeSelected"
      />
    </template>

    <DataTable
      :columns="viewColumns"
      :data="ledgers"
      :faceted-filters="[
        {
          name: 'class',
          title: $t('account.class'),
          options: CLASS_OPTIONS.map((c) => ({ label: $t(`account.classEnum.${c}`), value: c })),
        },
      ]"
      :get-sub-rows="(row) => row.children"
      bordered
    />
  </PageFrame>
</template>
