<script setup lang="ts">
import { ref } from 'vue'
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import VoucherList from './VoucherList.vue'
import { provideContext } from './context'

defineProps<{
  sobId: string
}>()

provideContext({
  refreshList: ref(() => {}),
})
</script>

<template>
  <SplitContainer>
    <template #list>
      <VoucherList :sob-id="sobId" />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
