<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { PeriodService, type Page, type Period } from '../../domain'
import type { DataTableRowClickEvent } from 'primevue/datatable'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const router = useRouter()

const periods = ref<Page<Period>>()
const selectedPeriod = ref<Period>()
const pageable = ref({ page: 1, size: 10 })

const refresh = async () => {
  periods.value = (await PeriodService.getPeriods(props.sobId, pageable.value)).data
}

onMounted(refresh)

const onRowClick = (event: DataTableRowClickEvent) => {
  router.push({
    name: 'ledgerList',
    params: {
      sobId: props.sobId,
      periodId: event.data.id,
    },
  })
}
</script>

<template>
  <div>
    <DataTable
      v-model:selection="selectedPeriod"
      :value="periods?.content"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      @row-click="onRowClick"
    >
      <Column header="" style="width: 4rem">
        <template #body="{ data }">
          <span>{{ data.isCurrent ? t('period.current') : '' }}</span>
        </template>
      </Column>
      <Column :header="t('period.title')">
        <template #body="{ data }">
          <span>{{
            t('period.periodText', {
              fiscalYear: data.fiscalYear,
              number: data.periodNumber,
            })
          }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
