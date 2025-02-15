<script setup lang="ts">
defineProps<{
  from: 'left' | 'right'
}>()
</script>

<template>
  <Transition
    :enter-from-class="from === 'left' ? '-translate-x-full' : 'translate-x-full'"
    enter-active-class="duration-20000"
    enter-to-class=""
    leave-from-class=""
    leave-active-class="duration-20000"
    :leave-to-class="from === 'left' ? '-translate-x-full' : 'translate-x-full'"
  >
    <slot></slot>
  </Transition>
</template>
