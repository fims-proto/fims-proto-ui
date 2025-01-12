<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import PeriodList from './PeriodList.vue'

defineProps<{
  sobId: string
}>()

const route = useRoute()
</script>

<template>
  <SplitContainer :detail-open="route.name === 'ledgerList'">
    <template #list>
      <PeriodList :sob-id="sobId" />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
