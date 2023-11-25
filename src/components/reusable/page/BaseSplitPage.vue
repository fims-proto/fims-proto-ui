<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  detailSize?: 'S' | 'M' | 'L'
}>()

const { t } = useI18n()

const detailFlexBasis = computed(() => {
  switch (props.detailSize) {
    case 'S':
      return 'basis-1/4'
    case 'L':
      return 'basis-4/5'
    default:
      return 'basis-1/2'
  }
})
</script>

<template>
  <div class="flex gap-4 w-full">
    <!-- master view -->
    <div class="flex-auto">
      <slot name="main" />
    </div>

    <!-- detail view -->
    <div :class="detailFlexBasis">
      <slot name="detail">
        <div class="w-full h-full flex place-content-center place-items-center text-neutral-600/50">
          {{ t('common.emptyContent') }}
        </div>
      </slot>
    </div>
  </div>
</template>
