<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useForm, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { z } from 'zod'
import { useI18n } from 'vue-i18n'
import { useEventBus } from '@vueuse/core'
import { CheckCircle2, AlertCircle, Trash2 } from 'lucide-vue-next'

import { PageFrame } from '@/components/common/page'
import { EditableField } from '@/components/common/form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { InputGroup, InputGroupInput, InputGroupAddon } from '@/components/ui/input-group'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import DateInput from './DateInput.vue'
import AccountInput from '@/components/account/AccountInput.vue'
import DimensionOptionSelector from './DimensionOptionSelector.vue'

import { JournalService } from '@/services/general-ledger/journal'
import { AccountService } from '@/services/general-ledger/account'
import type {
  JournalDetail,
  CreateJournalRequest,
  UpdateJournalRequest,
  JournalLineRequest,
} from '@/services/general-ledger/journal/types'
import type { AccountSlim, AccountDetail, DimensionOptionRef } from '@/services/general-ledger/account/types'
import { useUserStore } from '@/store/user'
import { useToastStore } from '@/store/toast'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'
import { useConfirmationStore } from '@/store/confirmation'
import { JOURNAL_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
  journalId?: string
  referenceJournalId?: string
}>()

const router = useRouter()
const { t, n } = useI18n()
const userStore = useUserStore()
const toastStore = useToastStore()
const unsavedChanges = useUnsavedChangesStore()
const confirmationStore = useConfirmationStore()
const bus = useEventBus(JOURNAL_CHANGED)

const isEditing = ref(!props.journalId)
const journal = ref<JournalDetail>()
const referenceJournal = ref<JournalDetail>()

// Zod schemas
const JournalLineSchema = z
  .object({
    _key: z.string(),
    account: z.custom<AccountDetail>().optional(),
    text: z.string(),
    amount: z.number().refine((val) => Number.isInteger(val * 100), {
      message: t('journal.journalLine.decimalPrecision'),
    }),
    dimensionOptions: z.record(z.custom<DimensionOptionRef>()).optional(),
  })
  .refine(
    (item) => {
      // If no account selected, allow amount to be 0 (empty row)
      if (!item.account) {
        return true
      }
      // Amount must not be 0 for non-empty rows
      return item.amount !== 0
    },
    {
      message: t('journal.journalLine.bothEmpty'),
    },
  )
  .refine(
    (item) => {
      // If no account selected, skip dimension options validation (empty row)
      if (!item.account) {
        return true
      }
      // Check all required dimension categories are filled
      const requiredCategories = item.account.dimensionCategories ?? []
      return requiredCategories.every((cat) => item.dimensionOptions?.[cat.id])
    },
    {
      message: t('journal.msg.emptyDimensionOption'),
    },
  )

const JournalFormSchema = z
  .object({
    headerText: z.string().min(1, { message: t('journal.msg.emptyHeaderText') }),
    attachmentQuantity: z.number().int().min(0),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: t('common.msg.invalidDateFormat') }),
    journalLines: z.array(JournalLineSchema).refine((items) => items.filter((item) => item.account).length >= 2, {
      message: t('journal.msg.minTwoItems'),
    }),
  })
  .refine(
    (data) => {
      const amountTotal = data.journalLines.reduce((sum, item) => sum + (item.amount || 0), 0)
      return Math.abs(amountTotal) < 0.001
    },
    {
      message: t('journal.msg.notBalanced'),
    },
  )

type FormJournalLine = z.infer<typeof JournalLineSchema>
type JournalFormValues = z.infer<typeof JournalFormSchema>

// Constants based on inferred types
const EMPTY_LINE_ITEM: Omit<FormJournalLine, '_key'> = {
  account: undefined,
  text: '',
  amount: 0,
  dimensionOptions: undefined,
}

const EMPTY_JOURNAL: JournalFormValues = {
  headerText: '',
  attachmentQuantity: 0,
  transactionDate: new Date().toISOString().split('T')[0]!, // YYYY-MM-DD
  journalLines: Array(4)
    .fill(null)
    .map(() => ({ _key: crypto.randomUUID(), ...EMPTY_LINE_ITEM })),
}

const formSchema = ref(toTypedSchema(JournalFormSchema))

const form = useForm({
  validationSchema: formSchema,
})

// Computed totals
const debitTotal = computed(() =>
  (form.values.journalLines ?? [])
    .filter((item) => item.amount && item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0),
)

