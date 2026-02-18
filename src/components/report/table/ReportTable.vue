<script setup lang="ts">
import { Table, TableBody, TableHead, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CornerUpRight, Plus, CornerDownRight } from 'lucide-vue-next'
import ReportRow from './ReportRow.vue'
import type { Header, Entry } from '../report-display-types'

const props = defineProps<{
  header: Header
  entries: Entry[]
  isEditing: boolean
}>()

const emit = defineEmits<{
  rowClick: [entry: Entry, index: number]
  insertBefore: [entry: Entry, index: number]
  insertChild: [entry: Entry, index: number]
  insertAfter: [entry: Entry, index: number]
  deleteItem: [entry: Entry, index: number]
}>()

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

function confirmDelete(entry: Entry, index: number) {
  emit('deleteItem', entry, index)
}

function getPrevEntry(index: number): Entry | null {
  return index > 0 ? (props.entries[index - 1] ?? null) : null
}
</script>

<template>
  <Table class="border-collapse [&_td]:border-b [&_th]:border-b [&_tr:last-child_td]:border-b-0">
    <TableBody>
      <!-- Header row -->
      <TableRow class="bg-muted/50">
        <TableHead scope="col" class="font-bold">{{ header.title }}</TableHead>
        <TableHead scope="col" class="w-16 text-center font-bold">
          {{ header.lineNumberLabel }}
        </TableHead>
        <TableHead
          v-for="(amountType, idx) in header.amountTypes"
          :key="`amt-header-${idx}`"
          scope="col"
          class="w-32 text-right font-bold tabular-nums"
        >
          {{ amountType }}
        </TableHead>
      </TableRow>

      <!-- Data rows -->
      <DropdownMenu v-for="(entry, index) in entries" :key="entry.id">
        <DropdownMenuTrigger v-if="entry.isEditable" as-child>
          <TableRow role="button">
            <ReportRow :entry="entry" :prev-entry="getPrevEntry(index)" :amount-types="header.amountTypes" />
          </TableRow>
        </DropdownMenuTrigger>

        <TableRow v-else role="button" @click="handleRowClick(entry, index)">
          <ReportRow :entry="entry" :prev-entry="getPrevEntry(index)" :amount-types="header.amountTypes" />
        </TableRow>

        <DropdownMenuContent v-if="entry.isEditable" align="start" :align-offset="4">
          <DropdownMenuItem @click="handleRowClick(entry, index)">
            {{ isEditing ? $t('action.edit') : $t('action.detail') }}
          </DropdownMenuItem>

          <!-- Only show add/delete options in edit mode -->
          <template v-if="isEditing">
            <DropdownMenuSeparator />
            <DropdownMenuItem @click="handleInsertBefore(entry, index)">
              <CornerUpRight class="mr-1 h-4 w-4" />
              {{ $t('report.btn.insertBefore') }}
            </DropdownMenuItem>

            <!-- Conditionally show "Insert Child" only if isAbleToAddChild is true -->
            <DropdownMenuItem v-if="entry.isAbleToAddChild" @click="handleInsertChild(entry, index)">
              <Plus class="mr-1 h-4 w-4" />
              {{ $t('report.btn.insertChild') }}
            </DropdownMenuItem>

            <DropdownMenuItem @click="handleInsertAfter(entry, index)">
              <CornerDownRight class="mr-1 h-4 w-4" />
              {{ $t('report.btn.insertAfter') }}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem class="text-destructive" @click="confirmDelete(entry, index)">
              {{ $t('action.delete') }}
            </DropdownMenuItem>
          </template>
        </DropdownMenuContent>
      </DropdownMenu>
    </TableBody>
  </Table>
</template>
