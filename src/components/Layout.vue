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

  <!-- Use any element to open the sidenav -->
  <!-- Add all page content inside this div if you want the side nav to push page content to the right (not used if you only want the sidenav to sit on top of the page -->
</template>

<style scoped>
section {
  display: -webkit-flex;
  display: flex;
  height: calc(100% - 3rem);
}

.appHeader {
  height: 3rem;
}

.appContainer {
  -webkit-flex: 3;
  -ms-flex: 3;
  left: 160px;
  flex: 3;
  background-color: #f2f2f2;
  padding: 10px;
}
</style>

