<script setup lang="ts">
import { TableCell } from '@/components/ui/table'
import ReportEntryCell from './ReportEntryCell.vue'
import ReportAmountCell from './ReportAmountCell.vue'
import type { Entry } from '../report-display-types'

defineProps<{
  entry: Entry
  prevEntry: Entry | null
  amountTypes: string[]
}>()
</script>

<template>
  <!-- First cell: Entry name -->
  <TableCell v-if="entry.text">
    <ReportEntryCell :entry="entry" :prev-entry="prevEntry" />
  </TableCell>

  <!-- Blank row (no text) -->
  <TableCell v-else>
    <ReportEntryCell :entry="entry" :prev-entry="prevEntry" />
  </TableCell>

  <!-- Line number cell -->
  <TableCell class="text-muted-foreground text-center">
    {{ entry.lineNumber ?? '' }}
  </TableCell>

  <!-- Amount cells -->
  <ReportAmountCell v-for="(_, idx) in amountTypes" :key="`amt-${idx}`" :amount="entry.amounts?.[idx]" />
</template>
