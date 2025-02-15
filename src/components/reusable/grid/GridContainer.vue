<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    column?: number | { sm?: number; md?: number; lg?: number } // max 6 columns
  }>(),
  {
    column: () => ({ sm: 1, md: 2, lg: 3 }),
  },
)

const smClasses = ['grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6']
const mdClasses = [
  '@md:grid-cols-1',
  '@md:grid-cols-2',
  '@md:grid-cols-3',
  '@md:grid-cols-4',
  '@md:grid-cols-5',
  '@md:grid-cols-6',
]
const lgClasses = [
  '@lg:grid-cols-1',
  '@lg:grid-cols-2',
  '@lg:grid-cols-3',
  '@lg:grid-cols-4',
  '@lg:grid-cols-5',
  '@lg:grid-cols-6',
]

const gridClass = computed(() => {
  if (typeof props.column === 'number') {
    return smClasses[props.column - 1]
  } else {
    const { sm, md, lg } = props.column
    const smCols = sm ?? md ?? lg ?? 1
    const mdCols = md ?? lg ?? smCols
    const lgCols = lg ?? mdCols
    return [smClasses[smCols - 1], mdClasses[mdCols - 1], lgClasses[lgCols - 1]]
  }
})
</script>

<template>
  <div class="@container">
    <div :class="['grid w-full gap-4', gridClass]">
      <slot></slot>
    </div>
  </div>
</template>
