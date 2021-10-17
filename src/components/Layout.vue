<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import TheHeader from "./TheHeader.vue";
import TheSidebar from "./TheSidebar.vue";

export default defineComponent({
  components: { TheHeader, TheSidebar }
})
</script>

<template>
  <the-header class="appHeader" />

  <section>
    <the-sidebar />

    <article class="appContainer">
      <router-view></router-view>
    </article>
  </section>
</template>

<style scoped>
section {
  display: flex;
  height: calc(100vh - 3rem);
  background-color: var(--light);
  color: var(--dark);
}

.appHeader {
  height: 3rem;
}

.appContainer {
  width: 100%;
  height: 100%;
}
</style>

