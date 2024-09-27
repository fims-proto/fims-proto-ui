<script setup lang="ts">
import { ref } from 'vue'
import { type FormItemState, type FormRules } from './interface'
import { get, validate } from './utils'

const props = withDefaults(
  defineProps<{
    model?: object
    rules?: FormRules
    edit?: boolean
    busy?: boolean
  }>(),
  {
    model: () => ({}),
    rules: () => ({}),
    edit: true,
  },
)

const emit = defineEmits<{
  (event: 'submit'): void
  (event: 'itemStateChange', FormItemState: FormItemState): void
}>()

const itemState = ref<FormItemState>({})

const validateAllItems = (): boolean => {
  let valid = true
  for (const [path, rule] of Object.entries(props.rules)) {
    const value = get<unknown>(props.model, path)
    const result = validate(value, rule)

    itemState.value[path] = result
    valid = valid && !result.invalid
  }
  emit('itemStateChange', itemState.value)
  return valid
}

const resetValidation = () => {
  for (const path in props.rules) {
    // reset state of all path to true (means normal state)
    itemState.value[path] = { invalid: false }
  }
  emit('itemStateChange', itemState.value)
}

const onSubmit = () => {
  if (validateAllItems() && !props.busy) {
    emit('submit')
  }
}

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
