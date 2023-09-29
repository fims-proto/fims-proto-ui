<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { injectForm, provideFormItem } from './context'
import { type FormItemRule, type FormValidationStatus } from './interface'
import { get, validate } from './utils'

const props = withDefaults(
  defineProps<{
    label?: string
    hideLabel?: boolean
    required?: boolean
    path?: string
  }>(),
  {
    label: undefined,
    path: undefined,
  },
)

const { t } = useI18n()

const itemStatus = ref<FormValidationStatus | undefined>()
const validationMessage = ref<string>()

const Form = injectForm()

const edit = computed(() => Form?.edit.value ?? true)

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
    <label v-if="!!label" :class="[{ 'sr-only': hideLabel }, 'block text-sm text-neutral-900/80 mb-2']">
      <span>{{ label }}:</span>
      <span v-if="required && edit" class="ml-0.5 text-error-700 font-bold select-none" aria-hidden="true">*</span>
    </label>
    <div>
      <slot></slot>
    </div>
    <span v-if="validationMessage" class="text-xs text-error-800">
      {{ validationMessage }}
    </span>
  </div>
</template>
