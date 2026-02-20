<script setup lang="ts" generic="TData, TValue">
import { ref } from 'vue'
import type { ColumnDef, ColumnFiltersState, SortingState, VisibilityState, ExpandedState } from '@tanstack/vue-table'
import {
  FlexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getSortedRowModel,
  useVueTable,
} from '@tanstack/vue-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import DataTableToolbar, { type DataTableToolbarFacetedFilter } from './DataTableToolbar.vue'

import { valueUpdater } from '@/lib/utils'

const props = defineProps<{
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  facetedFilters?: DataTableToolbarFacetedFilter[]
  getSubRows?: (originalRow: TData, index: number) => undefined | TData[]
  initialExpanded?: boolean | Record<string, boolean>
  onRowClick?: (row: TData) => void
  rowCount?: number
  hasMore?: boolean
  isLoading?: boolean
  bordered?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
}>()

const globalFilter = ref('')
const sorting = ref<SortingState>([])
const columnFilters = ref<ColumnFiltersState>([])
const columnVisibility = ref<VisibilityState>({})
const expanded = ref<ExpandedState>(typeof props.initialExpanded === 'boolean' ? true : (props.initialExpanded ?? {}))

const expandAll = () => {
  table.toggleAllRowsExpanded(true)
}

const collapseAll = () => {
  table.toggleAllRowsExpanded(false)
}

const table = useVueTable({
  get data() {
    return props.data
  },
  get columns() {
    return props.columns
  },
  getCoreRowModel: getCoreRowModel(),
  getSortedRowModel: getSortedRowModel(),
  getFilteredRowModel: getFilteredRowModel(),
  getFacetedRowModel: getFacetedRowModel(),
  getFacetedUniqueValues: getFacetedUniqueValues(),
  getExpandedRowModel: getExpandedRowModel(),
  getSubRows: props.getSubRows,
  onGlobalFilterChange: (updaterOrValue) => valueUpdater(updaterOrValue, globalFilter),
  onSortingChange: (updaterOrValue) => valueUpdater(updaterOrValue, sorting),
  onColumnFiltersChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnFilters),
  onColumnVisibilityChange: (updaterOrValue) => valueUpdater(updaterOrValue, columnVisibility),
  onExpandedChange: (updaterOrValue) => valueUpdater(updaterOrValue, expanded),
  state: {
    get sorting() {
      return sorting.value
    },
    get globalFilter() {
      return globalFilter.value
    },
    get columnFilters() {
      return columnFilters.value
    },
    get columnVisibility() {
      return columnVisibility.value
    },
    get expanded() {
      return expanded.value
    },
  },
})
</script>

<template>
  <div class="flex h-full flex-col gap-2">
    <!-- table header - fixed -->
    <DataTableToolbar
      v-model:global-filter="globalFilter"
      :table="table"
      :faceted-filters="facetedFilters"
      :has-sub-rows="!!getSubRows"
      @expand-all="expandAll"
      @collapse-all="collapseAll"
    />

    <!-- table - scrollable -->
    <div class="min-h-0 flex-1 overflow-auto rounded-md border">
      <Table
        :class="{
          'border-collapse [&_td]:border-r [&_td]:border-b [&_td:last-child]:border-r-0 [&_th]:border-r [&_th]:border-b [&_th:last-child]:border-r-0 [&_tr:last-child_td]:border-b-0':
            props.bordered,
        }"
      >
        <TableHeader>
          <TableRow v-for="headerGroup in table.getHeaderGroups()" :key="headerGroup.id">
            <TableHead
              v-for="header in headerGroup.headers"
              :key="header.id"
              :colspan="header.colSpan"
              :class="(header.column.columnDef.meta as any)?.class"
            >
              <FlexRender
                v-if="!header.isPlaceholder"
                :render="header.column.columnDef.header"
                :props="header.getContext()"
              />
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <template v-if="table.getRowModel().rows?.length">
            <TableRow
              v-for="row in table.getRowModel().rows"
              :key="row.id"
              :data-state="row.getIsSelected() ? 'selected' : undefined"
              :class="props.onRowClick ? 'hover:bg-muted/50 cursor-pointer' : ''"
              @click="props.onRowClick?.(row.original)"
            >
              <TableCell
                v-for="cell in row.getVisibleCells()"
                :key="cell.id"
                :class="(cell.column.columnDef.meta as any)?.class"
              >
                <FlexRender :render="cell.column.columnDef.cell" :props="cell.getContext()" />
              </TableCell>
            </TableRow>
          </template>
          <template v-else>
            <TableRow>
              <TableCell :colspan="columns.length" class="h-24 text-center">{{ $t('common.noResults') }}</TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- load more footer -->
    <div v-show="hasMore && !!rowCount">
      <Button variant="secondary" class="w-full font-normal" @click="emit('loadMore')">
        {{ isLoading ? $t('common.loading') : $t('common.loadMore', [data.length, rowCount]) }}
      </Button>
    </div>
    <!-- loading finished sign -->
    <div v-show="!hasMore && !!rowCount" class="text-muted-foreground py-2 text-center text-sm">
      {{ $t('common.loadingFinished', [rowCount]) }}
    </div>
  </div>
</template>
