<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, useSlots } from 'vue'
import { injectButtonGroup } from './context'

const props = withDefaults(
  defineProps<{
    category?: 'default' | 'primary' | 'alert' | 'flat'
    htmlType?: 'submit' | 'reset' | 'button'
    size?: 'S' | 'M'
    disabled?: boolean
    busy?: boolean
  }>(),
  {
    category: 'default',
    htmlType: 'button',
    size: 'M',
  },
)

const slots = useSlots()

const ButtonGroup = injectButtonGroup()
const insideGroup = ButtonGroup?.insideGroup.value

const is = (t: string) => props.category === t
const hasSlot = (n: string) => !!slots[n]
const hasIcon = () => !!slots['icon'] || props.busy
</script>

<template>
  <button
    :class="[
      'group flex self-center items-center justify-center',
      size === 'S' ? 'gap-0.5' : 'gap-1',

      insideGroup ? '-ml-px first:m-0 first:rounded-l-md last:rounded-r-md hover:z-10' : 'rounded-md',

      is('default') && [
        'shadow-sm',
        'focus:z-10 focus:outline-none focus-visible:border-primary-600 focus-visible:ring-4 focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-neutral-900 bg-transparent border border-neutral-400 active:bg-neutral-300/40 hover:text-primary-800 hover:border-primary-600',
      ],

      is('primary') && [
        'shadow-sm',
        'focus:z-10 focus:outline-none focus-visible:border-primary-600 focus-visible:ring-4 focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-white bg-primary-600 active:bg-primary-800 hover:bg-primary-700',
      ],

      is('alert') && [
        'shadow-sm',
        'focus:z-10 focus:outline-none focus-visible:border-error-700 focus-visible:ring-4 focus-visible:ring-error-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent border border-neutral-300'
          : 'text-white bg-error-600 active:bg-error-800 hover:bg-error-700',
      ],

      is('flat') && [
        'focus:z-10 focus:outline-none focus-visible:ring-offset-2 focus-visible:ring focus-visible:ring-primary-600/50',
        disabled
          ? 'text-neutral-400 bg-transparent'
          : 'text-neutral-700 bg-transparent active:bg-neutral-300/40 hover:text-primary-800 hover:bg-neutral-200/50',
      ],

      {
        'cursor-not-allowed': disabled || busy,
      },
    ]"
    v-bind="$attrs"
    :type="htmlType"
    :disabled="disabled || busy"
  >
    <!-- icon -->
    <span
      v-if="hasIcon()"
      :class="[
        'inline-block align-text-top',
        size === 'S'
          ? ['w-3', hasSlot('default') ? 'ml-0.5 my-0.5' : 'mx-0.5 my-0.5']
          : ['w-4', hasSlot('default') ? 'ml-1.5 my-1.5' : 'mx-1.5 my-1.5'],
        (is('primary') || is('alert')) && (disabled ? 'text-neutral-400' : 'opacity-50'),
      ]"
      aria-hidden="true"
    >
      <svg v-if="busy" class="animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <slot v-else name="icon"></slot>
    </span>

    <!-- text -->
    <span
      v-if="hasSlot('default')"
      :class="[
        size === 'S'
          ? ['text-xs', hasIcon() ? 'mr-1.5 my-0.5' : 'mx-1.5 my-0.5']
          : ['text-sm', hasIcon() ? 'mr-3 my-1.5' : 'mx-3 my-1.5'],
      ]"
    >
      <slot></slot>
    </span>
  </button>
</template>
