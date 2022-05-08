<script setup lang="ts">
import { defineProps } from 'vue'
defineProps({
  as: {
    type: String,
    default: 'button',
  },
})
</script>

<template>
  <menu-button v-slot="{ open }" :as="as" :href="as === 'a' ? 'javascript:void(0);' : null" @click.prevent>
    <slot :open="open"></slot>
  </menu-button>
</template>
