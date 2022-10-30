<script setup lang="ts">
import { ref } from 'vue'

const display = ref('')
</script>

<!-- style test page for Tailwindcss -->
<template>
  <div class="flex flex-col gap-8 p-4">
    <div class="flex gap-4">
      <BaseLink @click="display = 'form'">Base Form</BaseLink>
      <BaseLink @click="display = 'others'">Others</BaseLink>
    </div>

    <div>
      <OtherElements v-if="display === 'others'" />
      <TestForm v-if="display === 'form'" />
    </div>
  </div>
</template>
