<script lang="ts">
import { defineComponent, watch } from '@vue/runtime-core';
import { ref } from 'vue';
import useClickOutside from '../hook/useClickOutside';
import BaseLink from './BaseLink.vue';

export default defineComponent({
  components: { BaseLink },
  props: {
    title: String
  },
  setup() {
    const isOpen = ref(false)
    const dropdownRef = ref<HTMLElement | null>(null)
    const isClickOutside = useClickOutside(dropdownRef)

    watch(isClickOutside, () => {
      if (isOpen.value && isClickOutside.value) {
        isOpen.value = false
      }
    })

    return {
      dropdownRef,
      isOpen,
      toggleOpen: () => isOpen.value = !isOpen.value
    }
  }
})
</script>

<template>
  <div class="dropdown" ref="dropdownRef">
    <base-link @click="toggleOpen">{{ title }}</base-link>

    <ul v-if="isOpen" class="dropdownMenu">
      <slot></slot>
    </ul>
  </div>
</template>

<style scoped>
.dropdownMenu {
  display: block;
  position: absolute;
  z-index: 999999;
  color: var(--dark);
  background-color: var(--light);
  border: 1px solid var(--gray-500);
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>