<script lang="ts">
import { defineComponent } from '@vue/runtime-core';
import TheHeader from './TheHeader.vue';
import TheSidebar from './TheSidebar.vue';
import TheBreadcrum from './TheBreadcrumb.vue';

export default defineComponent({
  components: { TheHeader, TheSidebar, TheBreadcrum }
})
</script>

<template>
  <the-header class="layoutHeader" />

  <section class="layoutContainer">
    <the-sidebar />

    <article class="layoutContent">
      <the-breadcrum />
      <router-view />
    </article>
  </section>
</template>

<style scoped>
.layoutHeader {
  height: var(--header-height);
}
.layoutContainer {
  display: flex;
  height: calc(100vh - var(--header-height));
  background-color: var(--light);
  color: var(--dark);
}

.layoutContent {
  width: 100%;
  height: 100%;
}
</style>

