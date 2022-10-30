<script lang="ts">
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const get = <T>(obj: any, path: string): T => {
  const parts = path ? path.split('.') : []
  for (let i = 0; i < parts.length && obj; i++) {
    obj = obj[parts[i]]
  }
  return path ? obj : undefined
}
</script>

<script setup lang="ts">
import { ref } from 'vue'
import { FormItemRule } from './BaseForm.vue'
import { injectForm, provideFormItem } from './context'
import { FormValidationStatus } from './interface'

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
  }
)

const itemStatus = ref<FormValidationStatus | undefined>()
const validationMessage = ref<string>()

const Form = injectForm()

const validate = () => {
  itemStatus.value = undefined
  validationMessage.value = undefined

  const value = get<string>(Form?.props.model, props.path)
  const rule = get<FormItemRule>(Form?.props.rules, props.path)

  if (!rule) {
    // no rule specified, regard as validate pass
    return true
  }

  if (rule.required && !value) {
    itemStatus.value = 'error'
    validationMessage.value = rule.message ?? ''
    return false
  }

  if (rule.validator) {
    const validationResult = rule.validator(value)
    if (validationResult instanceof Error) {
      itemStatus.value = 'error'
      validationMessage.value = validationResult.message ?? rule.message ?? ''
      return false
    }
    return validationResult === true
  }

  return true
}

provideFormItem({
  itemStatus,
  handleContentChange: validate,
})
</script>

<template>
  <div>
    <label v-if="!!label" :class="[{ 'sr-only': hideLabel }, 'block text-sm text-neutral-900 mb-2']">
      <span>{{ label }}</span>
      <span v-if="required" class="ml-0.5 text-error-700 select-none" aria-hidden="true">*</span>
    </label>
    <div>
      <slot></slot>
    </div>
    <span v-if="validationMessage" class="text-xs text-error-800">
      {{ validationMessage }}
    </span>
  </div>
</template>
