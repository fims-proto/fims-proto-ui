<script lang="ts">
import { defineComponent } from 'vue'
import { injectForm, injectInputGroup } from './context'

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: [String, Number, Date],
    label: String,
    hideLabel: Boolean,
    required: Boolean,
    lite: Boolean,
    prefix: String,
    suffix: String
  },
  emits: ['update:modelValue'],
  setup(props, { slots }) {
    const Form = injectForm()
    const InputGroup = injectInputGroup()

    return {
      inputId: generateInputId(),
      hideRequiredMark: Form?.hideRequiredMark.value,
      insideGroup: InputGroup?.insideGroup.value,
      hasPrefix() {
        return !!props.prefix || !!slots['prefix']
      },
      hasSuffix() {
        return !!props.suffix || !!slots['suffix']
      }
    }
  }
})

function generateInputId() {
  return `base-input-${Math.random().toString(36).slice(-8)}`
}
</script>

<template>
  <div class="group" :class="$attrs.class">
    <label v-if="!!label" :for="inputId" :class="[
      { 'sr-only': hideLabel },
      'block text-sm text-neutral-900 mb-2'
    ]">
      <span>{{ label }}</span>
      <span v-if="required && !hideRequiredMark" class="ml-0.5 text-error-700 select-none">*</span>
    </label>
    <span class="flex items-center bg-white" :class="[
      insideGroup ? 'border-r-0 group-last:border group-first:rounded-l-md group-last:rounded-r-md' : 'rounded-md',
      lite ? 'border-none' : 'border-neutral-300 border'
    ]">
      <span v-if="hasPrefix()"
        :class="['text-sm text-neutral-500 whitespace-nowrap', { 'pl-2 pr-1': !$slots['prefix'] }]">
        <slot name="prefix">{{ prefix }}</slot>
      </span>
      <input :id="inputId" class="appearance-none w-full text-sm placeholder-neutral-500 border-none" :class="[
        { 'ml-1': hasPrefix() }, { 'mr-1': hasSuffix() },
        insideGroup ? 'group-first:rounded-l-md group-last:rounded-r-md' : 'rounded-md'
      ]" :value="modelValue" @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :type="$attrs.type as string ?? 'text'" v-bind="$attrs" />
      <span v-if="hasSuffix()"
        :class="['text-sm text-neutral-500 whitespace-nowrap', { 'pl-1 pr-2': !$slots['prefix'] }]">
        <slot name="suffix">{{ suffix }}</slot>
      </span>
    </span>
  </div>
</template>