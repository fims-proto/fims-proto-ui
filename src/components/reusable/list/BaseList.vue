<script setup lang="ts">
import { ref, toRef } from 'vue'
import { provideList, type ListOption } from './context'
import { computed } from 'vue'

const props = defineProps<ListOption>()

const defaultItem = toRef(() => props.defaultItem)
const selectedItem = ref()

const onSelectItem = (itemValue: unknown) => (selectedItem.value = itemValue)

provideList({
  options: toRef(props),
  selectedItem: computed(() => selectedItem.value ?? defaultItem.value),
  onSelectItem,
})
</script>

<template>
  <ol class="flex flex-col gap-1">
    <slot></slot>
  </ol>
</template>
