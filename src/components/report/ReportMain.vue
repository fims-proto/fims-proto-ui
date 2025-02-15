<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import ReportList from './ReportList.vue'
import { provideContext } from './context'

defineProps<{
  sobId: string
}>()

provideContext({
  refreshList: ref(() => {}),
})
</script>

<template>
  <SplitContainer :open="$route.name === 'reportDetail'" right-size="full">
    <template #left>
      <ReportList :sob-id="sobId" />
    </template>

    <template #right>
      <RouterView />
    </template>
  </SplitContainer>
</template>
