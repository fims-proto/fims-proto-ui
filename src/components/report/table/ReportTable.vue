<script setup lang="ts">
import { Table, TableBody, TableHead, TableRow } from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { CornerDownRight, CornerUpRight, Plus } from 'lucide-vue-next'
import ReportRow from './ReportRow.vue'
import type { Header, Entry } from '../report-display-types'

defineProps<{
  header: Header
  entries: Entry[]
  isEditing: boolean
}>()

const emit = defineEmits<{
  rowClick: [entry: Entry]
  insertBefore: [entry: Entry]
  insertChild: [entry: Entry]
  insertAfter: [entry: Entry]
}>()
</script>

<template>
  <Table
    class="border-collapse [&_td]:border-r [&_td]:border-b [&_th]:border-r [&_th]:border-b [&_tr_td:last-child]:border-r-0 [&_tr_th:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0"
  >
    <TableBody>
      <TableRow class="bg-muted/50">
        <TableHead scope="col" class="min-w-64 font-bold">{{ header.rowTextLabel }}</TableHead>
        <TableHead scope="col" class="w-16 text-center font-bold">
          {{ header.lineNumberLabel }}
        </TableHead>
        <TableHead
          v-for="column in header.columns"
          :key="column.id"
          scope="col"
          class="w-32 text-right font-bold tabular-nums"
        >
          {{ column.label }}
        </TableHead>
      </TableRow>

      <template v-for="entry in entries" :key="entry.id">
        <DropdownMenu v-if="entry.canEdit || entry.canAddChild">
          <DropdownMenuTrigger as-child>
            <TableRow role="button">
              <ReportRow :entry="entry" :column-count="header.columns.length" />
            </TableRow>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" :align-offset="4">
            <DropdownMenuItem @click="emit('rowClick', entry)">
              {{ isEditing && entry.canEdit ? $t('action.edit') : $t('action.detail') }}
            </DropdownMenuItem>

            <template v-if="isEditing">
              <DropdownMenuSeparator />
              <DropdownMenuItem v-if="entry.canEdit" @click="emit('insertBefore', entry)">
                <CornerUpRight class="mr-1 h-4 w-4" />
                {{ $t('report.btn.insertBefore') }}
              </DropdownMenuItem>

              <DropdownMenuItem v-if="entry.canAddChild" @click="emit('insertChild', entry)">
                <Plus class="mr-1 h-4 w-4" />
                {{ $t('report.btn.insertChild') }}
              </DropdownMenuItem>

              <DropdownMenuItem v-if="entry.canEdit" @click="emit('insertAfter', entry)">
                <CornerDownRight class="mr-1 h-4 w-4" />
                {{ $t('report.btn.insertAfter') }}
              </DropdownMenuItem>
            </template>
          </DropdownMenuContent>
        </DropdownMenu>

        <TableRow v-else role="button" @click="emit('rowClick', entry)">
          <ReportRow :entry="entry" :column-count="header.columns.length" />
        </TableRow>
      </template>
    </TableBody>
  </Table>
</template>
