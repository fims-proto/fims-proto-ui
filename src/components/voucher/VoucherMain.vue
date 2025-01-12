<script setup lang="ts">
import { ref } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import VoucherList from './VoucherList.vue'
import { provideContext } from './context'

defineProps<{
  sobId: string
}>()

const route = useRoute()

provideContext({
  refreshList: ref(() => {}),
})
</script>

<template>
  <SplitContainer :detail-open="route.name === 'voucherDetail' || route.name === 'voucherNew'">
    <template #list="{ detailOpen }">
      <VoucherList :sob-id="sobId" :lite="detailOpen" />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
