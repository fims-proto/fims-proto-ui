<script setup lang="ts">
defineProps<{
  label: string
}>()
</script>

<template>
  <div class="flex flex-col gap-1">
    <span class="text-secondary-color text-sm">{{ label }}</span>
    <span class="text-color">
      <slot></slot>
    </span>
  </div>
</template>
