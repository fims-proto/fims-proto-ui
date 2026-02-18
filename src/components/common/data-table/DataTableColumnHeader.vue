<script setup lang="ts" generic="TData">
import type { Column } from '@tanstack/vue-table'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChevronDown, ChevronsUpDown, ChevronUp, EyeOff } from 'lucide-vue-next'

import { cn } from '@/lib/utils'

defineProps<{
  column: Column<TData>
  title: string
}>()
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div v-if="column.getCanSort()" :class="cn('flex items-center space-x-2', $attrs.class ?? '')">
    <DropdownMenu>
      <DropdownMenuTrigger as-child>
        <Button variant="ghost" size="sm" class="data-[state=open]:bg-accent -ml-3 h-8">
          <span>{{ title }}</span>
          <ChevronDown v-if="column.getIsSorted() === 'desc'" class="ml-2 h-4 w-4" />
          <ChevronUp v-else-if="column.getIsSorted() === 'asc'" class="ml-2 h-4 w-4" />
          <ChevronsUpDown v-else class="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem @click="column.toggleSorting(false)">
          <ChevronUp class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
          {{ $t('table.asc') }}
        </DropdownMenuItem>
        <DropdownMenuItem @click="column.toggleSorting(true)">
          <ChevronDown class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
          {{ $t('table.desc') }}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem @click="column.toggleVisibility(false)">
          <EyeOff class="text-muted-foreground/70 mr-2 h-3.5 w-3.5" />
          {{ $t('table.hide') }}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  </div>

  <div v-else :class="$attrs.class">
    {{ title }}
  </div>
</template>
