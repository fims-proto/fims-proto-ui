<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { injectButtonGroup } from './context';

export default defineComponent({
  inheritAttrs: false,
  props: {
    categoty: {
      type: String as PropType<'primary' | 'error' | 'success' | 'warning' | 'default'>,
      default: 'default'
    },
    busy: Boolean,
    text: Boolean
  },
  setup(props) {
    const ButtonGroup = injectButtonGroup()

    return {
      is: (t: string) => props.categoty === t,
      insideGroup: ButtonGroup?.insideGroup.value
    }
  }
})
</script>

<template>
  <button class="group" :class="[
    insideGroup ? '-ml-[1px] first:m-0 first:rounded-l-md last:rounded-r-md hover:z-10' : 'rounded-md',
    text ? 'text-neutral-900 hover:text-primary-800' : ['px-3 py-2 font-medium text-sm text-white shadow-sm', {
      'bg-primary-600 hover:bg-primary-800': is('primary'),
      'bg-error-600 hover:bg-error-700': is('error'),
      'bg-warning-500 hover:bg-warning-600': is('warning'),
      'bg-success-500 hover:bg-success-600': is('success'),
      'bg-transparent text-neutral-900 border border-neutral-300 hover:text-primary-800 hover:border-primary-500': is('default')
    }]
  ]" v-bind="$attrs">
    <span v-if="busy">TODO</span>
    <span v-if="!!$slots['icon'] && !text" :class="[
      'inline-block w-4 align-text-top mr-1',
      text ? 'text-neutral-900 group-hover:text-primary-800' : {
        'text-primary-500 group-hover:text-primary-400': is('primary'),
        'text-error-400 group-hover:text-error-300': is('error'),
        'text-warning-400 group-hover:text-warning-300': is('warning'),
        'text-success-400 group-hover:text-success-300': is('success')
      }
    ]" aria-hidden="true">
      <slot name="icon"></slot>
    </span>
    <slot></slot>
  </button>
</template>