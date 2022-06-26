<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, PropType, ref, useSlots } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { onClickOutside } from '@vueuse/core'
import { useI18n } from 'vue-i18n'
import { injectButtonGroup } from './context'

const props = defineProps({
  type: {
    type: String as PropType<'primary' | 'default' | 'flat'>,
    default: 'default',
  },
  htmlType: {
    type: String as PropType<'submit' | 'reset' | 'button'>,
    default: 'button',
  },
  confirm: Boolean,
  confirmationText: {
    type: String,
    default: undefined,
  },
  disabled: Boolean,
  busy: Boolean,
})

const emit = defineEmits<{
  (event: 'click'): void
}>()

const slots = useSlots()

const { t } = useI18n()

const ButtonGroup = injectButtonGroup()
const insideGroup = ButtonGroup?.insideGroup.value
const confirming = ref(false)
const confirmationBoxRef = ref()

const is = (t: string) => props.type === t
const hasSlot = (n: string) => !!slots[n]

const onClick = () => {
  if (props.confirm) {
    confirming.value = true
  } else {
    emit('click')
  }
}

const onConfirmClick = () => {
  confirming.value = false
  emit('click')
}

onClickOutside(confirmationBoxRef, () => (confirming.value = false))
</script>

<template>
  <VBinder>
    <VTarget>
      <button
        :class="[
          'group flex gap-1 items-center justify-center',

          insideGroup ? '-ml-[1px] first:m-0 first:rounded-l-md last:rounded-r-md hover:z-10' : 'rounded-md',

          is('primary') && [
            'shadow-sm focus:z-10 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500',
            disabled
              ? 'text-neutral-400 bg-transparent border border-neutral-300'
              : 'text-white bg-primary-600 hover:bg-primary-800',
          ],

          is('default') && [
            'shadow-sm focus:z-10 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500',
            disabled
              ? 'text-neutral-400 bg-transparent border border-neutral-300'
              : 'text-neutral-900 bg-transparent border border-neutral-400 hover:text-primary-800 hover:border-primary-500',
          ],

          is('flat') && [
            'focus:z-10 focus:outline-none focus:ring-offset-2 focus:ring focus:ring-primary-500',
            disabled
              ? 'text-neutral-400 bg-transparent'
              : 'text-neutral-700 bg-transparent hover:text-primary-800 hover:bg-neutral-200/50',
          ],

          {
            'cursor-not-allowed': disabled,
          },
        ]"
        v-bind="$attrs"
        :type="htmlType"
        :disabled="disabled"
        @click="onClick"
      >
        <!-- icon -->
        <span
          v-if="hasSlot('icon')"
          :class="[
            'inline-block w-4 align-text-top',
            hasSlot('default') ? 'ml-1.5 my-1.5' : 'mx-1.5 my-1.5',
            is('primary') && (disabled ? 'text-neutral-400' : 'text-primary-300 group-hover:text-primary-200'),
          ]"
          aria-hidden="true"
        >
          <slot name="icon"></slot>
        </span>

        <!-- text -->
        <span v-if="hasSlot('default')" :class="['text-sm', hasSlot('icon') ? 'mr-3 my-1.5' : 'mx-3 my-1.5']">
          <slot></slot>
        </span>
      </button>
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
