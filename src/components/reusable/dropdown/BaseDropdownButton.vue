<script setup lang="ts">
defineProps({
  as: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <menu-button v-slot="{ open }" :as="as" class="cursor-pointer" @click.prevent>
    <slot :open="open"></slot>
  </menu-button>
</template>
