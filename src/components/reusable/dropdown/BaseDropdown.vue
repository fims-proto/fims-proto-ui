<script setup lang="ts">
import { PropType } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { provideInterface } from './context'

defineProps({
  placement: {
    type: String as PropType<'bottom-start' | 'bottom-end'>,
    default: 'bottom-start',
  },
})

const emit = defineEmits<{
  (e: 'select', command: string): void
}>()

const handleItemSelect = (command: string | undefined) => command && emit('select', command)

provideInterface({
  handleItemSelect,
})
</script>

<template>
  <Menu v-slot="{ open }" as="template">
    <v-binder>
      <v-target>
        <slot></slot>
      </v-target>

      <v-follower :show="open" :placement="placement">
        <transition
          :appear="open"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 -translate-y-2 opacity-0"
        >
          <menu-items
            class="rounded-md my-2 shadow-lg bg-white divide-y divide-neutral-200 ring-1 ring-black ring-opacity-5 focus:outline-none"
          >
            <slot name="overlay"></slot>
          </menu-items>
        </transition>
      </v-follower>
    </v-binder>
  </Menu>
</template>
