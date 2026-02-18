<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventBus } from '@vueuse/core'
import { toTypedSchema } from '@vee-validate/zod'
import { useForm, Field as VeeField } from 'vee-validate'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import PeriodSelector from '@/components/period/PeriodSelector.vue'
import ItemDialog from './ItemDialog.vue'
import BalanceSheetView from './views/BalanceSheetView.vue'
import IncomeStatementView from './views/IncomeStatementView.vue'

import {
  ReportService,
  type Report,
  type Item,
  type Section,
  GenerateReportRequestSchema,
  UpdateReportRequestSchema,
  type UpdateReportRequest,
  type UpdateReportRequestSection,
  type UpdateReportRequestItem,
} from '@/services/report'
import type { Period } from '@/services/general-ledger/period'
import { buildReportDisplayData } from './report-display-helper'
import type { Entry } from './report-display-types'
import { useToastStore } from '@/store/toast'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'
import { useConfirmationStore } from '@/store/confirmation'
import { REPORT_CHANGED } from '@/services/event'
import { insertItemInTree, updateItemInTree, deleteItemFromTree } from '@/utils/tree-mutation'
import { transformItemToRequest, cleanTemporaryIds } from './report-transforms'

const props = defineProps<{
  sobId: string
  reportId: string
}>()

const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()
const unsavedChangesStore = useUnsavedChangesStore()
const confirmationStore = useConfirmationStore()
const bus = useEventBus(REPORT_CHANGED)

const report = ref<Report>()
const displayData = computed(() => (report.value ? buildReportDisplayData(report.value) : undefined))
const editDialogOpen = ref(false)
const selectedItem = ref<Item>()
const isRegenerating = ref(false)

const isEditing = ref(false)
const isSaving = ref(false)

// Item operation mode tracking
type ItemDialogMode = 'view' | 'edit' | 'create'
const itemDialogMode = ref<ItemDialogMode>('view')

type InsertPosition = 'before' | 'after' | 'child'
const insertPosition = ref<InsertPosition | null>(null)
const referenceItem = ref<Item | null>(null)

const periodDialogOpen = ref(false)
const selectedPeriod = ref<Period | null>(null)
const isGenerating = ref(false)

const generateForm = useForm({
  validationSchema: toTypedSchema(GenerateReportRequestSchema),
})

const reportForm = useForm({
  validationSchema: toTypedSchema(UpdateReportRequestSchema),
})

// Computed: is this a balance sheet (two-column layout)?
const isBalanceSheet = computed(() => displayData.value?.class === 'balance_sheet')

// Computed: period display text
const periodText = computed(() => {
  if (!report.value?.period) return null
  return t('period.periodText', {
    fiscalYear: report.value.period.fiscalYear,
    number: report.value.period.periodNumber,
  })
})

watch(() => props.reportId, reset, { immediate: true })

watch(selectedPeriod, (period) => {
  if (period && report.value) {
    const defaultTitle = `${report.value.title} ${period.fiscalYear}-${period.periodNumber}`
    generateForm.setFieldValue('title', defaultTitle)
    generateForm.setFieldValue('periodFiscalYear', period.fiscalYear)
    generateForm.setFieldValue('periodNumber', period.periodNumber)
  }
})

watch(
  () => reportForm.meta.value.dirty,
  (dirty) => {
    if (dirty) {
      unsavedChangesStore.action.enableProtection()
    } else {
      unsavedChangesStore.action.disableProtection()
    }
  },
)

async function load() {
  if (!props.reportId) {
    report.value = undefined
    return
  }

  const { data } = await ReportService.getReportById(props.sobId, props.reportId)
  if (data) {
    report.value = data

    const formValues = transformToForm(data)
    reportForm.resetForm({ values: formValues }, { force: true })
  }
}

