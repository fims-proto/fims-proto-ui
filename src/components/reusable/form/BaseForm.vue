<script lang="ts">
import { defineComponent, toRefs } from 'vue'
import { provideForm } from './context'

export default defineComponent({
  props: {
    name: {
      type: String,
      default: undefined,
    },
    hideRequiredMark: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['submit'],
  setup(props) {
    const { name, hideRequiredMark } = toRefs(props)

    provideForm({
      name: name,
      hideRequiredMark,
    })
  },
})
</script>

<template>
  <form class="flex flex-col gap-6" @submit.prevent.stop="$emit('submit')">
    <slot></slot>
  </form>
</template>
