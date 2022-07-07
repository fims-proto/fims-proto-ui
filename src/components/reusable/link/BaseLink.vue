<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent } from 'vue'
import { RouterLink } from 'vue-router'

defineProps({
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  ...RouterLink.props,
})
</script>

<template>
  <RouterLink v-slot="{ href, navigate }" v-bind="$props" custom>
    <a
      v-bind="$attrs"
      :href="href"
      class="text-primary-900 hover:text-primary-500 active:text-primary-800 focus:outline-none focus-visible:ring focus-visible:ring-primary-600/50"
      @click="navigate"
    >
      <slot></slot>
    </a>
  </RouterLink>
</template>
