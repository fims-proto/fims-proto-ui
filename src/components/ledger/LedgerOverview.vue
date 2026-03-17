<script setup lang="ts">
import { computed, ref, toRefs } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { createViewColumns } from './columns'
import { treefyLedgers, filterLedgersByBalance, type LedgerTreeNode } from './treefy'
import { LedgerService } from '@/services/general-ledger/ledger'
import { CLASS_OPTIONS, type Period } from '@/services/general-ledger'
import { usePeriodStore } from '@/store/period'

const props = defineProps<{
  sobId: string
  fromPeriod?: string
  toPeriod?: string
}>()

const route = useRoute()
const router = useRouter()
const { allPeriods } = toRefs(usePeriodStore().state)

const ledgers = ref<LedgerTreeNode[]>([])
const isLoading = ref(false)

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
const columns = computed(() => createViewColumns(props.fromPeriod, props.toPeriod))

function handleRangeSelected(start: Period, end: Period) {
  router.replace({
    query: {
      ...route.query,
      fromPeriod: toPeriodString(start),
      toPeriod: toPeriodString(end),
    },
  })
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
        :initial-start="initialFromPeriod"
        :initial-end="initialToPeriod"
        @range-selected="handleRangeSelected"
      />
    </template>

    <DataTable
      :columns="columns"
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
