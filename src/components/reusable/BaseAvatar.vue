<script lang="ts">
import { defineComponent, onMounted, onUpdated, ref } from 'vue'

export default defineComponent({
  props: {
    customSizing: Boolean,
    customColor: Boolean,
  },
  setup() {
    const containerRef = ref<HTMLElement>()
    const contentRef = ref<HTMLElement>()
    const scale = ref(1)

    const setScaleStyle = () => {
      const gap = 8
      if (!containerRef.value || !contentRef.value) {
        return
      }

      const containerWidth = containerRef.value.offsetWidth
      const contentWidth = contentRef.value.offsetWidth
      if (containerWidth !== 0 && contentWidth !== 0 && contentWidth + gap >= containerWidth) {
        scale.value = (containerWidth - gap) / contentWidth
      } else {
        scale.value = 1
      }
    }

    onMounted(() => {
      setScaleStyle()
    })

    onUpdated(() => {
      setScaleStyle()
    })

    return {
      containerRef,
      contentRef,
      scale,
    }
  },
})
</script>

<template>
  <span
    ref="containerRef"
    class="block relative rounded-full ring-2 ring-white overflow-hidden"
    :class="{ 'h-10 w-10': !customSizing, 'bg-neutral-500 text-neutral-50': !customColor }"
  >
    <span v-if="!!$slots.icon" class="w-auto">
      <slot name="icon"></slot>
    </span>
    <span
      v-else
      ref="contentRef"
      class="absolute left-1/2 top-1/2 whitespace-nowrap"
      :style="`transform: scale(${scale}) translate(-50%, -50%); transform-origin: 0 0;`"
    >
      <slot></slot>
    </span>
  </span>
</template>
