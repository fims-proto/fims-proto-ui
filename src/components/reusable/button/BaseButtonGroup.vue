<script setup lang="ts">
import { ref } from 'vue'
import { provideButtonGroup } from './context'

provideButtonGroup({
  insideGroup: ref(true),
})
</script>

<template>
  <div class="flex">
    <slot></slot>
  </div>
</template>
