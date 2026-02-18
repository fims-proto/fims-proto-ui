<script setup lang="ts">
import { ScrollArea } from '@/components/ui/scroll-area'

import { cn } from '@/lib/utils'

defineProps<{
  title?: string
  secondaryTitle?: string
  dirtyIndicator?: boolean
  noScroll?: boolean
}>()
</script>

<template>
  <header
    class="flex h-[64px] shrink-0 items-center justify-between gap-4 border-b px-4 transition-[width,height] duration-200 ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[50px]"
  >
    <div class="flex items-center gap-2">
      <h1 v-if="title" class="text-foreground text-lg font-bold">
        {{ title }}
      </h1>
      <h1 v-if="secondaryTitle" class="text-foreground font-semibold">
        {{ secondaryTitle }}
      </h1>
      <span
        :class="
          cn(
            'flex size-0 rounded-full bg-red-600 opacity-0 transition-[opacity,width,height] duration-200 ease-linear',
            {
              'size-2 opacity-100': dirtyIndicator,
            },
          )
        "
      />
      <slot name="start" />
    </div>

    <div class="flex items-center gap-2">
      <slot name="end" />
    </div>
  </header>

  <div
    v-if="noScroll"
    class="h-[calc(100dvh-64px)] p-4 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[calc(100dvh-50px)]"
  >
    <slot />
  </div>

  <ScrollArea
    v-else
    class="h-[calc(100dvh-64px)] group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-[calc(100dvh-50px)]"
  >
    <div class="p-4">
      <slot />
    </div>
  </ScrollArea>
</template>
