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

// Headers for both sides
const assetHeader = computed(() => props.displayData.headers[0] ?? null)
const liabilityHeader = computed(() => props.displayData.headers[1] ?? null)

// Convert rows to flat Entry[] arrays
const assetEntries = computed(() => props.displayData.rows?.map((row) => row.asset.entry!) ?? [])

const liabilityEntries = computed(() => props.displayData.rows?.map((row) => row.liability.entry!) ?? [])

// Handle row click - receives (entry, index) from ReportTable
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
  <div v-if="assetHeader && liabilityHeader && displayData.rows" class="overflow-auto rounded-md border">
    <div class="flex">
      <!-- Assets Table -->
      <ReportTable
        :header="assetHeader"
        :entries="assetEntries"
        :is-editing="isEditing"
        class="border-r"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
        @delete-item="handleDeleteItem"
      />

      <!-- Liabilities + Equity Table -->
      <ReportTable
        :header="liabilityHeader"
        :entries="liabilityEntries"
        :is-editing="isEditing"
        @row-click="handleRowClick"
        @insert-before="handleInsertBefore"
        @insert-child="handleInsertChild"
        @insert-after="handleInsertAfter"
        @delete-item="handleDeleteItem"
      />
    </div>
  </div>
</template>
