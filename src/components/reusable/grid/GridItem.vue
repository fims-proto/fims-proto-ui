<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  pt?: {
    label?: object
  }
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <label class="text-secondary-color text-sm" v-bind="pt?.label">
      {{ label }}
      <span v-if="required" class="ml-1 text-rose-500">*</span>
    </label>
    <span class="text-color">
      <slot></slot>
    </span>
  </div>
</template>
