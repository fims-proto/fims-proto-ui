<script setup lang="ts">
defineProps<{ required?: boolean }>()
</script>

<template>
  <label>
    <slot></slot>
    <span v-if="required" class="ml-1 text-rose-500">*</span>
  </label>
</template>
