<script setup lang="ts">
import { ref, computed, toRefs, watch } from 'vue'
import { ReportService, type Item, type Report } from '@domain/report'
import { useI18n } from 'vue-i18n'
import type { Entry, Header } from './types'
import { buildReportHeaders, buildReportEntries } from './helper'
import { PeriodService, type Period } from '@domain/general-ledger'
import { AppForm, AppLabel } from '../reusable/form'
import type { Page } from '@domain/types'
import { useSobStore } from '@store/sob'
import { useRouter } from 'vue-router'
import { useToastStore } from '@store/toast'
import ItemDetail from './ItemDetail.vue'

const props = defineProps<{
  sobId: string
  reportId: string
}>()

const { t, n } = useI18n()
const { currentPeriod } = toRefs(useSobStore().state)
const router = useRouter()
const toast = useToastStore()

const report = ref<Report>()
const reportHeaders = ref<Header[]>([])
const reportEntries = ref<Entry[][]>([])
const expendedEntries = ref<{ [key: string]: boolean }>({})
const generateDialog = ref(false)
const generateReportModel = ref<{ title?: string; amountTypes?: string[]; period?: Period }>({})
const periods = ref<Page<Period>>()
const periodOptions = ref<Period[]>([])
const periodSelectLoading = ref(false)
const periodText = computed(
  () =>
    report.value &&
    report.value.period &&
    t('period.periodText', {
      fiscalYear: report.value.period.fiscalYear,
      number: report.value.period.periodNumber,
    }),
)

watch(() => props.reportId, load, { immediate: true })

async function load() {
  report.value = (await ReportService.getReportById(props.sobId, props.reportId)).data
  if (report.value) {
    reportHeaders.value = buildReportHeaders(report.value)
    reportEntries.value = buildReportEntries(report.value)
  }
}

async function loadPeriods(init?: boolean) {
  if (init) {
    periods.value = (await PeriodService.getPeriods(props.sobId)).data
    periodOptions.value = periods.value?.content ?? []
    return
  }
  if (!periods.value || periods.value.pageNumber >= periods.value.totalPage) {
    return
  }
  periods.value = (
    await PeriodService.getPeriods(props.sobId, { page: periods.value.pageNumber + 1, size: periods.value.pageSize })
  ).data
  periodOptions.value = periodOptions.value.concat(periods.value?.content ?? [])
}

async function onGenerateDialogOpen() {
  await loadPeriods(true)
  generateReportModel.value = {
    period: currentPeriod.value,
    amountTypes: report.value?.amountTypes,
    title: report.value?.title,
  }
  onPeriodSelect()
  generateDialog.value = true
}

async function onLoadPeriods() {
  periodSelectLoading.value = true
  await loadPeriods()
  periodSelectLoading.value = false
}

function onPeriodSelect() {
  if (generateReportModel.value.period?.periodNumber === 12 && report.value?.class === 'income_statement') {
    generateReportModel.value.amountTypes = ['last_year_amount', 'year_to_date_amount']
  } else {
    generateReportModel.value.amountTypes = report.value?.amountTypes
  }
}

async function onGenerate() {
  if (!generateReportModel.value.period || !report.value) {
    return
  }

  const { data: newReport, exception } = await ReportService.generateReport(props.sobId, report.value.id, {
    title: generateReportModel.value.title,
    amountTypes: generateReportModel.value.amountTypes,
    periodFiscalYear: generateReportModel.value.period.fiscalYear,
    periodNumber: generateReportModel.value.period.periodNumber,
  })
  if (exception) {
    return
  }
  generateDialog.value = false
  toast.action.add({ severity: 'success', detail: t('report.msg.generateCompleted') })

  router.push({
    name: 'reportDetail',
    params: {
      sobId: props.sobId,
      reportId: newReport?.id,
    },
  })
}

async function onRegenerate() {
  if (!report.value) {
    return
  }
  const { exception } = await ReportService.regenerateReport(props.sobId, report.value.id)
  if (exception) {
    return
  }
  await load()
  toast.action.add({ severity: 'success', detail: t('report.msg.regenerateCompleted') })
}

async function onItemUpdate(id: string) {
  onExpansionToggle(id)
  await load()
}

function onExpansionToggle(id: string) {
  if (expendedEntries.value[id]) {
    delete expendedEntries.value[id]
  } else {
    expendedEntries.value[id] = true
  }
}
</script>

