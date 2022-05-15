<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: {
      type: [String, Number],
      default: undefined,
    },
  },
  emits: ['update:modelValue'],
  setup(_, { expose }) {
    const inputRef = ref<HTMLInputElement>()

    const focus = () => {
      inputRef.value?.focus()
    }

    expose({ focus })

    return {
      inputId: generateInputId(),
      inputRef,
    }
  },
})

function generateInputId() {
  return `tabulated-input-${Math.random().toString(36).slice(-8)}`
}
</script>

<template>
  <label class="sr-only" :for="inputId">{{ inputId }}</label>
  <input
    :id="inputId"
    ref="inputRef"
    :value="modelValue"
    :type="$attrs.type as string ?? 'text'"
    v-bind="$attrs"
    :class="['appearance-none w-full border-none', { 'text-right': $attrs.type === 'number' }]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
