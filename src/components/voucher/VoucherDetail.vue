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
import AuxiliaryAccountSelector from './AuxiliaryAccountSelector.vue'

import { VoucherService } from '@/services/general-ledger/voucher'
import type {
  Voucher,
  CreateVoucherRequest,
  UpdateVoucherRequest,
  LineItemRequest,
  AuxiliaryItemRequest,
} from '@/services/general-ledger/voucher/types'
import type { Account, AuxiliaryAccount } from '@/services/general-ledger/account/types'
import { useUserStore } from '@/store/user'
import { useToastStore } from '@/store/toast'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'
import { useConfirmationStore } from '@/store/confirmation'
import { VOUCHER_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
  voucherId?: string
}>()

const router = useRouter()
const { t, n } = useI18n()
const userStore = useUserStore()
const toastStore = useToastStore()
const unsavedChanges = useUnsavedChangesStore()
const confirmationStore = useConfirmationStore()
const bus = useEventBus(VOUCHER_CHANGED)

const isEditing = ref(!props.voucherId)
const voucher = ref<Voucher>()

// Zod schemas
const LineItemSchema = z
  .object({
    _key: z.string(),
    account: z.custom<Account>().optional(),
    text: z.string(),
    amount: z.number().refine((val) => Number.isInteger(val * 100), {
      message: t('voucher.lineItem.decimalPrecision'),
    }),
    auxiliaryAccounts: z.record(z.custom<AuxiliaryAccount>()).optional(),
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
      message: t('voucher.lineItem.bothEmpty'),
    },
  )
  .refine(
    (item) => {
      // If no account selected, skip auxiliary account validation (empty row)
      if (!item.account) {
        return true
      }
      // Check all required auxiliary categories are filled
      const requiredCategories = item.account.auxiliaryCategories ?? []
      return requiredCategories.every((category) => item.auxiliaryAccounts?.[category.key])
    },
    {
      message: t('voucher.msg.emptyAuxiliaryAccountKey'),
    },
  )

const VoucherFormSchema = z
  .object({
    headerText: z.string().min(1, { message: t('voucher.msg.emptyHeaderText') }),
    attachmentQuantity: z.number().int().min(0),
    transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, { message: t('common.msg.invalidDateFormat') }),
    lineItems: z.array(LineItemSchema).refine((items) => items.filter((item) => item.account).length >= 2, {
      message: t('voucher.msg.minTwoItems'),
    }),
  })
  .refine(
    (data) => {
      const amountTotal = data.lineItems.reduce((sum, item) => sum + (item.amount || 0), 0)
      return Math.abs(amountTotal) < 0.001
    },
    {
      message: t('voucher.msg.notBalanced'),
    },
  )

type FormLineItem = z.infer<typeof LineItemSchema>
type VoucherFormValues = z.infer<typeof VoucherFormSchema>

// Constants based on inferred types
const EMPTY_LINE_ITEM: Omit<FormLineItem, '_key'> = {
  account: undefined,
  text: '',
  amount: 0,
}

const EMPTY_VOUCHER: VoucherFormValues = {
  headerText: '',
  attachmentQuantity: 0,
  transactionDate: new Date().toISOString().split('T')[0]!, // YYYY-MM-DD
  lineItems: Array(4)
    .fill(null)
    .map(() => ({ _key: crypto.randomUUID(), ...EMPTY_LINE_ITEM })),
}

const formSchema = ref(toTypedSchema(VoucherFormSchema))

const form = useForm({
  validationSchema: formSchema,
})

// Computed totals
const debitTotal = computed(() =>
  (form.values.lineItems ?? [])
    .filter((item) => item.amount && item.amount > 0)
    .reduce((sum, item) => sum + item.amount, 0),
)

const creditTotal = computed(() =>
  (form.values.lineItems ?? [])
    .filter((item) => item.amount && item.amount < 0)
    .reduce((sum, item) => sum + Math.abs(item.amount), 0),
)

const isBalanced = computed(() => {
  const amountTotal = (form.values.lineItems ?? []).reduce((sum, item) => sum + (item.amount || 0), 0)
  return Math.abs(amountTotal) < 0.001
})

const title = computed(() => (props.voucherId ? voucher.value?.documentNumber : t('voucher.creation.title')))

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

// Line item management
function addLineItem() {
  const current = form.values.lineItems ?? []
  form.setFieldValue('lineItems', [...current, { _key: crypto.randomUUID(), ...EMPTY_LINE_ITEM }])
}

function removeLineItem(index: number) {
  const current = form.values.lineItems ?? []
  form.setFieldValue(
    'lineItems',
    current.filter((_, i) => i !== index),
  )
}

