<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Entry } from '../report-display-types'
import { getEntryPrefixInfo } from '../report-entry-helpers'

const props = defineProps<{
  entry: Entry
  prevEntry: Entry | null
}>()

const { t } = useI18n()

const prefixInfo = computed(() => getEntryPrefixInfo(props.entry, props.prevEntry, t))
</script>

<template>
  <div :style="{ marginLeft: `${entry.indentation}rem` }" class="flex items-center gap-1">
    <!-- Sum factor prefix: always rendered for alignment, conditionally hidden -->
    <span
      v-if="prefixInfo.sumFactorText"
      class="text-muted-foreground"
      :class="{ invisible: !prefixInfo.sumFactorVisible }"
    >
      {{ prefixInfo.sumFactorText }}
    </span>
    <!-- Breakdown prefix: always rendered for alignment, conditionally hidden -->
    <span
      v-if="prefixInfo.breakdownText"
      class="text-muted-foreground"
      :class="{ invisible: !prefixInfo.breakdownVisible }"
    >
      {{ prefixInfo.breakdownText }}
    </span>
    {{ entry.text || '&nbsp;' }}
  </div>
</template>
