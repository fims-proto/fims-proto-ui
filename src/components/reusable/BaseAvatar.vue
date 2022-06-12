<script setup lang="ts">
import { onMounted, ref } from 'vue'

defineProps<{
  name: string
}>()

const containerRef = ref<HTMLElement>()
const contentRef = ref<HTMLElement>()
const scale = ref(1)

const setScaleParam = () => {
  if (!contentRef.value || !containerRef.value) {
    return
  }
  const childrenWidth = contentRef.value.offsetWidth // offsetWidth avoid affecting be transform scale
  const nodeWidth = containerRef.value.offsetWidth
  // denominator is 0 is no meaning
  if (childrenWidth !== 0 && nodeWidth !== 0) {
    const gap = 5
    if (gap * 2 < nodeWidth) {
      scale.value = nodeWidth - gap * 2 < childrenWidth ? (nodeWidth - gap * 2) / childrenWidth : 1
    }
  }
}

onMounted(() => {
  setScaleParam()
})
</script>

<template>
  <span
    ref="containerRef"
    class="w-10 h-10 flex items-center justify-center bg-neutral-700 text-white rounded-full ring-2 ring-white overflow-clip"
  >
    <span ref="contentRef" class="whitespace-nowrap" :style="`transform: scale(${scale});`">{{ name }}</span>
  </span>
</template>