function transformToForm(report: Report): UpdateReportRequest {
  function transformSection(section: Section): UpdateReportRequestSection {
    return {
      id: section.id,
      title: section.title,
      sections: section.sections?.map(transformSection),
      items: (section.items || []).map((item) => ({
        ...item,
        formulas: item.formulas?.map((formula) => ({
          id: formula.id,
          accountNumber: formula.account.accountNumber,
          sumFactor: formula.sumFactor,
          rule: formula.rule,
        })),
      })),
    }
  }

  return {
    title: report.title,
    amountTypes: report.amountTypes,
    sections: report.sections.map(transformSection),
  }
}

function createNewItem(referenceItem: Item, position: InsertPosition): Item {
  let level: number
  let isBreakdownItem: boolean
  let isAbleToAddChild: boolean

  if (position === 'child') {
    // Child item rules
    level = referenceItem.level + 1
    isBreakdownItem = true
    isAbleToAddChild = false
  } else {
    // Before/After rules - inherit from reference item
    level = referenceItem.level
    isBreakdownItem = referenceItem.isBreakdownItem ?? false
    isAbleToAddChild = !isBreakdownItem
  }

  return {
    id: `new-${crypto.randomUUID()}`, // Temporary UUID for frontend tracking (backend will create real ID)
    text: '',
    level,
    sumFactor: 0,
    dataSource: 'none',
    isEditable: true,
    isBreakdownItem,
    isAbleToAddChild,
    displaySumFactor: false,
  }
}

function handleRowClick(entry: Entry) {
  // Ignore clicks on blank-items
  if (!entry.text) return

  selectedItem.value = entry

  // Non-editable items always open in view mode
  if (!entry.isEditable) {
    itemDialogMode.value = 'view'
  } else {
    // Editable items: respect the isEditing state
    itemDialogMode.value = isEditing.value ? 'edit' : 'view'
  }

  editDialogOpen.value = true
}

function handleInsertBefore(entry: Entry) {
  referenceItem.value = entry
  insertPosition.value = 'before'
  selectedItem.value = createNewItem(entry, 'before')
  itemDialogMode.value = 'create'
  editDialogOpen.value = true
}

function handleInsertChild(entry: Entry) {
  referenceItem.value = entry
  insertPosition.value = 'child'
  selectedItem.value = createNewItem(entry, 'child')
  itemDialogMode.value = 'create'
  editDialogOpen.value = true
}

function handleInsertAfter(entry: Entry) {
  referenceItem.value = entry
  insertPosition.value = 'after'
  selectedItem.value = createNewItem(entry, 'after')
  itemDialogMode.value = 'create'
  editDialogOpen.value = true
}

function handleDeleteItem(entry: Entry) {
  // Use confirmation store for delete confirmation
  confirmationStore.action.confirm({
    title: t('common.confirmDelete'),
    message: t('report.msg.confirmDeleteItem'),
    onConfirm: () => {
      performDelete(entry)
    },
  })
}

function performDelete(entry: Entry) {
  const sections = reportForm.values.sections
  if (!sections) return

  // Delete from form data
  const formDeleted = deleteItemFromTree<UpdateReportRequestSection, UpdateReportRequestItem>(
    sections,
    (item) => item.id === entry.id,
  )

  if (formDeleted && report.value) {
    // Delete from report data
    deleteItemFromTree<Section, Item>(report.value.sections, (item) => item.id === entry.id)

    // Mark form as dirty
    reportForm.setFieldTouched('sections', true)
  }
}

