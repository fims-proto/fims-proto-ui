<script lang="ts">
import { defineComponent } from "@vue/runtime-core";

export default defineComponent({
  props: {
    href: String
  }
})
</script>

<template>
  <a :href="href">
    <slot></slot>
  </a>
</template>

<style scoped>
a {
  background-color: transparent;
  text-decoration: none;
  cursor: pointer;
  transition: 0.5s ease;
}

a:visited {
  color: inherit;
}

a:hover {
  opacity: 0.6;
}
</style>