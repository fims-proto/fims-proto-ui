<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  inheritAttrs: false,
  props: {
    color: String as PropType<'error' | 'info' | 'success' | 'warning' | undefined>,
    closable: Boolean
  },
  setup(props) {
    const t = useI18n().t
    const closed = ref(false)

    return {
      t,
      closed,
      is(t: string | undefined) {
        return props.color === t
      },
      handleClose() {
        closed.value = true
      }
    }
  }
})
</script>

<template>
  <div
    v-if="!closed"
    class="inline-block p-1 rounded-sm shadow-sm text-xs ring-1"
    :class="{
      'bg-error-200 text-error-900 ring-error-300': is('error'),
      'bg-warning-200 text-warning-900 ring-warning-300': is('warning'),
      'bg-success-200 text-success-900 ring-success-500': is('success'),
      'bg-primary-50 text-primary-900 ring-primary-300': is('info') || is(undefined)
    }"
  >
    <slot></slot>

    <button
      v-if="closable"
      type="button"
      class="h-4 w-auto rounded-md ml-1"
      :class="{
        'hover:bg-error-300': is('error'),
        'hover:bg-warning-300': is('warning'),
        'hover:bg-success-300': is('success'),
        'hover:bg-primary-300': is('info') || is(undefined)
      }"
      @click.prevent="handleClose"
    >
      <span class="sr-only">{{ t('action.close') }}</span>
      <x-outline-icon class="h-3 w-3" aria-hidden="true" />
    </button>
  </div>
</template>