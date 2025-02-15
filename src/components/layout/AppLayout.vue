<script setup lang="ts">
import { ref } from 'vue'
import AppLogo from './AppLogo.vue'
import AppNav from './AppNav.vue'
import { breakpointsTailwind, useBreakpoints } from '@vueuse/core'

const breakpoints = useBreakpoints(breakpointsTailwind)
const drawerVisible = ref(false)
</script>

<template>
  <section class="flex h-full w-full flex-col md:flex-row">
    <nav v-if="breakpoints.greaterOrEqual('md').value">
      <AppNav />
    </nav>
    <nav v-else>
      <a @click="drawerVisible = true"><AppLogo /></a>
      <Drawer v-model:visible="drawerVisible" position="top" class="h-dvh!">
        <template #container="{ closeCallback }">
          <AppNav :close-callback @close="drawerVisible = false" />
        </template>
      </Drawer>
    </nav>

    <main class="h-full flex-1 overflow-auto p-4">
      <RouterView />
    </main>
  </section>
</template>
