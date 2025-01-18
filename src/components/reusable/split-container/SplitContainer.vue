<script setup lang="ts">
defineProps<{
  detailOpen: boolean
}>()
</script>

<template>
  <div class="flex w-full gap-4">
    <div :class="[detailOpen ? 'w-4/12' : 'w-full']">
      <slot name="list" :detail-open="detailOpen"></slot>
    </div>
    <div v-if="detailOpen" class="w-8/12">
      <slot name="detail"></slot>
    </div>
  </div>
</template>
