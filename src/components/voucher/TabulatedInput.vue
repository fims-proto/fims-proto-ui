<script lang="ts">
import { defineComponent, ref } from 'vue'

export default defineComponent({
  inheritAttrs: false,
  props: {
    disabled: Boolean,
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
  <span v-if="disabled" class="block px-3 py-2">{{ modelValue }}</span>
  <input
    v-else
    :id="inputId"
    ref="inputRef"
    :value="modelValue"
    :type="$attrs.type as string ?? 'text'"
    v-bind="$attrs"
    :class="['appearance-none w-full border-none px-3 py-2', { 'text-right': $attrs.type === 'number' }]"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>
