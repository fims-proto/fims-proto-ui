<script setup lang="ts">
import { defineProps } from 'vue'
defineProps({
  as: {
    type: String,
    default: 'button'
  }
})
</script>

<template>
  <menu-button :as="as" @click.prevent :href="as === 'a' ? 'javascript:void(0);' : null" v-slot="{ open }">
    <slot :open="open"></slot>
  </menu-button>
</template>