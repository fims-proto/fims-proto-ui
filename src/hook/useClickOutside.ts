import { onMounted, onUnmounted, ref, Ref } from 'vue';

/**
 * use to detect if mouse click happens outside of elementRef
 */
export default (elementRef: Ref<HTMLElement | null>) => {
  const isClickOutside = ref(false)

  const handler = (e: MouseEvent) =>
    isClickOutside.value = !(elementRef.value && elementRef.value.contains(e.target as HTMLElement))

  onMounted(() => document.addEventListener('click', handler))

  onUnmounted(() => document.removeEventListener('click', handler))

  return isClickOutside
}