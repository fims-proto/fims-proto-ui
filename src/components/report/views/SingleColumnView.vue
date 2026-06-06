<script setup lang="ts">
import { computed } from 'vue'
import ReportTable from '../table/ReportTable.vue'
import type { ReportDisplayData, Entry } from '../report-display-types.ts'

const props = defineProps<{
  displayData: ReportDisplayData
  isEditing: boolean
}>()

const emit = defineEmits<{
  rowClick: [entry: Entry]
  insertBefore: [entry: Entry]
  insertChild: [entry: Entry]
  insertAfter: [entry: Entry]
}>()

const header = computed(() => props.displayData.headers[0])
const entries = computed(() => props.displayData.entries ?? [])
</script>

<template>
  <div v-if="header && entries.length > 0" class="overflow-auto rounded-md border">
    <ReportTable
      :header="header"
      :entries="entries"
      :is-editing="isEditing"
      @row-click="emit('rowClick', $event)"
      @insert-before="emit('insertBefore', $event)"
      @insert-child="emit('insertChild', $event)"
      @insert-after="emit('insertAfter', $event)"
    />
  </div>
</template>
