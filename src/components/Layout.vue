<script setup lang="ts">
import { NLayout, NLayoutContent, NLayoutHeader } from "naive-ui";
import LayoutHeader from './LayoutHeader.vue'
</script>

<template>
  <n-layout>
    <n-layout-header bordered>
      <layout-header />
    </n-layout-header>
    <n-layout-content content-style="padding: 1rem 3rem">
      <router-view />
    </n-layout-content>
  </n-layout>
</template>

<style scoped>
.n-layout-header {
  padding: 0 3rem;
}
</style>