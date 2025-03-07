<script setup lang="ts">
import { type PropType } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { provideInterface } from './context'

defineProps({
  placement: {
    type: String as PropType<'bottom-start' | 'bottom-end'>,
    default: 'bottom-start',
  },
})

const emit = defineEmits<{
  (event: 'select', command: string): void
}>()

const handleItemSelect = (command: string | undefined) => command && emit('select', command)

provideInterface({
  handleItemSelect,
})
</script>

<template>
  <Menu v-slot="{ open }">
    <VBinder>
      <VTarget>
        <MenuButton as="template">
          <slot name="trigger" :open="open"></slot>
        </MenuButton>
      </VTarget>

      <VFollower :show="open" :placement="placement">
        <transition
          :appear="open"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 -translate-y-2 opacity-0"
        >
          <MenuItems
            class="my-2 bg-white divide-y divide-neutral-200 border border-neutral-200 overflow-hidden rounded-md shadow-lg focus:outline-none"
          >
            <slot name="overlay"></slot>
          </MenuItems>
        </transition>
      </VFollower>
    </VBinder>
  </Menu>
</template>