const creditTotal = computed(() =>
  (form.values.journalLines ?? [])
    .filter((item) => item.amount && item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0),
)

const isBalanced = computed(() => {
  const amountTotal = (form.values.journalLines ?? []).reduce((sum, item) => sum + (item.amount || 0), 0)
  return Math.abs(amountTotal) < 0.001
})

const title = computed(() => (props.journalId ? journal.value?.documentNumber : t('journal.creation.title')))

// Handle account selection - fetch AccountDetail for dimension categories
async function handleAccountSelect(account: AccountSlim | undefined, index: number) {
  if (!account) {
    // Account deselected, clear dimension options
    form.setFieldValue(`journalLines[${index}].dimensionOptions`, undefined)
    return
  }

  // Check if we already have AccountDetail with dimensionCategories
  const currentAccount = form.values.journalLines?.[index]?.account
  if (currentAccount && 'dimensionCategories' in currentAccount && currentAccount.id === account.id) {
    // Already have AccountDetail with same ID, no need to fetch
    return
  }

  // Fetch AccountDetail to get dimensionCategories
  const { data } = await AccountService.getAccountById(props.sobId, account.id)
  if (data) {
    form.setFieldValue(`journalLines[${index}].account`, data)
    form.setFieldValue(`journalLines[${index}].dimensionOptions`, undefined)
  }
}

const formatUserName = (user?: { traits?: { name?: { first?: string; last?: string } } }) =>
  `${user?.traits?.name?.last ?? ''}${user?.traits?.name?.first ?? ''}`

// Unsaved changes protection
watch(
  () => form.meta.value.dirty,
  (isDirty) => {
    if (isDirty) {
      unsavedChanges.action.enableProtection()
    } else {
      unsavedChanges.action.disableProtection()
    }
  },
)

// Journal line management
function addJournalLine() {
  const current = form.values.journalLines ?? []
  form.setFieldValue('journalLines', [...current, { _key: crypto.randomUUID(), ...EMPTY_LINE_ITEM }])
}

function removeJournalLine(index: number) {
  const current = form.values.journalLines ?? []
  form.setFieldValue(
    'journalLines',
    current.filter((_, i) => i !== index),
  )
}

// Load journal data
async function load() {
  journal.value = undefined
  referenceJournal.value = undefined
  if (props.journalId) {
    const { data, exception } = await JournalService.getJournalById(props.sobId, props.journalId)
    if (exception || !data) return

    journal.value = data
    isEditing.value = false

    // If this is an ADJUSTING (or other reference-based) journal, load the reference journal for display
    if (data.referenceJournalId) {
      const { data: refData } = await JournalService.getJournalById(props.sobId, data.referenceJournalId)
      referenceJournal.value = refData ?? undefined
    }

    // Transform to form values
    const formValues: JournalFormValues = {
      headerText: data.headerText,
      attachmentQuantity: data.attachmentQuantity,
      transactionDate: data.transactionDate,
      journalLines: data.journalLines.map((item) => {
        // Convert dimensionOptions array to Record
        const dimensionOptions: Record<string, DimensionOptionRef> = {}
        if (item.dimensionOptions) {
          item.dimensionOptions.forEach((opt) => {
            dimensionOptions[opt.category.id] = opt
          })
        }
        // Convert signed amount to debit/credit for display
        const amount = item.amount || 0
        return {
          _key: crypto.randomUUID(),
          account: item.account,
          text: item.text,
          amount: amount,
          dimensionOptions: Object.entries(dimensionOptions).length > 0 ? dimensionOptions : undefined,
        }
      }),
    }

    form.resetForm({ values: formValues }, { force: true })
  } else {
    isEditing.value = true

    // Load reference journal for display + header text pre-fill when creating an adjusting journal
    if (props.referenceJournalId) {
      const { data } = await JournalService.getJournalById(props.sobId, props.referenceJournalId)
      referenceJournal.value = data ?? undefined
    }

    const prefillHeaderText = referenceJournal.value ? `调整分录：${referenceJournal.value.headerText}` : ''

    form.resetForm(
      {
        values: {
          ...EMPTY_JOURNAL,
          headerText: prefillHeaderText,
        },
      },
      { force: true },
    )
  }
}

watch(() => props.journalId, load, { immediate: true })