// Load voucher data
async function load() {
  if (props.voucherId) {
    const { data, exception } = await VoucherService.getVoucherById(props.sobId, props.voucherId)
    if (exception || !data) return

    voucher.value = data
    isEditing.value = false

    // Transform to form values
    const formValues: VoucherFormValues = {
      headerText: data.headerText,
      attachmentQuantity: data.attachmentQuantity,
      transactionDate: data.transactionDate,
      lineItems: data.lineItems.map((item) => {
        // Convert auxiliaryAccounts array to Record
        const auxiliaryAccounts: Record<string, AuxiliaryAccount> = {}
        if (item.auxiliaryAccounts) {
          item.auxiliaryAccounts.forEach((aux) => {
            auxiliaryAccounts[aux.category.key] = aux
          })
        }
        // Convert signed amount to debit/credit for display
        const amount = item.amount || 0
        return {
          _key: crypto.randomUUID(),
          account: item.account,
          text: item.text,
          amount: amount,
          auxiliaryAccounts: Object.entries(auxiliaryAccounts).length > 0 ? auxiliaryAccounts : undefined,
        }
      }),
    }

    form.resetForm({ values: formValues }, { force: true })
  } else {
    voucher.value = undefined
    isEditing.value = true
    form.resetForm({ values: EMPTY_VOUCHER }, { force: true })
  }
}

watch(() => props.voucherId, load, { immediate: true })

// Form submission
const onSubmit = form.handleSubmit(async (values) => {
  // Filter out empty line items
  const validLineItems = values.lineItems.filter((item) => item.account)

  // Transform to API format
  const lineItemsRequest: LineItemRequest[] = validLineItems.map((item) => {
    // Convert auxiliaryAccounts Record to array
    const auxiliaryAccountsArray: AuxiliaryItemRequest[] = Object.entries(item.auxiliaryAccounts ?? {}).map(
      ([categoryKey, auxAccount]) => ({
        categoryKey,
        accountKey: auxAccount.key,
      }),
    )

    return {
      accountNumber: item.account!.accountNumber,
      text: values.headerText,
      amount: item.amount || 0,
      auxiliaryAccounts: auxiliaryAccountsArray,
    }
  })

  if (!props.voucherId) {
    // Create new voucher
    const request: CreateVoucherRequest = {
      headerText: values.headerText,
      attachmentQuantity: values.attachmentQuantity,
      transactionDate: values.transactionDate,
      voucherType: 'general_voucher',
      creator: userStore.state.user.id,
      lineItems: lineItemsRequest,
    }

    const { data, exception } = await VoucherService.createVoucher(props.sobId, request)
    if (exception || !data) return

    toastStore.action.success(t('voucher.msg.success'))
    unsavedChanges.action.disableProtection()
    bus.emit()

    // Navigate to view mode with new voucher
    router.push({
      name: 'voucherDetail',
      params: {
        sobId: props.sobId,
        voucherId: data.id,
      },
    })
  } else {
    // Update existing voucher
    const request: UpdateVoucherRequest = {
      headerText: values.headerText,
      attachmentQuantity: values.attachmentQuantity,
      transactionDate: values.transactionDate,
      updater: userStore.state.user.id,
      lineItems: lineItemsRequest,
    }

    const { exception } = await VoucherService.updateVoucher(props.sobId, props.voucherId, request)
    if (exception) return

    toastStore.action.success(t('voucher.msg.success'))
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
    name: 'voucherList',
    params: {
      sobId: props.sobId,
    },
  })
}

function handleCancel() {
  unsavedChanges.action.disableProtection()
  if (!props.voucherId) {
    // Cancel creating new voucher
    router.push({
      name: 'voucherList',
      params: {
        sobId: props.sobId,
      },
    })
  } else {
    // Cancel editing existing voucher
    load()
  }
}

// Workflow actions
async function handleAudit() {
  if (!props.voucherId) return
  const { exception } = await VoucherService.auditVoucher(props.sobId, props.voucherId, userStore.state.user.id)
  if (exception) return
  toastStore.action.success(t('voucher.msg.auditSuccess'))
  bus.emit()
  await load()
}

async function handleCancelAudit() {
  if (!props.voucherId) return
  confirmationStore.action.confirm({
    title: t('voucher.audit'),
    message: t('voucher.msg.confirmCancelAudit'),
    onConfirm: async () => {
      const { exception } = await VoucherService.cancelAuditVoucher(
        props.sobId,
        props.voucherId!,
        userStore.state.user.id,
      )
      if (exception) return
      toastStore.action.success(t('voucher.msg.cancelAuditSuccess'))
      bus.emit()
      await load()
    },
  })
}

async function handleReview() {
  if (!props.voucherId) return
  const { exception } = await VoucherService.reviewVoucher(props.sobId, props.voucherId, userStore.state.user.id)
  if (exception) return
  toastStore.action.success(t('voucher.msg.reviewSuccess'))
  bus.emit()
  await load()
}

