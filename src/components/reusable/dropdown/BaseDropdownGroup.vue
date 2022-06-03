<script setup lang="ts">
defineProps({
  title: { type: String, default: undefined },
})
</script>

<template>
  <div>
    <span v-if="!!title" class="block p-2 text-neutral-400 text-sm cursor-default">{{ title }}</span>
    <slot></slot>
  </div>
</template>
