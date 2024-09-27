<script setup lang="ts">
import { RouterView } from 'vue-router'
import { SplitContainer } from '../reusable/split-container'
import SobList from './SobList.vue'
</script>

<template>
  <SplitContainer>
    <template #list>
      <SobList />
    </template>

    <template #detail>
      <RouterView />
    </template>
  </SplitContainer>
</template>
