<script setup lang="ts">
defineProps<{
  menu?: boolean
}>()
</script>

<template>
  <a
    tabindex="0"
    :class="[
      'cursor-pointer select-none',
      menu
        ? [
            'px-3 py-2 space-x-2 rounded-md whitespace-nowrap text-neutral-700',
            'hover:text-neutral-900 hover:bg-neutral-200/50 active:bg-neutral-200/80',
            'focus:outline-none focus-visible:ring focus-visible:ring-primary-600/50',
          ]
        : [
            'text-primary-900 hover:text-primary-500 active:text-primary-800',
            'focus:outline-none focus-visible:ring focus-visible:ring-primary-600/50',
          ],
    ]"
  >
    <slot></slot>
  </a>
</template>
