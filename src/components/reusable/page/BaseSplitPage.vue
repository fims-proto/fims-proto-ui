<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  detailSize?: 'S' | 'M' | 'L'
  openDetail: boolean
}>()

const detailFlexBasis = computed(() => {
  switch (props.detailSize) {
    case 'S':
      return 'basis-1/4'
    case 'L':
      return 'basis-3/4'
    default:
      return 'basis-1/2'
  }
})
</script>

<template>
  <div class="flex w-full">
    <!-- master view -->
    <div class="flex-auto">
      <slot name="main" />
    </div>

    <!-- detail view -->
    <div v-show="openDetail" :class="detailFlexBasis">
      <slot name="detail" />
    </div>
  </div>
</template>
