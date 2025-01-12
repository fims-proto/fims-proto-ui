<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import type { Page } from '@domain/types'
import { PeriodService, type Period } from '@domain/general-ledger'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()

const periods = ref<Page<Period>>()
const selectedPeriod = ref<Period>()
const pageable = ref({ page: 1, size: 10 })

onMounted(load)

async function load() {
  periods.value = (await PeriodService.getPeriods(props.sobId, pageable.value)).data
}

function onSelect(selected: Period) {
  router.push({
    name: 'ledgerList',
    params: {
      sobId: props.sobId,
      periodId: selected.id,
    },
  })
}
</script>

<template>
  <div>
    <DataTable
      :value="periods?.content"
      v-model:selection="selectedPeriod"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      @update:selection="onSelect"
    >
      <Column :header="t('period.title')">
        <template #body="{ data }">
          <span>{{
            t('period.periodText', {
              fiscalYear: data.fiscalYear,
              number: data.periodNumber,
            })
          }}</span>
          <Tag v-if="data.isCurrent" :value="t('period.current')" severity="info" class="ml-1" />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
