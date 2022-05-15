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
      is('text')
        ? 'px-1 text-neutral-900 hover:text-primary-800'
        : is('link')
        ? 'px-1 text-primary-700 hover:text-primary-800'
        : [
            'px-3 py-1.5 text-sm text-white shadow-sm',
            {
              'bg-primary-600 hover:bg-primary-800': is('primary'),
              'bg-transparent text-neutral-900 border border-neutral-300 hover:text-primary-800 hover:border-primary-500':
                is('default'),
            },
          ],
    ]"
    v-bind="$attrs"
  >
    <span v-if="busy">TODO</span>
    <span
      v-if="!!$slots['icon'] && !is('text')"
      :class="[
        'inline-block w-4 align-text-top mr-1',
        {
          'text-primary-300 group-hover:text-primary-200': is('primary'),
        },
      ]"
      aria-hidden="true"
    >
      <slot name="icon"></slot>
    </span>
    <slot></slot>
  </button>
</template>
