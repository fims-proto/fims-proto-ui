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
import PeriodSelector from '@/components/period/PeriodSelector.vue'
import ItemDialog from './ItemDialog.vue'
import BalanceSheetView from './views/BalanceSheetView.vue'
import IncomeStatementView from './views/IncomeStatementView.vue'
import { useUnsavedChanges, UnsavedChangesDialog } from '@/components/common/unsaved-guard'

import {
  ReportService,
  type Report,
  type Item,
  type Section,
  UpdateReportRequestSchema,
  type UpdateReportRequest,
  type UpdateReportRequestSection,
  type UpdateReportRequestItem,
  CLASS_OPTIONS,
} from '@/services/report'
import type { Period } from '@/services/general-ledger/period'
import { usePeriodStore } from '@/store/period'
import { buildReportDisplayData } from './report-display-helper'
import type { Entry } from './report-display-types'
import { useToastStore } from '@/store/toast'
import { insertItemInTree, updateItemInTree, deleteItemFromTree } from '@/utils/tree-mutation'
import { transformItemToRequest, cleanTemporaryIds } from './report-transforms'

const props = defineProps<{
  sobId: string
}>()

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()
const periodStore = usePeriodStore()

// --- Page state ---
const selectedClass = ref<(typeof CLASS_OPTIONS)[number]>('balance_sheet')
const selectedPeriod = ref<Period | null>(null)
const isTemplateMode = ref(false)
const report = ref<Report | undefined>()
const isLoading = ref(false)
const isNotFound = ref(false)
const isGenerating = ref(false)

// --- Edit state ---
const isEditing = ref(false)
const isSaving = ref(false)
const isRegenerating = ref(false)
const warningDismissed = ref(false)

const editDialogOpen = ref(false)
const selectedItem = ref<Item>()
type ItemDialogMode = 'view' | 'edit' | 'create'
const itemDialogMode = ref<ItemDialogMode>('view')
type InsertPosition = 'before' | 'after' | 'child'
const insertPosition = ref<InsertPosition | null>(null)
const referenceItem = ref<Item | null>(null)

const reportForm = useForm({
  validationSchema: toTypedSchema(UpdateReportRequestSchema),
})

const displayData = computed(() => (report.value ? buildReportDisplayData(report.value) : undefined))
const isBalanceSheet = computed(() => displayData.value?.class === 'balance_sheet')
const periodText = computed(() => {
  if (!selectedPeriod.value) return null
  return t('period.periodText', [selectedPeriod.value.fiscalYear, selectedPeriod.value.periodNumber])
})
const reportTitle = computed(() => {
  if (!selectedClass.value) return t('report.title')
  return t(`report.classEnum.${selectedClass.value}`)
})

const { confirmOpen, onConfirmLeave, onCancelLeave } = useUnsavedChanges(computed(() => reportForm.meta.value.dirty))

// --- Period format helpers ---
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

// --- URL sync ---
function syncToUrl() {
  const query: Record<string, string> = { class: selectedClass.value }
  if (isTemplateMode.value) {
    query.mode = 'template'
  } else if (selectedPeriod.value) {
    query.period = periodToParam(selectedPeriod.value)
  }
  router.replace({ query })
}

// --- Load report ---
async function load() {
  if (!selectedClass.value) return

  isLoading.value = true
  isNotFound.value = false
  report.value = undefined

  try {
    if (isTemplateMode.value) {
      const { data } = await ReportService.getTemplate(props.sobId, selectedClass.value)
      report.value = data
    } else if (selectedPeriod.value) {
      const { data } = await ReportService.getReportByClassAndPeriod(
        props.sobId,
        selectedClass.value,
        periodToParam(selectedPeriod.value),
      )
      if (data) {
        report.value = data
      } else {
        isNotFound.value = true
      }
    }
  } finally {
    isLoading.value = false
  }

  if (report.value) {
    const formValues = transformToForm(report.value)
    reportForm.resetForm({ values: formValues }, { force: true })
  }
}

// --- Watch for state changes to reload ---
watch([selectedClass, selectedPeriod], () => {
  syncToUrl()
  isEditing.value = false
  warningDismissed.value = false
  load()
})

// Template mode toggle: reload without resetting editing (enterTemplateEdit sets isEditing=true)
watch(isTemplateMode, () => {
  syncToUrl()
  load()
})

// --- Initialize from URL and period store ---
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
    } else if (queryPeriod && typeof queryPeriod === 'string') {
      const period = paramToPeriod(queryPeriod)
      if (period) selectedPeriod.value = period
    } else {
      // Default: current period
      const current = periodStore.state.currentPeriod
      if (current) selectedPeriod.value = current
    }
  },
  { immediate: true },
)

// --- Form helpers ---
function transformToForm(r: Report): UpdateReportRequest {
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
    title: r.title,
    amountTypes: r.amountTypes,
    sections: r.sections.map(transformSection),
  }
}

