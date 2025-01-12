<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <section class="h-full w-full">
    <header class="border-color w-full">
      <div class="container mx-auto overflow-hidden">
        <AppHeader />
      </div>
    </header>

    <main class="w-full">
      <div class="container mx-auto overflow-hidden rounded-md bg-white shadow-md">
        <RouterView />
      </div>
    </main>
  </section>
</template>
