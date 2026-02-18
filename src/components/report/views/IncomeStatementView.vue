<script setup lang="ts">
import { computed } from 'vue'
import ReportTable from '../table/ReportTable.vue'
import type { ReportDisplayData, Entry } from '../report-display-types'

const props = defineProps<{
  displayData: ReportDisplayData
  sobId: string
  reportId: string
  isEditing: boolean
}>()

const emit = defineEmits<{
  rowClick: [entry: Entry, index: number]
  insertBefore: [entry: Entry, index: number]
  insertChild: [entry: Entry, index: number]
  insertAfter: [entry: Entry, index: number]
  deleteItem: [entry: Entry, index: number]
}>()

// Get header and entries for income statement (single column)
const header = computed(() => props.displayData.headers[0])
const entries = computed(() => props.displayData.entries ?? [])

function handleRowClick(entry: Entry, index: number) {
  emit('rowClick', entry, index)
}

function handleInsertBefore(entry: Entry, index: number) {
  emit('insertBefore', entry, index)
}

function handleInsertChild(entry: Entry, index: number) {
  emit('insertChild', entry, index)
}

function handleInsertAfter(entry: Entry, index: number) {
  emit('insertAfter', entry, index)
}

function handleDeleteItem(entry: Entry, index: number) {
  emit('deleteItem', entry, index)
}
</script>

<template>
  <div v-if="header && entries.length > 0" class="overflow-auto rounded-md border">
    <ReportTable
      :header="header"
      :entries="entries"
      :is-editing="isEditing"
      @row-click="handleRowClick"
      @insert-before="handleInsertBefore"
      @insert-child="handleInsertChild"
      @insert-after="handleInsertAfter"
      @delete-item="handleDeleteItem"
    />
  </div>
</template>
