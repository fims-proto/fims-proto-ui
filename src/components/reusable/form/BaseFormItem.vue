<script lang="ts">
import { computed, defineComponent } from 'vue'
import { injectForm, provideFormItem } from './context'
export default defineComponent({
  props: {
    label: { type: String, required: true },
    hideLabel: Boolean,
    required: Boolean,
  },
  setup(props) {
    const Form = injectForm()
    const inputId = computed(() => (Form?.name.value ? `${Form.name.value}-${props.label}` : props.label))

    provideFormItem({
      inputId,
    })

    return {
      inputId,
      hideRequiredMark: Form?.hideRequiredMark.value,
    }
  },
})
</script>

<template>
  <div>
    <label v-if="!!label" :for="inputId" :class="[{ 'sr-only': hideLabel }, 'block text-sm text-neutral-900 mb-2']">
      <span>{{ label }}</span>
      <span v-if="required && !hideRequiredMark" class="ml-0.5 text-error-700 select-none" aria-hidden="true">*</span>
    </label>
    <slot></slot>
  </div>
</template>