function handleItemSaved(updatedItem: Item) {
  const sections = reportForm.values.sections
  if (!sections) return

  if (itemDialogMode.value === 'create') {
    // INSERT NEW ITEM
    const refItem = referenceItem.value
    const position = insertPosition.value
    if (!refItem || !position) return

    // Insert into form data (with formula transformation)
    const formInserted = insertItemInTree<UpdateReportRequestSection, Item, UpdateReportRequestItem>(
      sections,
      updatedItem,
      {
        findReference: (item) => item.id === refItem.id,
        transformItem: transformItemToRequest,
        position,
      },
    )

    if (formInserted && report.value) {
      // Insert into report data (no transformation needed)
      insertItemInTree<Section, Item>(report.value.sections, updatedItem, {
        findReference: (item) => item.id === refItem.id,
        position,
      })

      // Mark form as dirty
      reportForm.setFieldTouched('sections', true)
    }

    // Reset mode
    itemDialogMode.value = 'view'
    insertPosition.value = null
    referenceItem.value = null
  } else {
    // UPDATE EXISTING ITEM
    // Update form data (with formula transformation)
    const formUpdated = updateItemInTree<UpdateReportRequestSection, UpdateReportRequestItem>(
      sections,
      (item) => item.id === updatedItem.id,
      () => transformItemToRequest(updatedItem),
    )

    if (formUpdated && report.value) {
      // Update report data (no transformation needed)
      updateItemInTree<Section, Item>(
        report.value.sections,
        (item) => item.id === updatedItem.id,
        () => updatedItem,
      )

      // Mark form as dirty
      reportForm.setFieldTouched('sections', true)
    }
  }
}

/**
 * Regenerate report to recalculate amounts.
 */
async function handleRegenerate() {
  isRegenerating.value = true
  try {
    const { exception } = await ReportService.regenerateReport(props.sobId, props.reportId)
    if (exception) {
      return
    }
    toast.action.success(t('report.msg.regenerateCompleted'))
    await load()
  } finally {
    isRegenerating.value = false
  }
}

function handleClose() {
  router.push({ name: 'reportList', params: { sobId: props.sobId } })
}

async function reset() {
  isEditing.value = false
  await load()
}

async function onSave() {
  const validation = await reportForm.validate()
  if (!validation.valid) {
    toast.action.error(t('report.msg.validationFailed'))
    return
  }

  isSaving.value = true
  try {
    // Clean temporary IDs (starting with 'new-') before sending to backend
    const cleanedRequest = cleanTemporaryIds(reportForm.values as UpdateReportRequest)

    const { exception: updateException } = await ReportService.updateReport(props.sobId, props.reportId, cleanedRequest)

    if (updateException) {
      return
    }

    if (report.value?.template) {
      toast.action.success(t('report.msg.templateUpdateCompleted'))
    } else {
      const { exception: regenException } = await ReportService.regenerateReport(props.sobId, props.reportId)

      if (regenException) {
        toast.action.warn(t('report.msg.updateSuccessButRegenerateFailed'))
      } else {
        toast.action.success(t('report.msg.updateCompleted'))
      }
    }

    bus.emit()
    await load()
    isEditing.value = false
  } finally {
    isSaving.value = false
  }
}

/**
 * Handle period selection - receive full period object from PeriodSelector.
 */
function handlePeriodSelected(period: Period) {
  selectedPeriod.value = period
}

/**
 * Generate new report from template with selected period.
 */
async function handleGenerate() {
  // Validate form
  const validation = await generateForm.validate()
  if (!validation.valid) return

  const period = selectedPeriod.value
  if (!period) return

  isGenerating.value = true
  try {
    const { data: newReport, exception } = await ReportService.generateReport(props.sobId, props.reportId, {
      title: generateForm.values.title,
      periodFiscalYear: period.fiscalYear,
      periodNumber: period.periodNumber,
    })

    if (exception) {
      return
    }

    if (newReport) {
      toast.action.success(t('report.msg.generateCompleted'))
      bus.emit()
      // Navigate to the newly generated report
      router.push({
        name: 'reportDetail',
        params: { sobId: props.sobId, reportId: newReport.id },
      })
      // Close dialog and reset state
      periodDialogOpen.value = false
      handleDialogOpenChange(false)
    }
  } finally {
    isGenerating.value = false
  }
}

/**
 * Handle dialog open state change - reset state when closing.
 */
function handleDialogOpenChange(open: boolean) {
  if (!open) {
    selectedPeriod.value = null
    generateForm.resetForm()
    isGenerating.value = false
  }
}
</script>

