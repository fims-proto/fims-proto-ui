<script setup lang="ts">
import { injectInterface } from './context'

const props = defineProps<{
  command?: string
}>()

const Dropdown = injectInterface()

const handleClick = () => {
  Dropdown?.handleItemSelect(props.command)
}
</script>

<template>
  <MenuItem v-slot="{ active }">
    <button
      :class="[
        'group w-full flex items-center gap-2 px-4 py-2 text-left text-sm whitespace-nowrap cursor-pointer active:bg-neutral-300/70',
        active ? 'bg-neutral-300/50 text-neutral-900' : 'text-neutral-700',
      ]"
      @click="handleClick"
    >
      <span
        v-if="!!$slots['icon']"
        :class="['w-4', active ? 'text-neutral-500' : 'text-neutral-400']"
        aria-hidden="true"
      >
        <slot name="icon"></slot>
      </span>

      <slot></slot>
    </button>
  </MenuItem>
</template>
