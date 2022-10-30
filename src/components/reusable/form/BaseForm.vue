<script setup lang="ts">
import { computed } from 'vue'
import { provideForm } from './context'

const props = defineProps<{
  name?: string
  hideRequiredMark?: boolean
}>()

defineEmits<{
  (event: 'submit'): void
}>()

provideForm({
  name: computed(() => props.name),
  hideRequiredMark: computed(() => props.hideRequiredMark ?? false),
})
</script>

<template>
  <form @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>