<template>
  <!-- Report display -->
  <PageFrame v-if="report && displayData" :title="report.title" :dirty-indicator="reportForm.meta.value.dirty">
    <template #start>
      <!-- Report metadata -->
      <Badge variant="outline">{{ $t(`report.classEnum.${report.class}`) }}</Badge>
      <span v-if="periodText" class="text-muted-foreground text-sm">{{ periodText }}</span>
      <Badge v-if="report.template" variant="secondary">{{ $t('report.template') }}</Badge>
    </template>

    <template #end>
      <template v-if="!isEditing">
        <Button v-if="report" variant="outline" @click="isEditing = true">{{ $t('action.edit') }}</Button>
        <Button v-if="report?.template" variant="outline" @click="periodDialogOpen = true">
          {{ $t('report.btn.generate') }}
        </Button>
        <Button v-if="!report?.template" variant="outline" :disabled="isRegenerating" @click="handleRegenerate">
          {{ $t('report.btn.regenerate') }}
        </Button>
        <Button variant="ghost" @click="handleClose">{{ $t('action.close') }}</Button>
      </template>

      <template v-else>
        <Button :disabled="isSaving || !reportForm.meta.value.valid" @click="onSave">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="reset">{{ $t('action.cancel') }}</Button>
      </template>
    </template>

    <!-- Balance Sheet View -->
    <BalanceSheetView
      v-if="isBalanceSheet"
      :display-data="displayData"
      :sob-id="props.sobId"
      :report-id="props.reportId"
      :is-editing="isEditing"
      @row-click="handleRowClick"
      @insert-before="handleInsertBefore"
      @insert-child="handleInsertChild"
      @insert-after="handleInsertAfter"
      @delete-item="handleDeleteItem"
    />

    <!-- Income Statement View -->
    <IncomeStatementView
      v-else
      :display-data="displayData"
      :sob-id="props.sobId"
      :report-id="props.reportId"
      :is-editing="isEditing"
      @row-click="handleRowClick"
      @insert-before="handleInsertBefore"
      @insert-child="handleInsertChild"
      @insert-after="handleInsertAfter"
      @delete-item="handleDeleteItem"
    />
  </PageFrame>

  <!-- Item Dialog -->
  <ItemDialog
    v-if="selectedItem && report"
    v-model:open="editDialogOpen"
    :sob-id="props.sobId"
    :report-id="props.reportId"
    :report-class="report.class"
    :report-is-template="report.template"
    :item="selectedItem"
    :amount-types="report.amountTypes"
    :mode="itemDialogMode"
    @saved="handleItemSaved"
  />

  <!-- Generate Report Dialog (for templates) -->
  <Dialog v-model:open="periodDialogOpen" @update:open="handleDialogOpenChange">
    <DialogContent class="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{{ $t('report.dialog.selectPeriod') }}</DialogTitle>
        <DialogDescription>{{ $t('report.dialog.selectPeriodDescription') }}</DialogDescription>
      </DialogHeader>

      <div class="flex flex-col gap-4">
        <!-- Period Selector -->
        <PeriodSelector :sob-id="props.sobId" @period-selected="handlePeriodSelected" />

        <!-- Report Title Input -->
        <VeeField v-slot="{ field, errors }" name="title">
          <div class="flex flex-col gap-2">
            <Label for="report-title">{{ $t('report.dialog.reportTitle') }}</Label>
            <Input
              id="report-title"
              :model-value="field.value"
              :name="field.name"
              :aria-invalid="!!errors.length"
              @update:model-value="field.onChange"
              @blur="field.onBlur"
            />
            <p v-if="errors.length" class="text-destructive text-sm">
              {{ errors[0] }}
            </p>
          </div>
        </VeeField>
      </div>

      <DialogFooter>
        <Button variant="ghost" @click="periodDialogOpen = false">{{ $t('common.cancel') }}</Button>
        <Button :disabled="!selectedPeriod || !generateForm.meta.value.valid || isGenerating" @click="handleGenerate">
          {{ $t('common.confirm') }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
