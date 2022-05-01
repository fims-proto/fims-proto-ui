<script lang="ts">
import { defineComponent } from 'vue';
import { injectInterface } from './context';

export default defineComponent({
  inheritAttrs: false,
  props: {
    command: String
  },
  setup(props) {
    const Dropdown = injectInterface()

    const handleClick = () => {
      Dropdown?.handleItemSelect(props.command)
    }

    return {
      handleClick
    }
  }
})
</script>

<template>
  <menu-item v-slot="{ active }">
    <button
      class="group w-full flex items-center gap-2 px-4 py-2 text-left text-sm whitespace-nowrap"
      :class="[active ? 'bg-neutral-200 text-neutral-900' : 'text-neutral-700']"
      @click.prevent="handleClick"
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
  </menu-item>
</template>