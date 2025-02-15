<script setup lang="ts">
withDefaults(
  defineProps<{
    label: string
    span?: number | 'full'
    required?: boolean
    pt?: {
      label?: object
    }
  }>(),
  {
    span: 1,
    required: false,
    pt: undefined,
  },
)
</script>

<template>
  <div :class="['flex flex-col gap-1', `col-span-${span}`]">
    <label class="text-secondary-color text-sm" v-bind="pt?.label">
      {{ label }}
      <span v-if="required" class="ml-1 text-rose-500">*</span>
    </label>
    <span class="text-color">
      <slot></slot>
    </span>
  </div>
</template>
