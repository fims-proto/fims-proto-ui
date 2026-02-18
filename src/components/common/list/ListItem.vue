<script setup lang="ts">
import { cn } from '@/lib/utils'

defineProps<{
  title: string
  subTitle?: string
  createdAt?: Date
  selected?: boolean
  descriptions?: {
    label: string
    value: string | number
  }[]
}>()

defineEmits<{
  (e: 'select'): void
}>()
</script>

<template>
  <button
    :class="
      cn(
        'hover:bg-accent @container flex flex-col items-start gap-2 rounded-lg border p-3 text-left text-sm transition-all',
        selected && 'bg-muted',
      )
    "
    @click="$emit('select')"
  >
    <div class="flex w-full flex-col gap-1">
      <div class="flex items-center">
        <div class="truncate font-semibold">
          {{ title }}
        </div>
        <div v-if="createdAt" :class="cn('ml-auto text-xs', selected ? 'text-foreground' : 'text-muted-foreground')">
          {{ $d(createdAt, 'short') }}
        </div>
      </div>

      <div v-if="subTitle" class="text-foreground line-clamp-2 text-xs">
        {{ subTitle }}
      </div>
    </div>
    <div class="grid w-full grid-cols-2 gap-1 @sm:grid-cols-3">
      <div v-for="description in descriptions" :key="description.label" class="flex flex-col gap-1 text-xs">
        <div class="text-muted-foreground">
          {{ description.label }}
        </div>
        <div class="truncate">
          {{ description.value }}
        </div>
      </div>
    </div>
    <div class="flex items-center gap-2">
      <slot name="end" />
    </div>
  </button>
</template>
