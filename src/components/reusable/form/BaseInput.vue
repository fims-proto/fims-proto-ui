<script lang="ts">
import { computed, defineComponent } from 'vue'
import { injectForm, injectFormItem } from './context'

export default defineComponent({
  inheritAttrs: false,
  props: {
    modelValue: { type: [String, Number, Date], default: undefined },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
  },
  emits: ['update:modelValue'],
  setup(props, { attrs, slots, emit }) {
    const Form = injectForm()
    const FormItem = injectFormItem()
    const attrClass = attrs['class']
    const attrExceptClass = Object.assign({}, attrs) // attrs is a proxy, use assign to deep copy it

    // remove class from attrs
    if (attrExceptClass['class']) {
      attrExceptClass['class'] = undefined
    }

    const inputValue = computed(() => {
      if (!props.modelValue || attrExceptClass['type'] !== 'date') {
        return props.modelValue
      }
      const inputDate = props.modelValue as Date
      const year = inputDate.getFullYear()
      const month = (inputDate.getMonth() + 1).toString().padStart(2, '0')
      const date = inputDate.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${date}`
    })

    const onValueUpdate = (event: Event) => {
      let val = (event.target as HTMLInputElement).value
      if (attrExceptClass['type'] === 'date') {
        emit('update:modelValue', new Date(val))
      } else {
        emit('update:modelValue', val)
      }
    }

    return {
      inputId: FormItem?.inputId.value,
      attrClass,
      attrExceptClass,
      inputValue,
      onValueUpdate,
      hideRequiredMark: Form?.hideRequiredMark.value,
      hasPrefix() {
        return !!props.prefix || !!slots['prefix']
      },
      hasSuffix() {
        return !!props.suffix || !!slots['suffix']
      },
    }
  },
})
</script>

<template>
  <span class="group flex items-stretch bg-white" :class="attrClass">
    <span
      v-if="hasPrefix()"
      :class="[
        'text-sm text-neutral-700 bg-neutral-100 border-y border-neutral-300 whitespace-nowrap flex items-center group-first-of-type:border-l group-first-of-type:rounded-l-sm',
        { 'px-2': !$slots['prefix'] },
      ]"
    >
      <slot name="prefix">{{ prefix }}</slot>
    </span>
    <input
      :id="inputId"
      class="appearance-none w-full text-sm placeholder-neutral-500 border border-neutral-300 focus:z-10"
      :class="[
        { 'group-first-of-type:rounded-l-sm': !hasPrefix() },
        { 'group-last-of-type:rounded-r-sm': !hasSuffix() },
      ]"
      :value="inputValue"
      :type="attrExceptClass.type as string ?? 'text'"
      v-bind="attrExceptClass"
      @input="onValueUpdate"
    />
    <span
      v-if="hasSuffix()"
      :class="[
        'text-sm text-neutral-700 bg-neutral-100 border-y border-neutral-300 whitespace-nowrap flex items-center group-last-of-type:border-r group-last-of-type:rounded-r-sm',
        { 'px-2': !$slots['prefix'] },
      ]"
    >
      <slot name="suffix">{{ suffix }}</slot>
    </span>
  </span>
</template>
