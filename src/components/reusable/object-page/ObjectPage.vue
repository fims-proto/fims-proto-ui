<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ActionItem } from './types'

defineProps<{
  title: string
  subtitle?: string
  actions?: ActionItem[]
}>()

defineEmits<{
  (event: 'close'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-md bg-white p-4 shadow-md">
    <!-- header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1">
          <Button icon="pi pi-angle-left" text rounded :aria-label="t('action.close')" @click="$emit('close')" />
          <h1 class="text-color text-2xl font-bold">
            <span>{{ title }}</span>
          </h1>
        </div>

        <!-- actions -->
        <div class="flex gap-1">
          <template v-for="action in actions">
            <Button
              v-if="action.condition?.() ?? true"
              :label="action.label"
              :disabled="action.disabled?.()"
              @click="action.command"
              text
            />
          </template>
        </div>
      </div>

      <div v-if="subtitle" class="self-end text-neutral-500">
        <span>{{ subtitle }}</span>
      </div>

      <div>
        <slot name="attributes"></slot>
      </div>
    </div>

    <div>
      <slot name="extra"></slot>
    </div>
  </div>
</template>
