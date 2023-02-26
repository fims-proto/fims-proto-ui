<script setup lang="ts">
import { provideList } from './context'

const props = defineProps<{
  hoverable?: boolean
  clickable?: boolean
}>()

provideList({
  hoverable: props.hoverable ?? false,
  clickable: props.clickable ?? false,
})
</script>

<template>
  <ol class="flex flex-col gap-1">
    <slot></slot>
  </ol>
</template>
