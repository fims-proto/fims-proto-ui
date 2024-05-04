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
  <!-- @vue-ignore -->
  <RouterLink v-slot="{ href, navigate }" v-bind="$props" custom>
    <BaseLink v-bind="$attrs" :href="href" @click="navigate">
      <slot></slot>
    </BaseLink>
  </RouterLink>
</template>
