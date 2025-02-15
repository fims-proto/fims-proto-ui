<script setup lang="ts">
withDefaults(
  defineProps<{
    open: boolean
    rightSize?: 'small' | 'large' | 'full'
  }>(),
  {
    rightSize: 'large',
  },
)
</script>

<template>
  <div class="flex h-full w-full">
    <!-- left, as in master page -->
    <div
      :class="[
        'h-full overflow-auto transition-[flex] motion-reduce:transition-none',
        open
          ? ['basis-0', { 'md:basis-1/3': rightSize === 'large' }, { 'md:basis-2/3': rightSize === 'small' }]
          : 'basis-full',
      ]"
    >
      <slot name="left" :open="open"></slot>
    </div>

    <!-- right, as in detail page -->
    <div
      v-if="open"
      :class="[
        'h-full basis-full overflow-auto',
        { 'md:ml-4 md:basis-1/3': rightSize === 'small' },
        { 'md:ml-4 md:basis-2/3': rightSize === 'large' },
      ]"
    >
      <slot name="right"></slot>
    </div>
  </div>
</template>
