<script setup lang="ts">
import { injectList } from './context'

defineProps<{
  active?: boolean
}>()

const List = injectList()
</script>

<template>
  <li
    :class="[
      'px-2 py-1 rounded-md text-neutral-700',
      List?.clickable && 'cursor-pointer select-none',
      active
        ? 'bg-primary-600 text-white active:bg-primary-700'
        : [
            List?.clickable && 'active:bg-neutral-300/70',
            List?.hoverable && 'hover:bg-neutral-300/50 hover:text-neutral-900',
          ],
    ]"
  >
    <slot></slot>
  </li>
</template>
