<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { provideForm } from './context';

export default defineComponent({
  props: {
    hideRequiredMark: {
      type: Boolean,
      default: false
    }
  },
  emits: ['submit'],
  setup(props) {
    const { hideRequiredMark } = toRefs(props)

    provideForm({
      hideRequiredMark
    })
  }
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>