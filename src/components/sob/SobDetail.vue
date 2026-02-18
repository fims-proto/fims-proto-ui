<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useForm, Field as VeeField } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useEventBus } from '@vueuse/core'
import { z } from 'zod'

import { PageFrame } from '@/components/common/page'
import { Field, FieldError } from '@/components/ui/field'
import { Label } from '@/components/ui/label'
import { EditableField } from '@/components/common/form'
import { Button } from '@/components/ui/button'
import { ButtonGroup } from '@/components/ui/button-group'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from '@/components/ui/input-group'
import { Minus, Plus } from 'lucide-vue-next'

import { NewSobSchema, UpdateSobSchema, SobService, type Sob, type NewSob, type UpdateSob } from '@/services/sob'
import { useToastStore } from '@/store/toast'
import { SOB_CHANGED } from '@/services/event'
import { useUnsavedChangesStore } from '@/store/unsaved-changes'

const props = defineProps<{
  sobId?: string
}>()

const router = useRouter()
const { t } = useI18n()
const toast = useToastStore()
const unsavedChanges = useUnsavedChangesStore()
const bus = useEventBus(SOB_CHANGED)

const isEditing = ref(!props.sobId)
const originalAccountsCodeLength = ref<number[]>([])

const { year, month } = (() => ({
  year: new Date().getUTCFullYear(),
  month: new Date().getUTCMonth() + 1,
}))()

const EMPTY_SOB = {
  name: '',
  description: undefined,
  baseCurrency: 'CNY',
  startingPeriodYear: year,
  startingPeriodMonth: month,
  accountsCodeLength: [4, 2, 2],
}

function createFormSchema(isEdit: boolean, originalLengths: number[]) {
  const baseSchema = isEdit ? UpdateSobSchema : NewSobSchema

  if (!isEdit || originalLengths.length === 0) {
    return baseSchema
  }

  // Edit mode: add validation that each length can only increase
  return baseSchema.superRefine((data, ctx) => {
    if (!data.accountsCodeLength) {
      return
    }

    data.accountsCodeLength.forEach((newLength, index) => {
      const originalLength = originalLengths[index]

      if (originalLength !== undefined && newLength < originalLength) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['accountsCodeLength', index],
          message: t('sob.validation.lengthCannotDecrease', [index + 1, originalLength, newLength]),
        })
      }
    })
  })
}

const existingSob = ref<Sob>()
const formSchema = ref(toTypedSchema(createFormSchema(false, [])))

const form = useForm({
  validationSchema: formSchema,
})

watch(() => props.sobId, load, { immediate: true })
watch(
  () => form.meta.value.dirty,
  (val) => {
    if (val) {
      unsavedChanges.action.enableProtection()
    } else {
      unsavedChanges.action.disableProtection()
    }
  },
)

async function load() {
  if (props.sobId) {
    isEditing.value = false
    const { data } = await SobService.getSobById(props.sobId)
    if (data) {
      existingSob.value = data
      originalAccountsCodeLength.value = [...existingSob.value.accountsCodeLength]
      formSchema.value = toTypedSchema(createFormSchema(true, originalAccountsCodeLength.value))
      form.resetForm({ values: existingSob.value }, { force: true })
    }
  } else {
    isEditing.value = true
    originalAccountsCodeLength.value = []
    formSchema.value = toTypedSchema(createFormSchema(false, []))
    form.resetForm({ values: EMPTY_SOB }, { force: true })
  }
}

function onLengthChange(direction: '+' | '-') {
  if (!form.values.accountsCodeLength) {
    return
  }

  if (direction === '+' && form.values.accountsCodeLength.length < 10) {
    form.setFieldValue('accountsCodeLength', [...form.values.accountsCodeLength, 2])
  }
  if (direction === '-' && form.values.accountsCodeLength.length > 2) {
    // In edit mode, cannot reduce below original length
    if (
      props.sobId &&
      isEditing.value &&
      form.values.accountsCodeLength.length <= originalAccountsCodeLength.value.length
    ) {
      return
    }
    form.setFieldValue('accountsCodeLength', form.values.accountsCodeLength.slice(0, -1))
  }
}

function onCodeLengthChange(index: number, value: string | number) {
  if (!form.values.accountsCodeLength) {
    return
  }
  const numValue = typeof value === 'string' ? parseInt(value, 10) : value
  if (isNaN(numValue)) {
    return
  }
  const newLengths = [...form.values.accountsCodeLength]
  newLengths[index] = numValue
  form.setFieldValue('accountsCodeLength', newLengths)
}

const onSubmit = form.handleSubmit(async (values, { resetForm }) => {
  let data: Sob | undefined
  let exception: unknown

  if (props.sobId) {
    ;({ exception } = await SobService.updateSob(props.sobId, values as UpdateSob))
  } else {
    ;({ data, exception } = await SobService.createSob(values as NewSob))
  }

  if (exception) {
    return
  }

  resetForm({ values })
  toast.action.success(t('sob.msg.saveSuccess'))
  bus.emit()

  if (!props.sobId && data) {
    router.push({ name: 'sobDetail', params: { sobId: data.id } })
    return
  }

  if (props.sobId) {
    isEditing.value = false
  }
})

function onCancel() {
  unsavedChanges.action.disableProtection()
  if (!props.sobId) {
    router.back()
  } else {
    isEditing.value = false
    load()
  }
}

