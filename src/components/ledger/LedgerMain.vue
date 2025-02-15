<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import PeriodList from './PeriodList.vue'

defineProps<{
  sobId: string
}>()
</script>

<template>
  <SplitContainer :open="$route.name === 'ledgerList'" right-size="full">
    <template #left>
      <PeriodList :sob-id="sobId" />
    </template>

    <template #right>
      <RouterView />
    </template>
  </SplitContainer>
</template>
