<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import SobList from './SobList.vue'
</script>

<template>
  <SplitContainer :open="$route.name === 'sobDetail' || $route.name === 'sobNew'">
    <template #left>
      <SobList />
    </template>

    <template #right>
      <RouterView />
    </template>
  </SplitContainer>
</template>
