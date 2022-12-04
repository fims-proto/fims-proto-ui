<script setup lang="ts">
import { ref } from 'vue'
import { provideForm } from './context'
import { FormRules } from './interface'
import { get, validate } from './utils'

const props = withDefaults(
  defineProps<{
    model?: object
    rules?: FormRules
  }>(),
  {
    model: () => ({}),
    rules: () => ({}),
  }
)

defineEmits<{
  (event: 'submit'): void
}>()

const itemValidationState = ref<Record<string, true | string>>({})

const validateAllItems = () => {
  for (const [path, rule] of Object.entries(props.rules)) {
    const value = get<string>(props.model, path)
    const result = validate(value, rule)

    itemValidationState.value[path] = result
  }
}

const resetValidation = () => {
  for (const path in props.rules) {
    // reset state of all path to true (means normal state)
    itemValidationState.value[path] = true
  }
}

provideForm({
  model: props.model,
  rules: props.rules,
  itemValidationState: itemValidationState,
})

defineExpose({
  validate: validateAllItems,
  resetValidation: resetValidation,
})
</script>

<template>
  <form @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>
