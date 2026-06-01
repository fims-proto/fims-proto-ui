<script setup lang="ts">
import type { Entry } from '../report-display-types'

defineProps<{
  entry: Entry
}>()
</script>

<template>
  <div :style="{ marginLeft: `${entry.indent * 1.5}rem` }" class="flex min-w-56 items-center gap-1">
    <span v-if="entry.hasSumFactorPrefix" :class="{ 'opacity-0 select-none': !entry.showSumFactorPrefix }">
      {{ $t(`report.chart.sumFactorEnum.${entry.sumFactor}`) }}
    </span>
    <span v-if="entry.hasBreakDownPrefix" :class="{ 'opacity-0 select-none': !entry.showBreakDownPrefix }">
      {{ entry.hasBreakDownPrefix ? $t('report.chart.breakdown') : '' }}
    </span>
    <span :class="{ 'select-none': entry.padding }">{{ entry.padding ? '&nbsp;' : entry.text }}</span>
  </div>
</template>
