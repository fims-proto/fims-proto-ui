<script setup lang="ts">
import { ref, toRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { injectForm, provideFormItem } from './context'
import { type FormItemRule, type FormValidationStatus } from './interface'
import { get, validate } from './utils'

const props = defineProps<{
  label?: string
  hideLabel?: boolean
  required?: boolean
  path?: string
}>()

const { t } = useI18n()

const Form = injectForm()

const labelRef = ref()
const itemStatus = ref<FormValidationStatus | undefined>()
const validationMessage = ref<string>()

const edit = toRef(() => Form?.edit.value ?? true)
const topLabel = toRef(() => Form?.labelPlacement.value === 'top')
const labelWidth = toRef(() => Form?.labelWidth.value ?? 'auto')

props.path &&
  watch(
    () => Form?.itemValidationState.value[props.path as string],
    () => {
      const result = Form?.itemValidationState.value[props.path as string]
      result !== undefined && result !== null && updateValidationState(result)
    },
  )

const updateValidationState = (state: true | string) => {
  itemStatus.value = undefined
  validationMessage.value = undefined

  if (state !== true) {
    itemStatus.value = 'error'
    validationMessage.value = t(state)
  }
}

const validateItem = () => {
  if (!props.path) {
    return
  }
  const value = get<unknown>(Form?.model, props.path)
  const rule = get<FormItemRule>(Form?.rules, props.path)

  updateValidationState(validate(value, rule))
}

provideFormItem({
  itemStatus,
  handleContentChange: validateItem,
})
</script>

<template>
  <div>
    <label
      v-if="!!label"
      class="flex text-sm text-neutral-900/80"
      :class="[{ 'sr-only': hideLabel }, topLabel ? 'flex-col gap-2' : 'flex-row gap-3 items-center']"
    >
      <div ref="labelRef" :style="{ width: labelWidth }" :class="{ 'text-right': !topLabel }">
        <span>{{ label }}:</span>
        <span v-if="required && edit" class="ml-0.5 text-error-700 font-bold select-none" aria-hidden="true">*</span>
      </div>

      <div class="flex-1">
        <slot></slot>
      </div>
    </label>
    <span v-if="validationMessage" :style="{ marginLeft: labelWidth }" class="text-xs text-error-800">
      {{ validationMessage }}
    </span>
  </div>
</template>