// --- Item operations ---
function createNewItem(ref: Item, position: InsertPosition): Item {
  let level: number
  let isBreakdownItem: boolean
  let isAbleToAddChild: boolean

  if (position === 'child') {
    level = ref.level + 1
    isBreakdownItem = true
    isAbleToAddChild = false
  } else {
    level = ref.level
    isBreakdownItem = ref.isBreakdownItem ?? false
    isAbleToAddChild = !isBreakdownItem
  }

  return {
    id: `new-${crypto.randomUUID()}`,
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
  if (!entry.text) return
  selectedItem.value = entry
  itemDialogMode.value = !entry.isEditable ? 'view' : isEditing.value ? 'edit' : 'view'
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
  const sections = reportForm.values.sections
  if (!sections) return

  const formDeleted = deleteItemFromTree<UpdateReportRequestSection, UpdateReportRequestItem>(
    sections,
    (item) => item.id === entry.id,
  )

  if (formDeleted && report.value) {
    deleteItemFromTree<Section, Item>(report.value.sections, (item) => item.id === entry.id)
    reportForm.setFieldTouched('sections', true)
  }
}

function handleItemSaved(updatedItem: Item) {
  const sections = reportForm.values.sections
  if (!sections) return

  if (itemDialogMode.value === 'create') {
    const refItem = referenceItem.value
    const position = insertPosition.value
    if (!refItem || !position) return

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
      insertItemInTree<Section, Item>(report.value.sections, updatedItem, {
        findReference: (item) => item.id === refItem.id,
        position,
      })
      reportForm.setFieldTouched('sections', true)
    }

    itemDialogMode.value = 'view'
    insertPosition.value = null
    referenceItem.value = null
  } else {
    const formUpdated = updateItemInTree<UpdateReportRequestSection, UpdateReportRequestItem>(
      sections,
      (item) => item.id === updatedItem.id,
      () => transformItemToRequest(updatedItem),
    )

    if (formUpdated && report.value) {
      updateItemInTree<Section, Item>(
        report.value.sections,
        (item) => item.id === updatedItem.id,
        () => updatedItem,
      )
      reportForm.setFieldTouched('sections', true)
    }
  }
}

// --- Save ---
async function onSave() {
  const validation = await reportForm.validate()
  if (!validation.valid) {
    toast.action.error(t('report.msg.validationFailed'))
    return
  }

  isSaving.value = true
  try {
    const cleanedRequest = cleanTemporaryIds(reportForm.values as UpdateReportRequest)
    const { exception: updateException } = await ReportService.updateReport(
      props.sobId,
      report.value!.id,
      cleanedRequest,
    )
    if (updateException) return

    if (report.value?.template) {
      toast.action.success(t('report.msg.templateUpdateCompleted'))
    } else {
      const { exception: regenException } = await ReportService.regenerateReport(props.sobId, report.value!.id)
      if (regenException) {
        toast.action.warn(t('report.msg.updateSuccessButRegenerateFailed'))
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

// --- Regenerate ---
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

// --- Generate (empty state) ---
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
      report.value = data
      isNotFound.value = false
      const formValues = transformToForm(data)
      reportForm.resetForm({ values: formValues }, { force: true })
      toast.action.success(t('report.msg.generateCompleted'))
    }
  } finally {
    isGenerating.value = false
  }
}

// --- Template mode ---
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

      <!-- Instance view buttons -->
      <template v-if="!isTemplateMode">
        <template v-if="!isEditing">
          <Button v-if="report" variant="outline" :disabled="isRegenerating" @click="handleRegenerate">
            {{ $t('report.btn.regenerate') }}
          </Button>
          <Button variant="outline" @click="enterTemplateEdit">{{ $t('report.btn.editTemplate') }}</Button>
          <Button v-if="report" variant="outline" @click="isEditing = true">{{ $t('action.edit') }}</Button>
        </template>
        <template v-else>
          <Button :disabled="isSaving || !reportForm.meta.value.valid" @click="onSave">{{ $t('action.save') }}</Button>
          <Button variant="ghost" @click="handleCancel">{{ $t('action.cancel') }}</Button>
        </template>
      </template>

      <!-- Template view buttons -->
      <template v-else>
        <Button :disabled="isSaving || !reportForm.meta.value.valid" @click="onSave">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="exitTemplateEdit">{{ $t('report.btn.exitEditTemplate') }}</Button>
      </template>
    </template>

    <!-- Unclosed period warning strip -->
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

    <!-- Loading -->
    <div v-if="isLoading" class="space-y-3">
      <div v-for="i in 8" :key="i" class="bg-muted h-8 animate-pulse rounded" />
    </div>

    <!-- Report content -->
    <template v-else-if="report && displayData">
      <BalanceSheetView
        v-if="isBalanceSheet"
        :display-data="displayData"
        :sob-id="props.sobId"
        :report-id="report.id"
        :is-editing="isEditing"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
      />
      <IncomeStatementView
        v-else
        :display-data="displayData"
        :sob-id="props.sobId"
        :report-id="report.id"
        :is-editing="isEditing"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
      />
    </template>

    <!-- Empty state -->
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

  <!-- Item dialog -->
  <ItemDialog
    v-if="selectedItem && report"
    v-model:open="editDialogOpen"
    :sob-id="props.sobId"
    :report-id="report.id"
    :report-class="report.class"
    :report-is-template="report.template"
    :item="selectedItem"
    :amount-types="report.amountTypes"
    :mode="itemDialogMode"
    @saved="handleItemSaved"
    @deleted="(item) => handleDeleteItem(item as Entry)"
  />

  <UnsavedChangesDialog :open="confirmOpen" @confirm="onConfirmLeave" @cancel="onCancelLeave" />
</template>