function onEdit() {
  isEditing.value = true
}

function onClose() {
  router.push({ name: 'sobList' })
}
</script>

<template>
  <PageFrame
    :secondary-title="!props.sobId ? $t('common.createPage') : $t('common.detailPage')"
    :dirty-indicator="form.meta.value.dirty"
  >
    <template #end>
      <!-- Display mode: Edit + Close -->
      <template v-if="!isEditing && props.sobId">
        <Button variant="outline" @click="onEdit">{{ $t('action.edit') }}</Button>
        <Button variant="ghost" @click="onClose">{{ $t('action.close') }}</Button>
      </template>
      <!-- Edit/Create mode: Save + Cancel -->
      <template v-if="isEditing">
        <Button @click="onSubmit">{{ $t('action.save') }}</Button>
        <Button variant="ghost" @click="onCancel">{{ $t('action.cancel') }}</Button>
      </template>
    </template>

    <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
      <!-- Name -->
      <VeeField v-slot="{ field, errors }" name="name">
        <EditableField
          :label="$t('sob.name')"
          label-for="name"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <Input
              id="name"
              type="text"
              :model-value="value"
              :name="field.name"
              :aria-invalid="!!errors.length"
              @update:model-value="onUpdate"
              @blur="field.onBlur"
            />
          </template>
        </EditableField>
      </VeeField>

      <!-- Description -->
      <VeeField v-slot="{ field, errors }" name="description">
        <EditableField
          :label="$t('common.description')"
          label-for="description"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #edit="{ value, onUpdate }">
            <Textarea
              id="description"
              :model-value="value"
              :name="field.name"
              :aria-invalid="!!errors.length"
              @update:model-value="onUpdate"
              @blur="field.onBlur"
            />
          </template>
        </EditableField>
      </VeeField>

      <!-- Base Currency -->
      <VeeField v-slot="{ field, errors }" name="baseCurrency">
        <EditableField
          :label="$t('sob.baseCurrency')"
          label-for="baseCurrency"
          :is-editing="false"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          @update:value="field.onChange"
        >
          <template #display="{ value }">
            <span>{{ value }}</span>
          </template>
        </EditableField>
      </VeeField>

      <!-- Starting Period, edit mode -->
      <div v-if="isEditing" class="flex flex-col gap-2">
        <Label for="starting-period-year-input" class="text-sm leading-none font-medium">
          {{ $t('sob.startingPeriod') }}
        </Label>
        <div class="flex gap-2">
          <VeeField v-slot="{ field, errors }" name="startingPeriodYear">
            <Field :data-invalid="!!errors.length">
              <InputGroup>
                <InputGroupInput
                  id="starting-period-year-input"
                  type="number"
                  :min="2000"
                  :max="3000"
                  :disabled="!isEditing || !!props.sobId"
                  :model-value="field.value"
                  :name="field.name"
                  :aria-invalid="!!errors.length"
                  @blur="field.onBlur"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{{ $t('common.year') }}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>

          <VeeField v-slot="{ field, errors }" name="startingPeriodMonth">
            <Field :data-invalid="!!errors.length">
              <InputGroup>
                <InputGroupInput
                  type="number"
                  :min="1"
                  :max="12"
                  :disabled="!isEditing || !!props.sobId"
                  :model-value="field.value"
                  :name="field.name"
                  :aria-invalid="!!errors.length"
                  @blur="field.onBlur"
                  @update:model-value="field.onChange"
                />
                <InputGroupAddon align="inline-end">
                  <InputGroupText>{{ $t('common.month') }}</InputGroupText>
                </InputGroupAddon>
              </InputGroup>
              <FieldError v-if="errors.length" :errors="errors" />
            </Field>
          </VeeField>
        </div>
      </div>

      <!-- Starting Period, display mode -->
      <div v-else>
        <EditableField
          :label="$t('sob.startingPeriod')"
          :is-editing="false"
          :value="`${existingSob?.startingPeriodYear} ${$t('common.year')} ${existingSob?.startingPeriodMonth} ${$t('common.month')}`"
        />
      </div>

      <!-- Account Code Length -->
      <VeeField v-slot="{ field, errors }" name="accountsCodeLength">
        <EditableField
          :label="$t('sob.accountCodeLength')"
          :is-editing="isEditing"
          :value="field.value"
          :errors="errors"
          :data-invalid="!!errors.length"
          :formatter="(val) => (val ? val.join(' - ') : '')"
          @update:value="field.onChange"
        >
          <template #edit="{ value }">
            <div class="flex gap-2">
              <ButtonGroup>
                <Button type="button" variant="outline" size="icon" :disabled="!isEditing" @click="onLengthChange('-')">
                  <Minus class="h-4 w-4" />
                </Button>
                <Button type="button" variant="outline" size="icon" :disabled="!isEditing" @click="onLengthChange('+')">
                  <Plus class="h-4 w-4" />
                </Button>
              </ButtonGroup>
              <div class="flex items-center gap-2">
                <Input
                  v-for="(length, index) in value"
                  :id="useId()"
                  :key="index"
                  type="number"
                  :min="1"
                  :max="6"
                  :model-value="length"
                  class="w-10 [appearance:textfield] text-center [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  @update:model-value="(val) => onCodeLengthChange(index as number, val)"
                />
              </div>
            </div>
          </template>
        </EditableField>
      </VeeField>
    </form>
  </PageFrame>
</template>
