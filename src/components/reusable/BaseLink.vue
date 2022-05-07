<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router'

export default defineComponent({
  inheritAttrs: false,
  props: {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    ...RouterLink.props
  }
})
</script>

<template>
  <router-link v-bind="$props" custom v-slot="{ href, navigate }">
    <a v-bind="$attrs" :href="href" @click="navigate">
      <slot></slot>
    </a>
  </router-link>
</template>