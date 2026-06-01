<script setup lang="ts">
import { computed } from 'vue'
import ReportTable from '../table/ReportTable.vue'
import type { ReportDisplayData, Entry } from '../report-display-types'

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

const leftHeader = computed(() => props.displayData.headers[0])
const rightHeader = computed(() => props.displayData.headers[1])
const leftEntries = computed(() => props.displayData.balanceSheetEntries?.[0] ?? [])
const rightEntries = computed(() => props.displayData.balanceSheetEntries?.[1] ?? [])
</script>

<template>
  <div v-if="leftHeader && rightHeader" class="overflow-auto rounded-md border">
    <div class="grid min-w-max grid-cols-2">
      <ReportTable
        :header="leftHeader"
        :entries="leftEntries"
        :is-editing="isEditing"
        class="border-r"
        @row-click="emit('rowClick', $event)"
        @insert-before="emit('insertBefore', $event)"
        @insert-child="emit('insertChild', $event)"
        @insert-after="emit('insertAfter', $event)"
      />

      <ReportTable
        :header="rightHeader"
        :entries="rightEntries"
        :is-editing="isEditing"
        @row-click="emit('rowClick', $event)"
        @insert-before="emit('insertBefore', $event)"
        @insert-child="emit('insertChild', $event)"
        @insert-after="emit('insertAfter', $event)"
      />
    </div>
  </div>
</template>
