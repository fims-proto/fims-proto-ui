<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, toRefs } from 'vue'
import { injectList } from './context'
import { computed } from 'vue'

const props = defineProps<{
  value: unknown
}>()

const emit = defineEmits<{
  (event: 'click'): void
}>()

const List = injectList()

const { clickable, hoverable } = toRefs(List?.options.value ?? { clickable: false, hoverable: false })
const active = computed(() => List?.selectedItem.value === props.value)

const onClick = () => {
  if (List?.options.value.clickable) {
    List.onSelectItem(props.value)
    emit('click')
  }
}
</script>

<template>
  <li
    :class="[
      'px-2 py-1 rounded-md text-neutral-700',
      clickable && 'cursor-pointer select-none',
      active
        ? 'bg-primary-600 text-white active:bg-primary-700'
        : [clickable && 'active:bg-neutral-300/70', hoverable && 'hover:bg-neutral-300/50 hover:text-neutral-900'],
    ]"
    @click="onClick"
  >
    <slot></slot>
  </li>
</template>
