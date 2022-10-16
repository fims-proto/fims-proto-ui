<script setup lang="ts">
import { PropType, ref } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
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
  duration: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits<{
  (event: 'close'): void
}>()

const { t } = useI18n()
const durationCss = props.duration > 0 ? `${props.duration}s` : '0'
const closed = ref(false)
let closeClock = 0

const is = (t: string) => props.type === t

if (props.duration > 0) {
  closeClock = window.setTimeout(() => onClose(), props.duration * 1000)
}

const onClose = () => {
  closeClock && clearTimeout(closeClock)
  closed.value = true
  emit('close')
}
</script>

<template>
  <div
    v-if="!closed"
    class="w-full relative flex gap-2 items-strech p-2 border-none rounded-md shadow-lg overflow-hidden"
    :class="{
      'bg-error-200 text-error-900 shadow-error-400/60': is('error'),
      'bg-warning-200 text-warning-900 shadow-warning-500/60': is('warning'),
      'bg-success-200 text-success-900 shadow-success-500/60': is('success'),
      'bg-primary-50 text-primary-900 shadow-primary-400/60': is('info'),
      'pl-4': !showIcon,
    }"
  >
    <span v-if="showIcon" class="h-6 w-auto p-1">
      <ExclamationCircleOutlineIcon v-if="is('error')" class="h-4 w-4" aria-hidden="true" />
      <ExclamationTriangleOutlineIcon v-if="is('warning')" class="h-4 w-4" aria-hidden="true" />
      <CheckCircleOutlineIcon v-if="is('success')" class="h-4 w-4" aria-hidden="true" />
      <InformationCircleOutlineIcon v-if="is('info')" class="h-4 w-4" aria-hidden="true" />
    </span>

    <slot>
      <span>{{ message }}</span>
    </slot>

    <!-- progress bar -->
    <div
      v-if="duration > 0"
      :class="[
        'absolute right-0 bottom-0 w-full h-0.5 origin-right countdown',
        {
          'bg-error-500': is('error'),
          'bg-warning-600': is('warning'),
          'bg-success-600': is('success'),
          'bg-primary-500': is('info'),
        },
      ]"
    />

    <button
      v-if="closable"
      type="button"
      :class="[
        'h-6 w-auto p-1 rounded-sm ml-auto',
        {
          'hover:bg-error-300': is('error'),
          'hover:bg-warning-300': is('warning'),
          'hover:bg-success-300': is('success'),
          'hover:bg-primary-300': is('info'),
        },
        'focus:outline-none focus-visible:ring focus-visible:ring-primary-600/50',
      ]"
      @click.prevent="onClose"
    >
      <span class="sr-only">{{ t('action.close') }}</span>
      <XMarkOutlineIcon class="h-4 w-4" aria-hidden="true" />
    </button>
  </div>
</template>

<style scoped>
.countdown {
  animation-duration: v-bind(durationCss);
  animation-name: countdown;
  animation-timing-function: linear;
}

@keyframes countdown {
  to {
    transform: scaleX(0);
  }
}
</style>
