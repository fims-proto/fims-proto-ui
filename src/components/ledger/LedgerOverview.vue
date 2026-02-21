<script setup lang="ts">
import { ref } from 'vue'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { viewColumns } from './columns'
import { treefyLedgers, type LedgerTreeNode } from './treefy'
import { LedgerService } from '@/services/general-ledger/ledger'
import { CLASS_OPTIONS } from '@/services/general-ledger'

const props = defineProps<{
  sobId: string
}>()

const ledgers = ref<LedgerTreeNode[]>([])
const isLoading = ref(false)
const selectedPeriodId = ref<string>()

async function loadLedgers(periodId: string) {
  if (!periodId) {
    ledgers.value = []
    return
  }

  selectedPeriodId.value = periodId
  isLoading.value = true
  try {
    const response = await LedgerService.getLedgersInPeriod(props.sobId, periodId, { page: 1, size: 1000 })
    if (response.data?.content) {
      ledgers.value = treefyLedgers(response.data.content)
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <PageFrame :title="$t('ledger.title')" no-scroll>
    <template #end>
      <PeriodSelector :sob-id="sobId" @period-change="loadLedgers" />
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
      initial-expanded
      bordered
    />
  </PageFrame>
</template>
