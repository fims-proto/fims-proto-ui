<script setup lang="ts">
import { PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  color: {
    type: String as PropType<'error' | 'info' | 'success' | 'warning'>,
    default: 'info',
  },
  closable: Boolean,
})

const { t } = useI18n()
const closed = ref(false)

const is = (t: string | undefined) => props.color === t
</script>

<template>
  <div
    v-if="!closed"
    class="inline-flex p-1 rounded-sm shadow-sm text-xs ring-1"
    :class="{
      'bg-error-200 text-error-900 ring-error-300': is('error'),
      'bg-warning-200 text-warning-900 ring-warning-300': is('warning'),
      'bg-success-200 text-success-900 ring-success-500': is('success'),
      'bg-primary-50 text-primary-900 ring-primary-300': is('info'),
    }"
  >
    <slot></slot>

    <button
      v-if="closable"
      type="button"
      class="h-4 w-auto rounded-sm ml-1 focus:outline-none focus-visible:ring focus-visible:ring-primary-600/50"
      :class="{
        'hover:bg-error-300': is('error'),
        'hover:bg-warning-300': is('warning'),
        'hover:bg-success-300': is('success'),
        'hover:bg-primary-300': is('info'),
      }"
      @click.prevent="closed = true"
    >
      <span class="sr-only">{{ t('action.close') }}</span>
      <XMarkMiniIcon class="h-3 w-3" aria-hidden="true" />
    </button>
  </div>
</template>
