<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { AlertCircle, FolderOpen, Plus, X } from 'lucide-vue-next'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { ConfirmationButton } from '@/components/common/confirmation'
import PeriodSelector from '@/components/period/PeriodSelector.vue'
import RowDialog from './RowDialog.vue'
import BalanceSheetView from './views/BalanceSheetView.vue'
import SingleColumnView from './views/SingleColumnView.vue'
import { useUnsavedChanges, UnsavedChangesDialog } from '@/components/common/unsaved-guard'

import {
  ReportService,
  type Report,
  type Row,
  UpdateReportRequestSchema,
  type UpdateReportRequest,
  type UpdateRowRequest,
  CLASS_OPTIONS,
} from '@/services/report'
import { CashFlowItemService, type CashFlowItem } from '@/services/general-ledger'
import type { Period } from '@/services/general-ledger/period'
import { usePeriodStore } from '@/store/period'
import { buildReportDisplayData } from './report-display-helper'
import type { Entry } from './report-display-types'
import { useToastStore } from '@/store/toast'
import { transformRowToRequest } from './report-transforms'
import {
  cleanTemporaryRowIds,
  createCustomRowCode,
  deleteRow,
  getInsertionEvaluationIndex,
  getReferenceableRows,
  insertRow,
  type InsertPosition,
  renumberRows,
  rowsInEvaluationOrder,
  updateReportRowsFromForm,
  updateRow,
} from './report-row-tree'

