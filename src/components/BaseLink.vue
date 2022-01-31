<script lang="ts">
import { defineComponent } from 'vue';
import { RouterLink } from 'vue-router'

export default defineComponent({
  props: {
    // @ts-ignore
    ...RouterLink.props
  }
})
</script>

<template>
  <router-link v-bind="$props" custom v-slot="{ href, navigate }">
    <a v-bind="$attrs" :href="href" @click="navigate" class="base-link">
      <slot></slot>
    </a>
  </router-link>
</template>

<style scoped>
.base-link {
  text-decoration: none;
}
</style>