<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'

defineProps<{
  show: boolean
  title?: string
}>()

defineEmits<{
  (event: 'update:show', show: boolean): void
}>()
</script>

<template>
  <Teleport to="body">
    <!-- mask -->
    <transition
      :appear="show"
      enter-active-class="transition duration-100 ease-out"
      enter-from-class="scale-105 opacity-0"
      enter-to-class="scale-100 opacity-100"
      leave-active-class="transition duration-75 ease-in"
      leave-from-class="scale-100 opacity-100"
      leave-to-class="scale-105 opacity-0"
    >
      <div
        v-if="show"
        class="fixed w-screen h-screen top-0 left-0 overflow-hidden bg-neutral-950/50 grid place-content-center"
        aria-hidden="true"
      >
        <!-- main window -->
        <div v-on-click-outside="() => $emit('update:show', false)" class="bg-white rounded-lg px-4 py-2 pb-4">
          <div v-if="title" class="w-full mb-2 text-center">{{ title }}</div>
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>