// Form submission
const onSubmit = form.handleSubmit(async (values) => {
  // Filter out empty journal lines
  const validJournalLines = values.journalLines.filter((item) => item.account)

  // Transform to API format
  const journalLinesRequest: JournalLineRequest[] = validJournalLines.map((item) => {
    // Convert dimensionOptions Record to array of IDs
    const dimensionOptionIds = Object.values(item.dimensionOptions ?? {}).map((opt) => opt.id)

    return {
      accountNumber: item.account!.accountNumber,
      text: values.headerText,
      amount: item.amount || 0,
      dimensionOptionIds: dimensionOptionIds.length > 0 ? dimensionOptionIds : undefined,
    }
  })

  if (!props.journalId) {
    // Create new journal
    const request: CreateJournalRequest = {
      headerText: values.headerText,
      journalType: props.referenceJournalId ? 'ADJUSTING' : 'GENERAL',
      referenceJournalId: props.referenceJournalId || undefined,
      attachmentQuantity: values.attachmentQuantity,
      transactionDate: values.transactionDate,
      creator: userStore.state.user.id,
      journalLines: journalLinesRequest,
    }

    const { data, exception } = await JournalService.createJournal(props.sobId, request)
    if (exception || !data) return

    toastStore.action.success(t('journal.msg.success'))
    unsavedChanges.action.disableProtection()
    bus.emit()

    // Navigate to view mode with new journal
    router.push({
      name: 'journalDetail',
      params: {
        sobId: props.sobId,
        journalId: data.id,
      },
    })
  } else {
    // Update existing journal
    const request: UpdateJournalRequest = {
      headerText: values.headerText,
      attachmentQuantity: values.attachmentQuantity,
      transactionDate: values.transactionDate,
      updater: userStore.state.user.id,
      journalLines: journalLinesRequest,
    }

    const { exception } = await JournalService.updateJournal(props.sobId, props.journalId, request)
    if (exception) return

    toastStore.action.success(t('journal.msg.success'))
    unsavedChanges.action.disableProtection()
    bus.emit()

    // Reload and exit edit mode
    await load()
  }
})

// Edit mode
function handleEdit() {
  isEditing.value = true
}

function handleClose() {
  router.push({
    name: 'journalList',
    params: {
      sobId: props.sobId,
    },
  })
}

function handleCreateAdjusting() {
  router.push({
    name: 'journalNew',
    params: { sobId: props.sobId },
    query: { referenceJournalId: props.journalId },
  })
}

function handleCancel() {
  unsavedChanges.action.disableProtection()
  if (!props.journalId) {
    // Cancel creating new journal
    router.push({
      name: 'journalList',
      params: {
        sobId: props.sobId,
      },
    })
  } else {
    // Cancel editing existing journal
    load()
  }
}

// Workflow actions
async function handleAudit() {
  if (!props.journalId) return
  const { exception } = await JournalService.auditJournal(props.sobId, props.journalId, userStore.state.user.id)
  if (exception) return
  toastStore.action.success(t('journal.msg.auditSuccess'))
  bus.emit()
  await load()
}

async function handleCancelAudit() {
  if (!props.journalId) return
  confirmationStore.action.confirm({
    title: t('journal.audit'),
    message: t('journal.msg.confirmCancelAudit'),
    onConfirm: async () => {
      const { exception } = await JournalService.cancelAuditJournal(
        props.sobId,
        props.journalId!,
        userStore.state.user.id,
      )
      if (exception) return
      toastStore.action.success(t('journal.msg.cancelAuditSuccess'))
      bus.emit()
      await load()
    },
  })
}

async function handleReview() {
  if (!props.journalId) return
  const { exception } = await JournalService.reviewJournal(props.sobId, props.journalId, userStore.state.user.id)
  if (exception) return
  toastStore.action.success(t('journal.msg.reviewSuccess'))
  bus.emit()
  await load()
}

async function handleCancelReview() {
  if (!props.journalId) return
  confirmationStore.action.confirm({
    title: t('journal.review'),
    message: t('journal.msg.confirmCancelReview'),
    onConfirm: async () => {
      const { exception } = await JournalService.cancelReviewJournal(
        props.sobId,
        props.journalId!,
        userStore.state.user.id,
      )
      if (exception) return
      toastStore.action.success(t('journal.msg.cancelReviewSuccess'))
      bus.emit()
      await load()
    },
  })
}

