<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, useSlots, type PropType } from 'vue'
import { injectButtonGroup } from './context'

const props = defineProps({
  category: {
    type: String as PropType<'primary' | 'default' | 'flat'>,
    default: 'default',
  },
  htmlType: {
    type: String as PropType<'submit' | 'reset' | 'button'>,
    default: 'button',
  },
  disabled: Boolean,
  busy: Boolean,
})

const slots = useSlots()

const ButtonGroup = injectButtonGroup()
const insideGroup = ButtonGroup?.insideGroup.value

const is = (t: string) => props.category === t
const hasSlot = (n: string) => !!slots[n]
</script>

<template>
  <button
    :class="[
      'group flex gap-1 items-center justify-center',

      insideGroup ? '-ml-px first:m-0 first:rounded-l-md last:rounded-r-md hover:z-10' : 'rounded-md',

      is('primary') && [
        'shadow-sm active:bg-primary-800 focus:z-10 focus:outline-none',
        'focus-visible:border-primary-600 focus-visible:ring-4 focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-white bg-primary-600 hover:bg-primary-700',
      ],

      is('default') && [
        'shadow-sm active:bg-neutral-300/40 focus:z-10 focus:outline-none',
        'focus-visible:border-primary-600 focus-visible:ring-4 focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-neutral-900 bg-transparent border border-neutral-400 hover:text-primary-800 hover:border-primary-600',
      ],

      is('flat') && [
        'active:bg-neutral-300/40 focus:z-10 focus:outline-none',
        'focus-visible:ring-offset-2 focus-visible:ring focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent'
          : 'text-neutral-700 bg-transparent hover:text-primary-800 hover:bg-neutral-200/50',
      ],

      {
        'cursor-not-allowed': disabled,
      },
    ]"
    v-bind="$attrs"
    :type="htmlType"
    :disabled="disabled"
  >
    <!-- icon -->
    <span
      v-if="hasSlot('icon')"
      :class="[
        'inline-block w-4 align-text-top',
        hasSlot('default') ? 'ml-1.5 my-1.5' : 'mx-1.5 my-1.5',
        is('primary') && (disabled ? 'text-neutral-400' : 'text-primary-300 group-hover:text-primary-200'),
      ]"
      aria-hidden="true"
    >
      <slot name="icon"></slot>
    </span>

    <!-- text -->
    <span v-if="hasSlot('default')" :class="['text-sm', hasSlot('icon') ? 'mr-3 my-1.5' : 'mx-3 my-1.5']">
      <slot></slot>
    </span>
  </button>
</template>
