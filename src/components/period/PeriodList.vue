<script setup lang="ts">
import { computed, toRefs } from 'vue'
import { useRouter } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'

import { columns } from './columns'
import { usePeriodStore } from '@/store/period'
import { type Period } from '@/services/general-ledger'
import { PERIOD_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const periodStore = usePeriodStore()
const bus = useEventBus(PERIOD_CHANGED)

const { allPeriods } = toRefs(periodStore.state)

const sortedPeriods = computed(() =>
  [...allPeriods.value].sort((a, b) => {
    if (a.fiscalYear !== b.fiscalYear) return b.fiscalYear - a.fiscalYear
    return b.periodNumber - a.periodNumber
  }),
)

// Refresh the store after a period close so badges update
bus.on(() => periodStore.action.refreshPeriods(props.sobId))

function handleRowClick(row: Period) {
  router.push({ name: 'periodDetail', params: { sobId: props.sobId, periodId: row.id } })
}
</script>

<template>
  <PageFrame :title="$t('period.listTitle', [sortedPeriods.length])" no-scroll>
    <DataTable :columns="columns" :data="sortedPeriods" :on-row-click="handleRowClick" />
  </PageFrame>
</template>
