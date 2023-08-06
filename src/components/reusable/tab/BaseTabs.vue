<script setup lang="ts">
defineProps<{
  defualtIndex?: number
}>()

const emit = defineEmits<{
  (event: 'changed', index: number): void
}>()
</script>

<template>
  <TabGroup manual :default-index="defualtIndex ?? 0" @change="(index) => emit('changed', index)">
    <TabList class="flex gap-1">
      <slot name="tabs"></slot>
    </TabList>
    <TabPanels>
      <slot name="panels"></slot>
    </TabPanels>
  </TabGroup>
</template>
