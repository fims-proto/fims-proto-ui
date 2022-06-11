<script setup lang="ts">
import { injectForm } from './context'

defineProps<{
  label: string
  hideLabel?: boolean
  required?: boolean
}>()

const Form = injectForm()
const hideRequiredMark = Form?.hideRequiredMark.value
</script>

<template>
  <div>
    <label v-if="!!label" :class="[{ 'sr-only': hideLabel }, 'block text-sm text-neutral-900 mb-2']">
      <span>{{ label }}</span>
      <span v-if="required && !hideRequiredMark" class="ml-0.5 text-error-700 select-none" aria-hidden="true">*</span>
    </label>
    <slot></slot>
  </div>
</template>
