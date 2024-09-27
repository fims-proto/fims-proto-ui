<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import PeriodList from './PeriodList.vue'

defineProps<{
  sobId: string
}>()
</script>

<template>
  <SplitContainer>
    <template #list>
      <PeriodList :sob-id="sobId" />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
