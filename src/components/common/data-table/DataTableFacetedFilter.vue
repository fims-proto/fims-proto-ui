<script setup lang="ts" generic="TData">
import { computed, type Component } from 'vue'
import type { Column } from '@tanstack/vue-table'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { Check, PlusCircle } from 'lucide-vue-next'

import { cn } from '@/lib/utils'

export type DataTableFacetedFilterOption = {
  label: string
  value: string
  icon?: Component
}

const props = defineProps<{
  column?: Column<TData>
  title?: string
  options: DataTableFacetedFilterOption[]
}>()

const facets = computed(() => props.column?.getFacetedUniqueValues())
const selectedValues = computed(() => new Set(props.column?.getFilterValue() as string[]))

function onSelect(option: DataTableFacetedFilterOption) {
  const isSelected = selectedValues.value.has(option.value)
  if (isSelected) {
    selectedValues.value.delete(option.value)
  } else {
    selectedValues.value.add(option.value)
  }
  const filterValues = Array.from(selectedValues.value)
  props.column?.setFilterValue(filterValues.length ? filterValues : undefined)
}
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button variant="outline" size="sm" class="h-8 border-dashed">
        <PlusCircle class="mr-2 h-4 w-4" />
        {{ title }}
        <template v-if="selectedValues.size > 0">
          <Separator orientation="vertical" class="mx-2 h-4" />
          <Badge variant="secondary" class="rounded-sm px-1 font-normal lg:hidden">
            {{ selectedValues.size }}
          </Badge>
          <div class="hidden space-x-1 lg:flex">
            <Badge v-if="selectedValues.size > 2" variant="secondary" class="rounded-sm px-1 font-normal">
              {{ $t('table.selectedCount', [selectedValues.size]) }}
            </Badge>

            <template v-else>
              <Badge
                v-for="option in options.filter((option) => selectedValues.has(option.value))"
                :key="option.value"
                variant="secondary"
                class="rounded-sm px-1 font-normal"
              >
                {{ option.label }}
              </Badge>
            </template>
          </div>
        </template>
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-[200px] p-0" align="start">
      <Command>
        <CommandInput :placeholder="title" />
        <CommandList>
          <CommandEmpty>{{ $t('common.noResults') }}</CommandEmpty>
          <CommandGroup>
            <CommandItem v-for="option in options" :key="option.value" :value="option" @select="() => onSelect(option)">
              <div
                :class="
                  cn(
                    'border-primary mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                    selectedValues.has(option.value)
                      ? 'bg-primary text-primary-foreground'
                      : 'opacity-50 [&_svg]:invisible',
                  )
                "
              >
                <Check :class="cn('h-4 w-4')" />
              </div>
              <component :is="option.icon" v-if="option.icon" class="text-muted-foreground mr-2 h-4 w-4" />
              <span>{{ option.label }}</span>
              <span
                v-if="facets?.get(option.value)"
                class="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs"
              >
                {{ facets.get(option.value) }}
              </span>
            </CommandItem>
          </CommandGroup>

          <template v-if="selectedValues.size > 0">
            <CommandSeparator />
            <CommandGroup>
              <CommandItem
                :value="{ label: 'Clear filters' }"
                class="justify-center text-center"
                @select="column?.setFilterValue(undefined)"
              >
                {{ $t('table.clearFilters') }}
              </CommandItem>
            </CommandGroup>
          </template>
        </CommandList>
      </Command>
    </PopoverContent>
  </Popover>
</template>
