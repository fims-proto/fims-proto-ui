<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { computed, defineComponent, useAttrs, useSlots } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number, Date],
    default: undefined,
  },
  htmlType: {
    type: String,
    default: 'text',
  },
  prefix: {
    type: String,
    default: undefined,
  },
  suffix: {
    type: String,
    default: undefined,
  },
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: Date | string): void
}>()

const attrClass = useAttrs()['class']
const attrExceptClass = Object.assign({}, useAttrs())
delete attrExceptClass['class'] // remove class from attrs

const inputValue = computed(() => {
  if (!props.modelValue || attrExceptClass['type'] !== 'date') {
    return props.modelValue
  }
  // html date input only accepts string "YYYY-mm-dd"
  const inputDate = props.modelValue as Date
  const year = inputDate.getFullYear()
  const month = (inputDate.getMonth() + 1).toString().padStart(2, '0')
  const date = inputDate.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${date}`
})

const onValueUpdate = (event: Event) => {
  const val = (event.target as HTMLInputElement).value
  if (attrExceptClass['type'] === 'date') {
    emit('update:modelValue', new Date(val))
  } else {
    emit('update:modelValue', val)
  }
}

const hasPrefix = () => !!props.prefix || !!useSlots()['prefix']
const hasSuffix = () => !!props.suffix || !!useSlots()['suffix']
</script>

<template>
  <span class="group flex items-stretch bg-white" :class="attrClass">
    <span
      v-if="hasPrefix()"
      :class="[
        'flex items-center text-sm text-neutral-700 bg-neutral-100 border-y border-neutral-300 whitespace-nowrap group-first-of-type:border-l group-first-of-type:rounded-l-md',
        { 'px-2': !$slots['prefix'] },
      ]"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <input
      v-bind="attrExceptClass"
      :class="[
        'appearance-none w-full text-sm placeholder-neutral-500 border-0 border-y border-l border-neutral-300',
        'focus:z-10 focus:outline-none focus:border-transparent focus:ring-offset-2 focus:ring focus:ring-primary-500',
        { 'group-first-of-type:rounded-l-md': !hasPrefix() },
        { 'group-last-of-type:rounded-r-md group-last-of-type:border-r': !hasSuffix() },
      ]"
      :value="inputValue"
      :type="htmlType"
      @input="onValueUpdate"
    />
    <span
      v-if="hasSuffix()"
      :class="[
        'flex items-center text-sm text-neutral-700 bg-neutral-100 border-l border-y border-neutral-300 whitespace-nowrap group-last-of-type:border-r group-last-of-type:rounded-r-md',
        { 'px-2': !$slots['prefix'] },
      ]"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>
