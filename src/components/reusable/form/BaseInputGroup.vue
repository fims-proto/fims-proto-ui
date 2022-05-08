<script lang="ts">
import { defineComponent, ref } from 'vue'
import { injectForm, provideInputGroup } from './context'

export default defineComponent({
  props: {
    label: { type: String, default: undefined },
    required: Boolean,
  },
  setup() {
    const Form = injectForm()

    provideInputGroup({
      insideGroup: ref(true),
    })

    return {
      hideRequiredMark: Form?.hideRequiredMark.value,
    }
  },
})
</script>

<template>
  <div>
    <label
      class="block mb-2 text-sm text-neutral-900"
      :class="{ 'after:content-[\'*\'] after:ml-1 after:text-error-700': required && !hideRequiredMark }"
      >{{ label }}</label
    >
    <div class="flex items-center gap-2">
      <div class="flex">
        <slot></slot>
      </div>
      <div v-if="!!$slots['suffix']">
        <slot name="suffix"></slot>
      </div>
    </div>
  </div>
</template>