async function handleCancelReview() {
  if (!props.voucherId) return
  confirmationStore.action.confirm({
    title: t('voucher.review'),
    message: t('voucher.msg.confirmCancelReview'),
    onConfirm: async () => {
      const { exception } = await VoucherService.cancelReviewVoucher(
        props.sobId,
        props.voucherId!,
        userStore.state.user.id,
      )
      if (exception) return
      toastStore.action.success(t('voucher.msg.cancelReviewSuccess'))
      bus.emit()
      await load()
    },
  })
}

async function handlePost() {
  if (!props.voucherId) return
  confirmationStore.action.confirm({
    title: t('voucher.post'),
    message: t('voucher.msg.confirmPost'),
    onConfirm: async () => {
      const { exception } = await VoucherService.postVoucher(props.sobId, props.voucherId!, userStore.state.user.id)
      if (exception) return
      toastStore.action.success(t('voucher.msg.postSuccess'))
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
      <template v-if="!isEditing && voucherId">
        <!-- Workflow action buttons -->
        <Button v-if="!voucher?.isAudited" variant="outline" @click="handleAudit">
          {{ $t('voucher.audit') }}
        </Button>
        <Button v-if="voucher?.isAudited && !voucher?.isPosted" variant="outline" @click="handleCancelAudit">
          {{ $t('voucher.cancelAudit') }}
        </Button>
        <Button v-if="!voucher?.isReviewed" variant="outline" @click="handleReview">
          {{ $t('voucher.review') }}
        </Button>
        <Button v-if="voucher?.isReviewed && !voucher?.isPosted" variant="outline" @click="handleCancelReview">
          {{ $t('voucher.cancelReview') }}
        </Button>
        <Button v-if="voucher?.isAudited && voucher?.isReviewed && !voucher?.isPosted" @click="handlePost">
          {{ $t('voucher.post') }}
        </Button>

        <!-- Edit/Close buttons -->
        <Button v-if="!voucher?.isAudited && !voucher?.isReviewed" variant="outline" @click="handleEdit">
          {{ $t('action.edit') }}
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
      <div v-if="voucher && !isEditing" class="flex gap-2">
        <Badge v-if="voucher.isAudited" class="bg-green-600">
          {{ $t('voucher.isAudited') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('voucher.notAudited') }}
        </Badge>
        <Badge v-if="voucher.isReviewed" class="bg-green-600">
          {{ $t('voucher.isReviewed') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('voucher.notReviewed') }}
        </Badge>
        <Badge v-if="voucher.isPosted" class="bg-green-600">
          {{ $t('voucher.isPosted') }}
        </Badge>
        <Badge v-else variant="destructive">
          {{ $t('voucher.notPosted') }}
        </Badge>
      </div>

      <!-- Header section -->
      <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <!-- Header Text -->
        <VeeField v-slot="{ field, errors }" name="headerText">
          <EditableField
            :label="$t('voucher.headerText')"
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
                :placeholder="$t('voucher.headerTextPlaceholder')"
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
            :label="$t('voucher.transactionDate')"
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
            :label="$t('voucher.attachmentQuantity')"
            label-for="attachmentQuantity"
            :is-editing="isEditing"
            :value="field.value"
            :errors="errors"
            :data-invalid="!!errors.length"
            :formatter="(val) => `${val} ${$t('voucher.attachmentQuantityUnit')}`"
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
                <InputGroupAddon align="inline-end">{{ $t('voucher.attachmentQuantityUnit') }}</InputGroupAddon>
              </InputGroup>
            </template>
          </EditableField>
        </VeeField>

        <!-- Creator (readonly, only for existing vouchers) -->
        <EditableField
          v-if="voucher && !isEditing"
          :label="$t('voucher.creator')"
          :is-editing="false"
          :value="voucher.creator"
          :formatter="formatUserName"
        />

        <!-- Auditor (readonly, only for existing vouchers) -->
        <EditableField
          v-if="voucher && voucher.isAudited && !isEditing"
          :label="$t('voucher.auditor')"
          :is-editing="false"
          :value="voucher.auditor"
          :formatter="formatUserName"
        />

        <!-- Reviewer (readonly, only for existing vouchers) -->
        <EditableField
          v-if="voucher && voucher.isReviewed && !isEditing"
          :label="$t('voucher.reviewer')"
          :is-editing="false"
          :value="voucher.reviewer"
          :formatter="formatUserName"
        />
      </div>

      <!-- Line Items Table -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-semibold">{{ $t('voucher.lineItems') }}</h3>

          <!-- Add Line Item Button -->
          <Button v-if="isEditing" variant="outline" @click="addLineItem">
            {{ $t('voucher.addLineItem') }}
          </Button>
        </div>

        <div class="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead class="w-12">#</TableHead>
                <TableHead class="w-50">{{ $t('voucher.account') }}</TableHead>
                <TableHead class="w-37.5">{{ $t('voucher.debit') }}</TableHead>
                <TableHead class="w-37.5">{{ $t('voucher.credit') }}</TableHead>
                <TableHead v-if="isEditing" class="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <template v-for="(item, index) in form.values.lineItems ?? []" :key="item._key">
                <TableRow>
                  <TableCell>{{ index + 1 }}</TableCell>

                  <!-- Account + Auxiliary Accounts -->
                  <TableCell>
                    <div class="space-y-2">
                      <!-- Main Account -->
                      <VeeField v-slot="{ field }" :name="`lineItems[${index}].account`">
                        <template v-if="isEditing">
                          <AccountInput
                            :disabled="!isEditing"
                            :model-value="field.value"
                            @update:model-value="field.onChange"
                          />
                        </template>
                        <template v-else>
                          <div class="text-sm">
                            <span>{{ field.value?.accountNumber }}</span>
                            <span class="ml-1">{{ field.value?.title }}</span>
                          </div>
                        </template>
                      </VeeField>

                      <!-- Auxiliary Accounts -->
                      <div
                        v-if="item.account?.auxiliaryCategories && item.account.auxiliaryCategories.length > 0"
                        class="grid grid-cols-[auto_1fr] items-center gap-2"
                      >
                        <template v-for="category in item.account.auxiliaryCategories" :key="category.key">
                          <span class="text-muted-foreground text-xs font-medium whitespace-nowrap">
                            {{ category.title }}:
                          </span>
                          <VeeField v-slot="{ field }" :name="`lineItems[${index}].auxiliaryAccounts.${category.key}`">
                            <!-- Edit mode: show selector -->
                            <AuxiliaryAccountSelector
                              v-if="isEditing"
                              :sob-id="props.sobId"
                              :category="category"
                              :model-value="field.value"
                              class="w-full"
                              @update:model-value="field.onChange"
                            />
                            <!-- Display mode: show text only -->
                            <div v-else class="text-xs">
                              <span>{{ field.value?.key }}</span>
                              <span class="ml-1">{{ field.value?.title }}</span>
                            </div>
                          </VeeField>
                        </template>
                      </div>
                    </div>
                  </TableCell>

                  <!-- Debit -->
                  <TableCell class="align-top">
                    <VeeField v-slot="{ field }" :name="`lineItems[${index}].amount`">
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
                    <VeeField v-slot="{ field }" :name="`lineItems[${index}].amount`">
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
                      :title="$t('voucher.removeLineItem')"
                      @click="removeLineItem(index)"
                    >
                      <Trash2 class="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              </template>
            </TableBody>
            <TableFooter>
              <!-- Line Item Errors -->
              <template v-for="(item, index) in form.values.lineItems ?? []" :key="`error-${item._key}`">
                <TableRow v-if="form.errors.value[`lineItems[${index}]`]">
                  <TableCell :colspan="isEditing ? 5 : 4" class="bg-destructive/10">
                    <div class="text-destructive flex items-center gap-2 text-sm">
                      <AlertCircle class="h-4 w-4" />
                      <span>
                        {{ $t('voucher.lineItem.errorPrefix', [index + 1]) }}:
                        {{ form.errors.value[`lineItems[${index}]`] }}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              </template>
              <TableRow v-if="form.errors.value['lineItems']">
                <TableCell :colspan="isEditing ? 5 : 4" class="bg-destructive/10">
                  <div class="text-destructive flex items-center gap-2 text-sm">
                    <AlertCircle class="h-4 w-4" />
                    <span>
                      {{ form.errors.value['lineItems'] }}
                    </span>
                  </div>
                </TableCell>
              </TableRow>

              <!-- Totals Row -->
              <TableRow>
                <TableCell :colspan="isEditing ? 5 : 4" class="text-right">
                  <div class="flex items-center justify-end gap-6">
                    <span class="font-semibold"> {{ $t('voucher.debitTotal') }}: {{ $n(debitTotal, 'decimal') }} </span>
                    <span class="font-semibold">
                      {{ $t('voucher.creditTotal') }}: {{ $n(creditTotal, 'decimal') }}
                    </span>
                    <div class="flex items-center gap-2">
                      <template v-if="isBalanced">
                        <CheckCircle2 class="h-4 w-4 text-green-600" />
                        <span class="text-sm text-green-600">{{ $t('voucher.balanced') }}</span>
                      </template>
                      <template v-else>
                        <AlertCircle class="text-destructive h-4 w-4" />
                        <span class="text-destructive text-sm">
                          {{ $t('voucher.unbalanced') }} {{ $t('voucher.difference') }}:
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
