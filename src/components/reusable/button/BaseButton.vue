<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, PropType } from 'vue'
import { injectButtonGroup } from './context'

const props = defineProps({
  type: {
    type: String as PropType<'primary' | 'default' | 'text' | 'link'>,
    default: 'default',
  },
  htmlType: {
    type: String as PropType<'submit' | 'reset' | 'button'>,
    default: 'button',
  },
  disabled: Boolean,
  busy: Boolean,
})

const ButtonGroup = injectButtonGroup()

const is = (t: string) => props.type === t

const insideGroup = ButtonGroup?.insideGroup.value
</script>

<template>
  <button
    :class="[
      'group flex gap-1 items-center justify-center',

      insideGroup ? '-ml-[1px] first:m-0 first:rounded-l-md last:rounded-r-md hover:z-10' : 'rounded-md',

      is('link') && [
        'inline-flex px-1 py-0 bg-transparent',
        'focus:z-10 focus:outline-none focus:underline focus:underline-offset-2 focus:decoration-primary-700 focus:decoration-2',
        disabled ? 'text-neutral-400 bg-transparent' : 'text-primary-700 hover:text-primary-800',
      ],

      is('text') && [
        'inline-flex px-1 py-0 bg-transparent',
        'focus:z-10 focus:outline-none focus:underline focus:underline-offset-2',
        'focus:z-10 focus:outline-none focus:underline focus:underline-offset-2 focus:decoration-primary-700 focus:decoration-2',
        disabled ? 'text-neutral-400 bg-transparent' : 'hover:bg-neutral-500 hover:bg-opacity-5',
      ],

      is('primary') && [
        'px-3 py-1.5 text-sm shadow-sm',
        'focus:z-10 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-white bg-primary-600 hover:bg-primary-800',
      ],

      is('default') && [
        'px-3 py-1.5 text-sm shadow-sm',
        'focus:z-10 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-neutral-900 bg-transparent border border-neutral-400 hover:text-primary-800 hover:border-primary-500',
      ],

      {
        'cursor-not-allowed': disabled,
      },
    ]"
    v-bind="$attrs"
    :type="htmlType"
    :disabled="disabled"
  >
    <span v-if="busy">TODO</span>
    <span
      v-if="!!$slots['icon'] && !is('text')"
      :class="[
        'inline-block w-4 align-text-top',
        is('primary') && (disabled ? 'text-neutral-400' : 'text-primary-300 group-hover:text-primary-200'),
      ]"
      aria-hidden="true"
    >
      <slot name="icon"></slot>
    </span>
    <slot></slot>
  </button>
</template>
