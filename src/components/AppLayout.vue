<script setup lang="ts">
import AppHeader from './AppHeader.vue'
</script>

<template>
  <section class="flex h-full w-full flex-col">
    <header class="border-color w-full">
      <div class="container mx-auto overflow-hidden">
        <AppHeader />
      </div>
    </header>

    <main class="w-full flex-1">
      <div class="container mx-auto h-full overflow-auto rounded-md bg-white shadow-md">
        <RouterView />
      </div>
    </main>

    <footer>
      <div class="container mx-auto pb-4 pt-8">
        <p class="text-right text-xs opacity-10">当前版本为测试版本，不代表最终品质</p>
      </div>
    </footer>
  </section>
</template>
