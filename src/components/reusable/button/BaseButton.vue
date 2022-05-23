<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { injectButtonGroup } from './context'

export default defineComponent({
  inheritAttrs: false,
  props: {
    category: {
      type: String as PropType<'primary' | 'default' | 'text' | 'link'>,
      default: 'default',
    },
    disabled: Boolean,
    busy: Boolean,
  },
  setup(props) {
    const ButtonGroup = injectButtonGroup()

    return {
      is: (t: string) => props.category === t,
      insideGroup: ButtonGroup?.insideGroup.value,
    }
  },
})
</script>

<template>
  <button
    class="group"
    :class="[
      insideGroup ? '-ml-[1px] first:m-0 first:rounded-l-sm last:rounded-r-sm hover:z-10' : 'rounded-sm',

      is('link') && [
        'px-1 py-0',
        disabled ? 'text-neutral-400 bg-transparent' : 'text-primary-700 hover:text-primary-800',
      ],

      is('text') && [
        'px-2 py-1 mx-1 bg-transparent',
        disabled ? 'text-neutral-400 bg-transparent' : 'hover:bg-neutral-500 hover:bg-opacity-5',
      ],

      is('primary') && [
        'px-3 py-1.5 text-sm shadow-sm',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-white bg-primary-600 hover:bg-primary-800',
      ],

      is('default') && [
        'px-3 py-1.5 text-sm shadow-sm',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-neutral-900 bg-transparent border border-neutral-400 hover:text-primary-800 hover:border-primary-500',
      ],

      {
        'cursor-not-allowed': disabled,
      },
    ]"
    v-bind="$attrs"
    :disabled="disabled"
  >
    <span v-if="busy">TODO</span>
    <span
      v-if="!!$slots['icon'] && !is('text')"
      :class="[
        'inline-block w-4 align-text-top mr-1',
        is('primary') && (disabled ? 'text-neutral-400' : 'text-primary-300 group-hover:text-primary-200'),
      ]"
      aria-hidden="true"
    >
      <slot name="icon"></slot>
    </span>
    <slot></slot>
  </button>
</template>
