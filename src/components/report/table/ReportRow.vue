<script setup lang="ts">
import { TableCell } from '@/components/ui/table'
import ReportEntryCell from './ReportEntryCell.vue'
import ReportAmountCell from './ReportAmountCell.vue'
import type { Entry } from '../report-display-types'

defineProps<{
  entry: Entry
  columnCount: number
}>()
</script>

<template>
  <TableCell>
    <ReportEntryCell :entry="entry" />
  </TableCell>

  <TableCell class="text-muted-foreground w-16 text-center">
    {{ entry.showLineNo ? entry.lineNo : '' }}
  </TableCell>

  <ReportAmountCell v-for="idx in columnCount" :key="`amt-${idx}`" :amount="entry.amounts?.[idx - 1]" />
</template>
