<script setup lang="ts">
import { ref, defineComponent } from 'vue'

defineProps<{
  modelValue?: string | number
  disabled?: boolean
}>()

defineEmits<{
  (event: 'update:modelValue', value: string): void
  (event: 'focus'): void
}>()

const inputRef = ref<HTMLInputElement>()
const inputId = `tabulated-input-${Math.random().toString(36).slice(-8)}`

const focus = () => inputRef.value?.focus()

defineExpose({ focus })
</script>

<script lang="ts">
export default defineComponent({ inheritAttrs: false })
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
    @focus="$emit('focus')"
  />
</template>