<template>
  <div v-if="report">
    <div class="mb-4 flex w-full items-baseline gap-2">
      <h1>{{ report.title }}</h1>
      <Tag v-if="report.template" :value="t('report.template')" severity="info" class="ml-1" />
      <span>{{ periodText }}</span>
      <div class="ml-auto">
        <Button v-if="report.template" :label="t('report.btn.generate')" @click="onGenerateDialogOpen" />
        <Button v-else :label="t('report.btn.regenerate')" @click="onRegenerate" />
      </div>
    </div>

    <div class="flex">
      <DataTable
        v-for="(header, tableIndex) in reportHeaders"
        :key="tableIndex"
        v-model:expanded-rows="expendedEntries"
        :value="reportEntries[tableIndex]"
        data-key="id"
        show-gridlines
        size="small"
        class="flex-1"
      >
        <Column :header="header.title">
          <template #body="{ data, index: rowIndex }: { data: Entry; index: number }">
            <div :class="['group flex text-nowrap', { 'select-none opacity-0': !data.text }]">
              <!-- indentation and prefix -->
              <div class="text-right" :style="{ width: `${data.indentation}rem` }">
                <span
                  v-if="data.isBreakdownItem"
                  :class="{ 'select-none opacity-0': reportEntries[tableIndex][rowIndex - 1]?.isBreakdownItem }"
                >
                  {{ t('report.chart.breakdown') }}
                </span>
                <span v-if="data.displaySumFactor">{{ t(`report.chart.sumFactorEnum.${data.sumFactor}`) }}</span>
              </div>
              <!-- text -->
              <span>{{ data.text || '空' }}</span>
              <!-- actions -->
              <div class="text-primary-color invisible ml-2 flex items-center text-sm group-hover:visible">
                <!-- edit button -->
                <button
                  v-if="report.template && data.isEditable"
                  class="flex items-center gap-1"
                  @click="onExpansionToggle(data.id)"
                >
                  <i class="pi pi-file-edit text-xs!" />
                  <span>{{ t('action.edit') }}</span>
                </button>
                <!-- detail button -->
                <button
                  v-if="!report.template && data.isEditable"
                  class="flex items-center gap-1"
                  @click="onExpansionToggle(data.id)"
                >
                  <i class="pi pi-search text-xs!" />
                  <span>{{ t('action.detail') }}</span>
                </button>
              </div>
            </div>
          </template>
        </Column>

        <Column :header="header.lineNumber" class="w-16">
          <template #body="{ data }: { data: Entry }">
            {{ data.lineNumber }}
          </template>
        </Column>

        <Column
          v-for="(amountTypeTitle, atIndex) in header.amountTypes"
          :key="amountTypeTitle"
          :header="amountTypeTitle"
          class="text-right"
        >
          <template #body="{ data }: { data: Entry }">
            {{ data.amounts && data.amounts[atIndex] ? n(data.amounts[atIndex], 'decimal') : '' }}
          </template>
        </Column>

        <template #expansion="{ data }: { data: Item }">
          <ItemDetail
            :sob-id="sobId"
            :report-id="report.id"
            :report-class="report.class"
            :report-is-template="report.template"
            :amount-types="header.amountTypes"
            :item="data"
            @close="onExpansionToggle(data.id)"
            @update="onItemUpdate(data.id)"
          />
        </template>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="generateDialog" :header="t('report.btn.generate')" :modal="true" :closable="false">
    <AppForm :model="generateReportModel" class="flex flex-col gap-2" @submit="onGenerate">
      <AppLabel for="report-title-input">{{ t('report.title') }}</AppLabel>
      <InputText id="report-title-input" v-model="generateReportModel.title" class="w-full" />

      <label>{{ t('report.amountType') }}</label>
      <span>{{ generateReportModel.amountTypes?.map((at) => t(`report.amountTypeEnum.${at}`)).join(', ') }}</span>

      <AppLabel required>{{ t('report.period') }}</AppLabel>
      <Select
        v-model="generateReportModel.period"
        :options="periodOptions"
        :option-label="(p: Period) => t('period.periodText', { fiscalYear: p.fiscalYear, number: p.periodNumber })"
        :virtual-scroller-options="{
          lazy: true,
          onLazyLoad: onLoadPeriods,
          itemSize: periods?.pageSize,
          showLoader: true,
          loading: periodSelectLoading,
          delay: 250,
        }"
        class="w-full"
        @change="onPeriodSelect"
      />

      <div class="flex justify-end gap-2">
        <Button :label="t('action.cancel')" text severity="secondary" @click="generateDialog = false" />
        <Button :label="t('action.save')" type="submit" />
      </div>
    </AppForm>
  </Dialog>
</template>