async function handlePost() {
  if (!props.journalId) return
  confirmationStore.action.confirm({
    title: t('journal.post'),
    message: t('journal.msg.confirmPost'),
    onConfirm: async () => {
      const { exception } = await JournalService.postJournal(props.sobId, props.journalId!, userStore.state.user.id)
      if (exception) return
      toastStore.action.success(t('journal.msg.postSuccess'))
      bus.emit()
      await load()
    },
  })
}
</script>

<template>
  <PageFrame :title="title" :dirty-indicator="form.meta.value.dirty">
    <template #end>
      <!-- View mode actions -->
      <template v-if="!isEditing && journalId">
        <!-- Workflow action buttons -->
        <Button v-if="!journal?.isAudited" variant="outline" @click="handleAudit">
          {{ $t('journal.audit') }}
        </Button>
        <Button v-if="journal?.isAudited && !journal?.isPosted" variant="outline" @click="handleCancelAudit">
          {{ $t('journal.cancelAudit') }}
        </Button>
        <Button v-if="!journal?.isReviewed" variant="outline" @click="handleReview">
          {{ $t('journal.review') }}
        </Button>
        <Button v-if="journal?.isReviewed && !journal?.isPosted" variant="outline" @click="handleCancelReview">
          {{ $t('journal.cancelReview') }}
        </Button>
        <Button v-if="journal?.isAudited && journal?.isReviewed && !journal?.isPosted" @click="handlePost">
          {{ $t('journal.post') }}
        </Button>

        <!-- Edit/Close buttons -->
        <Button v-if="!journal?.isAudited && !journal?.isReviewed" variant="outline" @click="handleEdit">
          {{ $t('action.edit') }}
        </Button>
        <Button v-if="journal?.isPosted" variant="outline" @click="handleCreateAdjusting">
          {{ $t('journal.adjusting') }}
        </Button>
        <Button variant="ghost" @click="handleClose">{{ $t('action.close') }}</Button>
      </template>

      <!-- Create/Edit mode actions -->
      <template v-if="isEditing">
        <Button @click="onSubmit">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="handleCancel">{{ $t('action.cancel') }}</Button>
      </template>
    </template>

    <div class="space-y-8">
      <!-- Workflow status badges -->
      <div v-if="journal && !isEditing" class="flex gap-2">
        <Badge v-if="journal.isAudited" class="bg-green-600">
          {{ $t('journal.isAudited') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('journal.notAudited') }}
        </Badge>
        <Badge v-if="journal.isReviewed" class="bg-green-600">
          {{ $t('journal.isReviewed') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('journal.notReviewed') }}
        </Badge>
        <Badge v-if="journal.isPosted" class="bg-green-600">
          {{ $t('journal.isPosted') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('journal.notPosted') }}
        </Badge>
      </div>

      <!-- Header section -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Header Text -->
        <VeeField v-slot="{ field, errors }" name="headerText">
          <EditableField
            :label="$t('journal.headerText')"
            label-for="headerText"
            :is-editing="isEditing"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <Input
                id="headerText"
                :model-value="value"
                :name="field.name"
                :placeholder="$t('journal.headerTextPlaceholder')"
                :aria-invalid="!!errors.length"
                @update:model-value="onUpdate"
                @blur="field.onBlur"
              />
            </template>
          </EditableField>
        </VeeField>

        <!-- Transaction Date -->
        <VeeField v-slot="{ field, errors }" name="transactionDate">
          <EditableField
            :label="$t('journal.transactionDate')"
            label-for="transactionDate"
            :is-editing="isEditing"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            :formatter="(value?: string) => (value ? new Date(value).toLocaleDateString('zh-CN') : '')"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <DateInput
                id="transactionDate"
                :disabled="!isEditing"
                :placeholder="$t('common.pleaseSelect')"
                :model-value="value"
                @update:model-value="onUpdate"
              />
            </template>
          </EditableField>
        </VeeField>

        <!-- Attachment Quantity -->
        <VeeField v-slot="{ field, errors }" name="attachmentQuantity">
          <EditableField
            :label="$t('journal.attachmentQuantity')"
            label-for="attachmentQuantity"
            :is-editing="isEditing"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            :formatter="(val) => `${val} ${$t('journal.attachmentQuantityUnit')}`"
            @update:value="field.onChange"
          >
            <template #edit="{ value, onUpdate }">
              <InputGroup>
                <InputGroupInput
                  id="attachmentQuantity"
                  type="number"
                  step="1"
                  min="0"
                  :model-value="value"
                  :name="field.name"
                  :aria-invalid="!!errors.length"
                  class="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @update:model-value="onUpdate"
                  @blur="field.onBlur"
                />
                <InputGroupAddon align="inline-end">{{ $t('journal.attachmentQuantityUnit') }}</InputGroupAddon>
              </InputGroup>
            </template>
          </EditableField>
        </VeeField>

        <!-- Creator (readonly, only for existing journals) -->
        <EditableField
          v-if="journal && !isEditing"
          :label="$t('journal.creator')"
          :is-editing="false"
          :value="journal.creator"
          :formatter="formatUserName"
        />

        <!-- Auditor (readonly, only for existing journals) -->
        <EditableField
          v-if="journal && journal.isAudited && !isEditing"
          :label="$t('journal.auditor')"
          :is-editing="false"
          :value="journal.auditor"
          :formatter="formatUserName"
        />

        <!-- Reviewer (readonly, only for existing journals) -->
        <EditableField
          v-if="journal && journal.isReviewed && !isEditing"
          :label="$t('journal.reviewer')"
          :is-editing="false"
          :value="journal.reviewer"
          :formatter="formatUserName"
        />

        <!-- Journal Type (readonly, only for non-GENERAL journals or when creating adjusting) -->
        <EditableField
          v-if="(journal && journal.journalType !== 'GENERAL') || props.referenceJournalId"
          :label="$t('journal.journalType')"
          :is-editing="false"
          :value="journal?.journalType ?? 'ADJUSTING'"
          :formatter="(val) => $t(`journal.journalTypeEnum.${val}`)"
        />

        <!-- Reference Journal (readonly, shown when journal has a reference) -->
        <EditableField
          v-if="journal?.referenceJournalId || props.referenceJournalId"
          :label="$t('journal.referenceJournal')"
          :is-editing="false"
          :value="referenceJournal?.documentNumber"
        >
          <template #display>
            <RouterLink
              :to="{
                name: 'journalDetail',
                params: {
                  sobId: props.sobId,
                  journalId: journal?.referenceJournalId ?? props.referenceJournalId,
                },
              }"
              class="text-primary text-sm hover:underline"
            >
              {{ referenceJournal?.documentNumber ?? journal?.referenceJournalId ?? props.referenceJournalId }}
            </RouterLink>
          </template>
        </EditableField>
      </div>

      <!-- Journal Lines Table -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ $t('journal.journalLines') }}</h3>

          <!-- Add Journal Line Button -->
          <Button v-if="isEditing" variant="outline" @click="addJournalLine">
            {{ $t('journal.addJournalLine') }}
          </Button>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">#</TableHead>
                <TableHead class="w-50">{{ $t('journal.account') }}</TableHead>
                <TableHead class="w-37.5">{{ $t('journal.debit') }}</TableHead>
                <TableHead class="w-37.5">{{ $t('journal.credit') }}</TableHead>
                <TableHead v-if="isEditing" class="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-for="(item, index) in form.values.journalLines ?? []" :key="item._key">
                <TableRow>
                  <TableCell>{{ index + 1 }}</TableCell>

                  <!-- Account + Dimension Options -->
                  <TableCell>
                    <div class="space-y-2">
                      <!-- Main Account -->
                      <VeeField v-slot="{ field }" :name="`journalLines[${index}].account`">
                        <template v-if="isEditing">
                          <AccountInput
                            :disabled="!isEditing"
                            :model-value="field.value"
                            only-leaf
                            @update:model-value="
                              (val) => {
                                field.onChange(val)
                                handleAccountSelect(val, index)
                              }
                            "
                          />
                        </template>
                        <template v-else>
                          <div class="text-sm">
                            <span>{{ field.value?.accountNumber }}</span>
                            <span class="ml-1">{{ field.value?.title }}</span>
                          </div>
                        </template>
                      </VeeField>

                      <!-- Dimension Options -->
                      <div
                        v-if="item.account?.dimensionCategories && item.account.dimensionCategories.length > 0"
                        class="grid grid-cols-[auto_1fr] items-center gap-2"
                      >
                        <template v-for="category in item.account.dimensionCategories" :key="category.id">
                          <span class="text-muted-foreground text-xs font-medium whitespace-nowrap">
                            {{ category.name }}:
                          </span>
                          <VeeField v-slot="{ field }" :name="`journalLines[${index}].dimensionOptions.${category.id}`">
                            <!-- Edit mode: show selector -->
                            <DimensionOptionSelector
                              v-if="isEditing"
                              :sob-id="props.sobId"
                              :category="category"
                              :model-value="field.value"
                              class="w-full"
                              @update:model-value="field.onChange"
                            />
                            <!-- Display mode: show text only -->
                            <div v-else class="text-xs">
                              {{ field.value?.name }}
                            </div>
                          </VeeField>
                        </template>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Debit -->
                  <TableCell class="align-top">
                    <VeeField v-slot="{ field }" :name="`journalLines[${index}].amount`">
                      <template v-if="isEditing">
                        <Input
                          :id="useId()"
                          type="number"
                          step="0.01"
                          min="0"
                          :model-value="field.value && field.value > 0 ? field.value : ''"
                          class="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          @update:model-value="(val) => field.onChange(Number(val) || 0)"
                        />
                      </template>
                      <template v-else>
                        <span class="text-sm">{{
                          field.value && field.value > 0 ? n(field.value, 'decimal') : ''
                        }}</span>
                      </template>
                    </VeeField>
                  </TableCell>

                  <!-- Credit -->
                  <TableCell class="align-top">
                    <VeeField v-slot="{ field }" :name="`journalLines[${index}].amount`">
                      <template v-if="isEditing">
                        <Input
                          :id="useId()"
                          type="number"
                          step="0.01"
                          min="0"
                          :model-value="field.value && field.value < 0 ? Math.abs(field.value) : ''"
                          class="[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          @update:model-value="(val) => field.onChange(val ? -Number(val) || 0 : 0)"
                        />
                      </template>
                      <template v-else>
                        <span class="text-sm">{{
                          field.value && field.value < 0 ? n(Math.abs(field.value), 'decimal') : ''
                        }}</span>
                      </template>
                    </VeeField>
                  </TableCell>

                  <!-- Remove button -->
                  <TableCell v-if="isEditing" class="align-top">
                    <Button
                      variant="ghost"
                      size="icon"
                      :title="$t('journal.removeJournalLine')"
                      @click="removeJournalLine(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
            <TableFooter>
              <!-- Journal Line Errors -->
              <template v-for="(item, index) in form.values.journalLines ?? []" :key="`error-${item._key}`">
                <TableRow v-if="form.errors.value[`journalLines[${index}]`]">
                  <TableCell :colspan="isEditing ? 5 : 4" class="bg-destructive/10">
                    <div class="text-destructive flex items-center gap-2 text-sm">
                      <AlertCircle class="h-4 w-4" />
                      <span>
                        {{ $t('journal.journalLine.errorPrefix', [index + 1]) }}:
                        {{ form.errors.value[`journalLines[${index}]`] }}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-if="form.errors.value['journalLines']">
                <TableCell :colspan="isEditing ? 5 : 4" class="bg-destructive/10">
                  <div class="text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle class="h-4 w-4" />
                    <span>
                      {{ form.errors.value['journalLines'] }}
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Totals Row -->
              <TableRow>
                <TableCell :colspan="isEditing ? 5 : 4" class="text-right">
                  <div class="flex items-center justify-end gap-6">
                    <span class="font-semibold"> {{ $t('journal.debitTotal') }}: {{ $n(debitTotal, 'decimal') }} </span>
                    <span class="font-semibold">
                      {{ $t('journal.creditTotal') }}: {{ $n(creditTotal, 'decimal') }}
                    </span>
                    <div class="flex items-center gap-2">
                      <template v-if="isBalanced">
                        <CheckCircle2 class="h-4 w-4 text-green-600" />
                        <span class="text-sm text-green-600">{{ $t('journal.balanced') }}</span>
                      </template>
                      <template v-else>
                        <AlertCircle class="text-destructive h-4 w-4" />
                        <span class="text-destructive text-sm">
                          {{ $t('journal.unbalanced') }} {{ $t('journal.difference') }}:
                          {{ $n(Math.abs(debitTotal - creditTotal), 'decimal') }}
                        </span>
                      </template>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>
    </div>
  </PageFrame>
</template>
