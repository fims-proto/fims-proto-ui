<script lang="ts">
import { defineComponent, PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'

export default defineComponent({
  inheritAttrs: false,
  props: {
    type: {
      type: String as PropType<'error' | 'info' | 'success' | 'warning'>,
      default: 'info',
    },
    message: {
      type: String,
      default: '',
    },
    showIcon: {
      type: Boolean,
      default: true,
    },
    closable: Boolean,
    banner: Boolean,
  },
  setup(props) {
    const t = useI18n().t
    const closed = ref(false)

    return {
      t,
      closed,
      is(t: string) {
        return props.type === t
      },
      handleClose() {
        closed.value = true
      },
    }
  },
})
</script>

<template>
  <div
    v-if="!closed"
    class="w-full flex gap-2 items-strech p-2 border-none rounded-md shadow-sm"
    :class="{
      'bg-error-200 text-error-900': is('error'),
      'bg-warning-200 text-warning-900': is('warning'),
      'bg-success-200 text-success-900': is('success'),
      'bg-primary-50 text-primary-900': is('info'),
      'pl-4': !showIcon,
    }"
  >
    <span v-if="showIcon" class="h-6 w-auto p-1">
      <exclamation-circle-solid-icon v-if="is('error')" class="h-4 w-4" aria-hidden="true" />
      <exclamation-solid-icon v-if="is('warning')" class="h-4 w-4" aria-hidden="true" />
      <check-circle-solid-icon v-if="is('success')" class="h-4 w-4" aria-hidden="true" />
      <information-circle-solid-icon v-if="is('info')" class="h-4 w-4" aria-hidden="true" />
    </span>

    <slot>
      <span>{{ message }}</span>
    </slot>

    <button
      v-if="closable"
      type="button"
      class="h-6 w-auto p-1 rounded-md ml-auto"
      :class="{
        'hover:bg-error-300': is('error'),
        'hover:bg-warning-300': is('warning'),
        'hover:bg-success-300': is('success'),
        'hover:bg-primary-300': is('info'),
      }"
      @click.prevent="handleClose"
    >
      <span class="sr-only">{{ t('action.close') }}</span>
      <x-outline-icon class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
</template>
