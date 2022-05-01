<script lang="ts">
import { defineComponent, ref } from 'vue';
import { provideButtonGroup } from './context';

export default defineComponent({
  setup() {
    provideButtonGroup({
      insideGroup: ref(true)
    })
  }
})
</script>

<template>
  <div class="flex">
    <slot></slot>
  </div>
</template>