const props = defineProps<{
  sobId: string
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()
const periodStore = usePeriodStore()

const selectedClass = ref<(typeof CLASS_OPTIONS)[number]>('balance_sheet')
const selectedPeriod = ref<Period | null>(null)
const isTemplateMode = ref(false)
const report = ref<Report | undefined>()
const cashFlowItems = ref<CashFlowItem[]>([])
const cashFlowItemsLoaded = ref(false)
const isLoading = ref(false)
const isNotFound = ref(false)
const isGenerating = ref(false)

const isEditing = ref(false)
const isSaving = ref(false)
const isRegenerating = ref(false)
const warningDismissed = ref(false)

const rowDialogOpen = ref(false)
const selectedRow = ref<Row>()
type RowDialogMode = 'view' | 'edit' | 'create'
const rowDialogMode = ref<RowDialogMode>('view')
const insertPosition = ref<InsertPosition | null>(null)
const referenceRow = ref<Row | null>(null)

const reportForm = useForm({
  validationSchema: toTypedSchema(UpdateReportRequestSchema),
})

const displayData = computed(() => (report.value ? buildReportDisplayData(report.value) : undefined))
const isBalanceSheet = computed(() => displayData.value?.class === 'balance_sheet')
const periodText = computed(() => {
  if (!selectedPeriod.value) return null
  return t('period.periodText', [selectedPeriod.value.fiscalYear, selectedPeriod.value.periodNumber])
})
const reportTitle = computed(() => t(`report.classEnum.${selectedClass.value}`))
const referenceableRows = computed(() => {
  const rows = reportForm.values.rows ?? []
  const fallbackIndex =
    rowDialogMode.value === 'create'
      ? getInsertionEvaluationIndex(rows, referenceRow.value?.id, insertPosition.value)
      : undefined
  return getReferenceableRows(rows, selectedRow.value?.id, fallbackIndex)
})

const { confirmOpen, onConfirmLeave, onCancelLeave } = useUnsavedChanges(computed(() => reportForm.meta.value.dirty))

function periodToParam(p: Period): string {
  return `${p.fiscalYear}-${p.periodNumber.toString().padStart(2, '0')}`
}

function paramToPeriod(s: string): Period | undefined {
  const parts = s.split('-')
  if (parts.length < 2 || !parts[0] || !parts[1]) return undefined
  const year = parseInt(parts[0])
  const num = parseInt(parts[1])
  return periodStore.state.allPeriods.find((p) => p.fiscalYear === year && p.periodNumber === num)
}

function syncToUrl() {
  const query: Record<string, string> = { class: selectedClass.value }
  if (isTemplateMode.value) {
    query.mode = 'template'
  } else if (selectedPeriod.value) {
    query.period = periodToParam(selectedPeriod.value)
  }
  router.replace({ query })
}

async function loadCashFlowItems() {
  if (cashFlowItemsLoaded.value) return
  const { data } = await CashFlowItemService.getCashFlowItems(props.sobId)
  if (data) {
    cashFlowItems.value = [...data].sort((a, b) => a.sequence - b.sequence)
    cashFlowItemsLoaded.value = true
  }
}

async function load() {
  if (!selectedClass.value) return

  isLoading.value = true
  isNotFound.value = false
  report.value = undefined

  try {
    await loadCashFlowItems()

    if (isTemplateMode.value) {
      const { data } = await ReportService.getTemplate(props.sobId, selectedClass.value)
      setLoadedReport(data)
    } else if (selectedPeriod.value) {
      const { data } = await ReportService.getReportByClassAndPeriod(
        props.sobId,
        selectedClass.value,
        periodToParam(selectedPeriod.value),
      )
      if (data) {
        setLoadedReport(data)
      } else {
        isNotFound.value = true
      }
    }
  } finally {
    isLoading.value = false
  }
}

function setLoadedReport(loadedReport: Report | undefined) {
  if (!loadedReport) return

  const formValues = transformToForm(loadedReport)
  renumberRows(loadedReport.class, formValues.rows)
  updateReportRowsFromForm(loadedReport.rows, formValues.rows)
  report.value = loadedReport
  reportForm.resetForm({ values: formValues }, { force: true })
}

watch([selectedClass, selectedPeriod], () => {
  syncToUrl()
  if (!isTemplateMode.value) {
    isEditing.value = false
  }
  warningDismissed.value = false
  load()
})

watch(isTemplateMode, () => {
  syncToUrl()
  load()
})

watch(
  () => periodStore.state.allPeriods,
  (periods) => {
    if (!periods.length) return

    const queryClass = route.query.class
    const queryPeriod = route.query.period
    const queryMode = route.query.mode

    if (queryClass && CLASS_OPTIONS.includes(queryClass as (typeof CLASS_OPTIONS)[number])) {
      selectedClass.value = queryClass as (typeof CLASS_OPTIONS)[number]
    }

    if (queryMode === 'template') {
      isTemplateMode.value = true
      isEditing.value = true
    } else if (queryPeriod && typeof queryPeriod === 'string') {
      const period = paramToPeriod(queryPeriod)
      if (period) selectedPeriod.value = period
    } else {
      const current = periodStore.state.currentPeriod
      if (current) selectedPeriod.value = current
    }
  },
  { immediate: true },
)

function transformToForm(r: Report): UpdateReportRequest {
  return {
    title: r.title,
    rows: r.rows.map(transformRowToRequest),
  }
}

function createNewRow(reference: Row, position: InsertPosition): Row {
  return {
    id: `new-${crypto.randomUUID()}`,
    rowCode: createCustomRowCode(reportForm.values.rows ?? []),
    text: '',
    indent: position === 'child' ? reference.indent + 1 : reference.indent,
    showLineNo: true,
    sumFactor: 0,
    displaySumFactor: false,
    canEdit: true,
    canMove: true,
    canAddChild: position !== 'child',
    expression: {
      kind: 'none',
    },
  }
}

function handleRowClick(entry: Entry) {
  if (!entry.text) return
  selectedRow.value = entry
  rowDialogMode.value = entry.canEdit && isEditing.value ? 'edit' : 'view'
  insertPosition.value = null
  referenceRow.value = null
  rowDialogOpen.value = true
}

function handleInsertBefore(entry: Entry) {
  openCreateDialog(entry, 'before')
}

function handleInsertChild(entry: Entry) {
  openCreateDialog(entry, 'child')
}

function handleInsertAfter(entry: Entry) {
  openCreateDialog(entry, 'after')
}

function openCreateDialog(entry: Entry, position: InsertPosition) {
  referenceRow.value = entry
  insertPosition.value = position
  selectedRow.value = createNewRow(entry, position)
  rowDialogMode.value = 'create'
  rowDialogOpen.value = true
}

function handleDeleteRow(row: Row) {
  if (!row.id) return

  const rows = cloneRows(reportForm.values.rows ?? [])
  if (deleteRow(rows, row.id)) {
    applyRows(rows)
  }
}

function handleRowSaved(updatedRow: UpdateRowRequest) {
  const rows = cloneRows(reportForm.values.rows ?? [])

  if (rowDialogMode.value === 'create') {
    const refRow = referenceRow.value
    const position = insertPosition.value
    if (!refRow || !position) return

    if (!insertRow(rows, refRow.id, updatedRow, position)) {
      return
    }
  } else if (updatedRow.id && !updateRow(rows, updatedRow.id, () => updatedRow)) {
    return
  }

  applyRows(rows)
  rowDialogMode.value = 'view'
  insertPosition.value = null
  referenceRow.value = null
}

function applyRows(rows: UpdateRowRequest[]) {
  renumberRows(selectedClass.value, rows)
  reportForm.setFieldValue('rows', rows)
  reportForm.setFieldTouched('rows', true)

  if (report.value) {
    updateReportRowsFromForm(report.value.rows, rows)
  }
}

async function onSave() {
  if (!report.value) return

  renumberRows(selectedClass.value, reportForm.values.rows ?? [])
  if (!validateRowReferences(reportForm.values.rows ?? [])) {
    return
  }

  const validation = await reportForm.validate()
  if (!validation.valid) {
    toast.action.error(t('report.msg.validationFailed'))
    return
  }

  isSaving.value = true
  try {
    const cleanedRequest = cleanTemporaryRowIds(reportForm.values as UpdateReportRequest)
    const { exception: updateException } = await ReportService.updateReport(
      props.sobId,
      report.value.id,
      cleanedRequest,
    )
    if (updateException) return

    if (report.value.template) {
      toast.action.success(t('report.msg.templateUpdateCompleted'))
    } else {
      const { exception: recalculateException } = await ReportService.recalculateReport(props.sobId, report.value.id)
      if (recalculateException) {
        toast.action.warn(t('report.msg.updateSuccessButRecalculateFailed'))
      } else {
        toast.action.success(t('report.msg.updateCompleted'))
      }
    }

    await load()
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}

async function handleRegenerate() {
  if (!report.value) return
  isRegenerating.value = true
  try {
    const { exception } = await ReportService.regenerateReport(props.sobId, report.value.id)
    if (exception) return
    toast.action.success(t('report.msg.regenerateCompleted'))
    await load()
  } finally {
    isRegenerating.value = false
  }
}

async function handleGenerate() {
  if (!selectedPeriod.value) return
  isGenerating.value = true
  try {
    const { data, exception } = await ReportService.generateOrRegenerate(
      props.sobId,
      selectedClass.value,
      periodToParam(selectedPeriod.value),
    )
    if (exception) return
    if (data) {
      isNotFound.value = false
      setLoadedReport(data)
      toast.action.success(t('report.msg.generateCompleted'))
    }
  } finally {
    isGenerating.value = false
  }
}

function enterTemplateEdit() {
  isTemplateMode.value = true
  isEditing.value = true
}

function exitTemplateEdit() {
  isTemplateMode.value = false
  isEditing.value = false
}

function handleClassChange(value: unknown) {
  if (typeof value === 'string' && CLASS_OPTIONS.includes(value as (typeof CLASS_OPTIONS)[number])) {
    selectedClass.value = value as (typeof CLASS_OPTIONS)[number]
  }
}

function handlePeriodSelected(period: Period) {
  selectedPeriod.value = period
}

function handleCancel() {
  isEditing.value = false
  load()
}

function cloneRows(rows: UpdateRowRequest[]): UpdateRowRequest[] {
  return JSON.parse(JSON.stringify(rows)) as UpdateRowRequest[]
}

function validateRowReferences(rows: UpdateRowRequest[]) {
  const seenCodes = new Set<string>()
  const allCodes = new Set<string>()

  for (const row of rowsInEvaluationOrder(rows)) {
    if (allCodes.has(row.rowCode)) {
      toast.action.error(t('report.msg.duplicateRowCode'))
      return false
    }

    allCodes.add(row.rowCode)

    for (const ref of row.expression.rowReferences ?? []) {
      if (!seenCodes.has(ref.rowCode)) {
        toast.action.error(t('report.msg.invalidRowReference'))
        return false
      }
    }

    seenCodes.add(row.rowCode)
  }

  return true
}
</script>

<template>
  <PageFrame
    :title="reportTitle"
    :secondary-title="!isTemplateMode && periodText ? periodText : undefined"
    :dirty-indicator="reportForm.meta.value.dirty"
  >
    <template #end>
      <PeriodSelector
        v-if="!isTemplateMode"
        mode="single"
        :sob-id="props.sobId"
        :initial-period="selectedPeriod ?? undefined"
        @period-selected="handlePeriodSelected"
      />

      <Select :model-value="selectedClass" @update:model-value="handleClassChange">
        <SelectTrigger class="w-42">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem v-for="cls in CLASS_OPTIONS" :key="cls" :value="cls">
            {{ $t(`report.classEnum.${cls}`) }}
          </SelectItem>
        </SelectContent>
      </Select>

      <template v-if="!isTemplateMode">
        <template v-if="!isEditing">
          <ConfirmationButton
            v-if="report"
            variant="outline"
            :disabled="isRegenerating"
            :message="$t('report.msg.confirmRegenerate')"
            @confirm="handleRegenerate"
          >
            {{ $t('report.btn.regenerate') }}
          </ConfirmationButton>
          <Button variant="outline" @click="enterTemplateEdit">{{ $t('report.btn.editTemplate') }}</Button>
          <Button v-if="report" variant="outline" @click="isEditing = true">{{ $t('action.edit') }}</Button>
        </template>
        <template v-else>
          <Button :disabled="isSaving || !reportForm.meta.value.valid" @click="onSave">{{ $t('action.save') }}</Button>
          <Button variant="ghost" @click="handleCancel">{{ $t('action.cancel') }}</Button>
        </template>
      </template>

      <template v-else>
        <Button :disabled="isSaving || !reportForm.meta.value.valid" @click="onSave">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="exitTemplateEdit">{{ $t('report.btn.exitEditTemplate') }}</Button>
      </template>
    </template>

    <div
      v-if="!warningDismissed && !isTemplateMode && selectedPeriod && !selectedPeriod.isClosed && report"
      class="bg-warning/10 text-warning-foreground mb-4 flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-4 py-2 text-sm text-yellow-800"
    >
      <AlertCircle class="size-4 shrink-0" />
      <span>{{ $t('report.unclosedPeriodWarning') }}</span>
      <button class="ml-auto rounded p-0.5 hover:bg-yellow-100" @click="warningDismissed = true">
        <X class="size-4" />
      </button>
    </div>

    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 8" :key="i" class="bg-muted h-8 animate-pulse rounded" />
    </div>

    <template v-else-if="report && displayData">
      <BalanceSheetView
        v-if="isBalanceSheet"
        :display-data="displayData"
        :is-editing="isEditing"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
      />
      <SingleColumnView
        v-else
        :display-data="displayData"
        :is-editing="isEditing"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
      />
    </template>

    <div v-else-if="isNotFound && !isTemplateMode" class="mt-32 flex flex-col items-center gap-3">
      <FolderOpen class="text-muted-foreground/30" :size="96" :stroke-width="2" />
      <p class="text-muted-foreground text-base font-medium">{{ $t('report.emptyState.title') }}</p>
      <p class="text-muted-foreground/60 text-sm">{{ $t('report.emptyState.description') }}</p>
      <Button class="mt-2" :disabled="isGenerating" @click="handleGenerate">
        <Plus />
        {{ $t('action.create') }}
      </Button>
    </div>
  </PageFrame>

  <RowDialog
    v-if="selectedRow && report"
    v-model:open="rowDialogOpen"
    :row="selectedRow"
    :columns="report.columns"
    :report-class="report.class"
    :report-is-template="report.template"
    :cash-flow-items="cashFlowItems"
    :referenceable-rows="referenceableRows"
    :mode="rowDialogMode"
    @saved="handleRowSaved"
    @deleted="handleDeleteRow"
  />

  <UnsavedChangesDialog :open="confirmOpen" @confirm="onConfirmLeave" @cancel="onCancelLeave" />
</template>
