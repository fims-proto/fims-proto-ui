<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { useI18n } from 'vue-i18n'
import BaseButton from './BaseButton.vue'
import { onClickOutside } from '@vueuse/core'

defineProps({
  confirmationText: {
    type: String,
    default: undefined,
  },
  ...BaseButton.props,
})

const emit = defineEmits<{
  (event: 'click'): void
}>()

const { t } = useI18n()

const confirming = ref(false)
const confirmationBoxRef = ref()

const onConfirmClick = () => {
  confirming.value = false
  emit('click')
}

onClickOutside(confirmationBoxRef, () => (confirming.value = false))
</script>

<template>
  <VBinder>
    <VTarget>
      <BaseButton v-bind="{ ...$props, ...$attrs }" @click="confirming = true">
        <slot></slot>
      </BaseButton>
    </VTarget>

    <VFollower :show="confirming" placement="bottom">
      <transition
        :appear="confirming"
        enter-active-class="transition duration-100 ease-out"
        enter-from-class="scale-95 -translate-y-2 opacity-0"
        enter-to-class="scale-100 translate-y-0 opacity-100"
        leave-active-class="transition duration-75 ease-in"
        leave-from-class="scale-100 translate-y-0 opacity-100"
        leave-to-class="scale-95 -translate-y-2 opacity-0"
      >
        <div
          v-if="confirming"
          ref="confirmationBoxRef"
          class="bg-white mt-2 p-2 text-sm rounded-md shadow-lg border border-neutral-200"
        >
          <span>{{ confirmationText ?? t('common.confirmationText') }}</span>
          <button class="bg-error-600 ml-1 px-2 text-white rounded-md" @click.prevent="onConfirmClick">
            {{ t('common.confirm') }}
          </button>
        </div>
      </transition>
    </VFollower>
  </VBinder>
</template>
