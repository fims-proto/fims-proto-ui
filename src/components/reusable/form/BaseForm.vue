<script setup lang="ts">
import { ref, toRef } from 'vue'
import { provideForm } from './context'
import { type FormRules } from './interface'
import { get, validate } from './utils'

const props = withDefaults(
  defineProps<{
    model?: object
    rules?: FormRules
    edit?: boolean
    labelPlacement?: 'top' | 'left'
    labelWidth?: number | string
    busy?: boolean
  }>(),
  {
    model: () => ({}),
    rules: () => ({}),
    edit: true,
    labelPlacement: 'top',
    labelWidth: undefined,
  },
)

const emit = defineEmits<{
  (event: 'submit'): void
}>()

const itemValidationState = ref<{ [path: string]: true | string }>({})

const validateAllItems = (): boolean => {
  let valid = true
  for (const [path, rule] of Object.entries(props.rules)) {
    const value = get<unknown>(props.model, path)
    const result = validate(value, rule)

    itemValidationState.value[path] = result
    valid = valid && result === true
  }
  return valid
}

const resetValidation = () => {
  for (const path in props.rules) {
    // reset state of all path to true (means normal state)
    itemValidationState.value[path] = true
  }
}

const onSubmit = () => {
  if (validateAllItems() && !props.busy) {
    emit('submit')
  }
}

provideForm({
  model: props.model,
  rules: props.rules,
  edit: toRef(() => props.edit),
  labelPlacement: toRef(() => props.labelPlacement),
  labelWidth: toRef(() => props.labelWidth),
  itemValidationState: itemValidationState,
})

defineExpose({
  validate: validateAllItems,
  resetValidation: resetValidation,
})
</script>

<template>
  <form v-if="edit" @submit.prevent.stop="onSubmit">
    <slot></slot>
  </form>

  <div v-else>
    <slot></slot>
  </div>
</template>
