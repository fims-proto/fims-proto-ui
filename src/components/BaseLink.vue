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