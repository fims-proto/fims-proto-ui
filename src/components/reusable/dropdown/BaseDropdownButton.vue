<script setup lang="ts">
defineProps({
  as: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <MenuButton v-slot="{ open }" :as="as" class="cursor-pointer">
    <slot :open="open"></slot>
  </MenuButton>
</template>
