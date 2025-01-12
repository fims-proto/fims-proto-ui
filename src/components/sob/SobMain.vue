<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import SobList from './SobList.vue'

const route = useRoute()
</script>

<template>
  <SplitContainer :detail-open="route.name === 'sobDetail'">
    <template #list>
      <SobList />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
