<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { computed, defineComponent, useAttrs, useSlots } from 'vue'
import { injectForm, injectFormItem } from './context'

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | Date
    modelModifiers?: { uppercase: boolean }
    htmlType?: string
    forceInteger?: boolean
    prefix?: string
    suffix?: string
    disabled?: boolean
  }>(),
  {
    modelValue: undefined,
    modelModifiers: () => ({ uppercase: false }),
    htmlType: 'text',
    prefix: undefined,
    suffix: undefined,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | Date | number): void
}>()

const Form = injectForm()
const FormItem = injectFormItem()

const attrClass = useAttrs()['class']
const attrExceptClass = Object.assign({}, useAttrs())
delete attrExceptClass['class'] // remove class from attrs

const edit = computed(() => Form?.edit.value ?? true)

const inputValue = computed(() => {
  if (props.htmlType === 'date' && !!props.modelValue) {
    // html date input only accepts string "YYYY-mm-dd"
    const inputDate = props.modelValue as Date
    const year = inputDate.getFullYear()
    const month = (inputDate.getMonth() + 1).toString().padStart(2, '0')
    const date = inputDate.getDate().toString().padStart(2, '0')
    return `${year}-${month}-${date}`
  }
  return props.modelValue
})

const onValueUpdate = (event: Event) => {
  let val: string | Date | number = (event.target as HTMLInputElement).value
  if (props.htmlType === 'date') {
    val = new Date(val)
  } else if (props.htmlType === 'number') {
    val = Number(val)
  } else if (props.modelModifiers.uppercase) {
    val = val.toUpperCase()
  }

  emit('update:modelValue', val)
  FormItem?.handleContentChange()
}

const onKeyPress = (event: KeyboardEvent) => {
  if (props.forceInteger) {
    if (/[^0-9]/g.test(event.key)) {
      event.preventDefault()
    }
  }
}

const hasPrefix = () => !!props.prefix || !!useSlots()['prefix']
const hasSuffix = () => !!props.suffix || !!useSlots()['suffix']
const errorStatus = () => FormItem?.itemStatus.value === 'error'
</script>

<template>
  <!-- for edit -->
  <span v-if="edit" class="group flex items-stretch -ml-px group-first-of-type:ml-0" :class="attrClass">
    <span
      v-if="hasPrefix()"
      class="flex items-center text-sm text-neutral-700 bg-neutral-100 border border-neutral-300 whitespace-nowrap group-first-of-type:rounded-l-md"
      :class="{ 'px-2': !$slots['prefix'] }"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <input
      :disabled="disabled"
      class="appearance-none w-full text-sm placeholder-neutral-500 border focus:z-10 focus:outline-none focus:ring"
      :class="[
        disabled
          ? 'text-neutral-500 border-neutral-300'
          : [
              'bg-white',
              errorStatus()
                ? 'border-error-700 focus:ring-error-700/50 focus:border-error-600'
                : 'border-neutral-300 hover:border-primary-400 focus:ring-primary-600/50 focus:border-primary-600',
            ],
        hasPrefix() ? '-ml-px' : 'group-first-of-type:rounded-l-md',
        hasSuffix() ? '-mr-px' : 'group-last-of-type:rounded-r-md',
      ]"
      :value="inputValue"
      :type="htmlType"
      @keypress="onKeyPress"
      @input="onValueUpdate"
    />
    <span
      v-if="hasSuffix()"
      class="flex items-center text-sm text-neutral-700 bg-neutral-100 border border-neutral-300 whitespace-nowrap group-last-of-type:rounded-r-md"
      :class="{ 'px-2': !$slots['prefix'] }"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>

  <!-- for display -->
  <span v-else class="group flex items-stretch" :class="attrClass">
    <span class="flex text-sm text-neutral-700 whitespace-nowrap">
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <span v-bind="attrExceptClass" class="text-sm">
      {{ htmlType === 'password' ? '****' : inputValue }}
    </span>
    <span class="flex text-sm text-neutral-700 whitespace-nowrap">
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>
