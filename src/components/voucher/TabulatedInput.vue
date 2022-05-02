<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  props: {
    htmlType: {
      type: String,
      default: 'text'
    },
    modelValue: [String, Number],
  },
  emits: ['update:modelValue', 'blur'],
  setup(_, { expose }) {
    const inputRef = ref<HTMLInputElement>()

    const focus = () => {
      inputRef.value?.focus()
    }

    expose({ focus })

    return {
      inputId: generateInputId(),
      inputRef
    }
  }
})

function generateInputId() {
  return `tabulated-input-${Math.random().toString(36).slice(-8)}`
}
</script>

<template>
  <label class="sr-only" :for="inputId">{{ inputId }}</label>
  <input ref="inputRef" :id="inputId" :type="htmlType" :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)" @blur="$emit('blur')"
    :class="['appearance-none w-full border-none', { 'text-right': htmlType === 'number' }]" />
</template>