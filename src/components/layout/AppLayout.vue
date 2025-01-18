<script setup lang="ts">
import AppNav from './AppNav.vue'
</script>

<template>
  <section class="flex h-full w-full">
    <nav class="h-full w-72 p-4">
      <AppNav />
    </nav>

    <main class="h-full w-full flex-1 overflow-auto p-4">
      <RouterView />
    </main>
  </section>
</template>
