<script lang="ts">
export type FormItemValidator = (value: string) => boolean | Error

export type FormItemRule = {
  required?: boolean
  validator?: FormItemValidator
  message?: string
}

export type FormRules = {
  [path: string]: FormRules | FormItemRule
}

export type FormProps = {
  name?: string
  model?: object
  rules?: FormRules
}
</script>

<script setup lang="ts">
import { provideForm } from './context'

const props = withDefaults(defineProps<FormProps>(), {
  name: undefined,
  model: () => ({}),
  rules: () => ({}),
})

defineEmits<{
  (event: 'submit'): void
}>()

provideForm({
  props,
})
</script>

<template>
  <form @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>
