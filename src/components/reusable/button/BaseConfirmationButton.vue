<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts">
import { defineComponent, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BaseButton from './BaseButton.vue'

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

const onConfirmClick = () => {
  confirming.value = false
  emit('click')
}
</script>

<template>
  <BaseButton v-bind="{ ...$props, ...$attrs }" @click="confirming = true">
    <slot></slot>
  </BaseButton>

  <BaseModal v-model:show="confirming">
    <div class="flex flex-col gap-4">
      <span>{{ confirmationText ?? t('common.confirmationText') }}</span>
      <div class="flex gap-1 justify-end">
        <BaseButton category="flat" @click="confirming = false">
          {{ t('common.cancel') }}
        </BaseButton>
        <BaseButton category="alert" @click="onConfirmClick">
          {{ t('common.confirm') }}
        </BaseButton>
      </div>
    </div>
  </BaseModal>
</template>
