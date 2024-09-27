<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <section class="h-full w-full">
    <header class="container mx-auto py-4">
      <AppHeader />
    </header>

    <main class="container mx-auto py-4">
      <RouterView />
    </main>
  </section>
</template>
