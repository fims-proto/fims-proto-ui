<script setup lang="ts">
import { vOnClickOutside } from '@vueuse/components'
import { onMounted } from 'vue'
import { onUnmounted } from 'vue'
import { registerModal, unregisterModal } from '.'

const props = defineProps<{
  show: boolean
  title?: string
}>()

defineEmits<{
  (event: 'update:show', show: boolean): void
}>()

const modalKey = Math.random().toString(36).slice(-8)

onMounted(() => registerModal(modalKey, () => props.show))
onUnmounted(() => unregisterModal(modalKey))
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
        class="fixed w-screen h-screen top-0 left-0 overflow-hidden bg-black/10 grid place-content-center z-[9999]"
        aria-hidden="true"
      >
        <!-- main window -->
        <div v-on-click-outside="() => $emit('update:show', false)" class="bg-white shadow-lg rounded-lg px-6 py-3">
          <div v-if="title" class="w-full mb-4 text-center">{{ title ?? '' }}</div>
          <slot />
        </div>
      </div>
    </transition>
  </Teleport>
</template>
