<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ReportService, type Report } from '@domain/report'
import type { Page } from '@domain/types'
import type { DataTablePageEvent } from 'primevue/datatable'
import { FilterFactory } from '@domain/filter'
import { useRouter } from 'vue-router'
import { injectContext } from './context'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const factory = new FilterFactory<Report>()
const router = useRouter()
const context = injectContext()

const reports = ref<Page<Report>>()
const pageable = ref({ page: 1, size: 10 })
const classFilter = ref('balance_sheet')
const classOptions = ref(['balance_sheet', 'income_statement'])

if (context?.refreshList) {
  context.refreshList.value = load
}

watch([() => pageable.value, classFilter], load, { immediate: true })

async function load() {
  const filter = classFilter.value ? factory.eq('class', classFilter.value) : undefined
  reports.value = (await ReportService.getReports(props.sobId, pageable.value, filter)).data
}

async function onPage(page: DataTablePageEvent) {
  pageable.value.page = page.page + 1
}

function onSelect(selected: Report) {
  router.push({
    name: 'reportDetail',
    params: {
      sobId: props.sobId,
      reportId: selected.id,
    },
  })
}
</script>

<template>
  <div>
    <SelectButton v-model="classFilter" :options="classOptions" class="mb-2">
      <template #option="{ option }">
        <span>{{ t(`report.classEnum.${option}`) }}</span>
      </template>
    </SelectButton>
    <DataTable
      :value="reports?.content"
      selection-mode="single"
      data-key="id"
      lazy
      paginator
      :rows="pageable.size"
      :total-records="reports?.numberOfElements"
      @page="onPage"
      @update:selection="onSelect"
    >
      <Column :header="t('report.title')">
        <template #body="{ data }">
          <span>{{ data.title }}</span>
          <Tag v-if="data.template" :value="t('report.template')" severity="info" class="ml-1" />
        </template>
      </Column>
      <Column :header="t('report.period')">
        <template #body="{ data }">
          {{
            data.period
              ? t('period.periodText', {
                  fiscalYear: data.period.fiscalYear,
                  number: data.period.periodNumber,
                })
              : ''
          }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
