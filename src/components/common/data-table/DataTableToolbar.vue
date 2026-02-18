<script setup lang="ts" generic="TData">
import { computed, useId } from 'vue'
import type { Table } from '@tanstack/vue-table'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import DataTableFacetedFilter, { type DataTableFacetedFilterOption } from './DataTableFacetedFilter.vue'
import DataTableViewOptions from './DataTableViewOptions.vue'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { X, ListChevronsUpDown, ListChevronsDownUp } from 'lucide-vue-next'

export type DataTableToolbarFacetedFilter = {
  name: string
  title: string
  options: DataTableFacetedFilterOption[]
}

const props = defineProps<{
  table: Table<TData>
  globalFilter: string
  facetedFilters?: DataTableToolbarFacetedFilter[]
  hasSubRows?: boolean
}>()

defineEmits<{
  (e: 'update:globalFilter', value: string): void
  (e: 'expandAll'): void
  (e: 'collapseAll'): void
}>()

const isFiltered = computed(() => props.table.getState().columnFilters.length > 0)
const searchId = useId()
</script>

<template>
  <div class="flex items-center justify-between gap-2">
    <div class="flex flex-1 items-center gap-2">
      <Input
        :id="searchId"
        :placeholder="$t('table.search')"
        :model-value="globalFilter"
        class="h-8 w-[150px] lg:w-[250px]"
        @input="$emit('update:globalFilter', $event.target.value)"
      />
      <template v-for="facetedFilter in facetedFilters" :key="facetedFilter.name">
        <DataTableFacetedFilter
          v-if="table.getColumn(facetedFilter.name)"
          :column="table.getColumn(facetedFilter.name)"
          :title="facetedFilter.title"
          :options="facetedFilter.options"
        />
      </template>

      <Button v-if="isFiltered" variant="ghost" class="h-8 px-2 lg:px-3" @click="table.resetColumnFilters()">
        {{ $t('table.reset') }}
        <X class="ml-2 h-4 w-4" />
      </Button>

      <TooltipProvider v-if="hasSubRows">
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 px-2" @click="$emit('expandAll')">
              <ListChevronsUpDown class="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ $t('table.expandAll') }}</p>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger as-child>
            <Button variant="ghost" size="sm" class="h-8 px-2" @click="$emit('collapseAll')">
              <ListChevronsDownUp class="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{{ $t('table.collapseAll') }}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    <DataTableViewOptions :table="table" />
  </div>
</template>
