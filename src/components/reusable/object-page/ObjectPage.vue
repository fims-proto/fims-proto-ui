<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { ActionItem } from './types'

defineProps<{
  title?: string
  subtitle?: string
  actions?: ActionItem[]
}>()

defineEmits<{
  (event: 'close'): void
}>()

const { t } = useI18n()
</script>

<template>
  <div class="flex flex-col gap-4 rounded-md bg-white shadow-md dark:bg-zinc-900">
    <!-- header -->
    <div class="flex flex-col gap-8 p-4">
      <div class="flex items-center justify-between gap-2">
        <div class="flex items-center gap-1">
          <Button icon="pi pi-angle-left" text rounded :aria-label="t('action.close')" @click="$emit('close')" />
          <h1 v-if="title" class="text-color text-2xl font-bold">
            <span>{{ title }}</span>
          </h1>
          <div v-if="$slots['header']" class="ml-2">
            <slot name="header"></slot>
          </div>
        </div>

        <!-- actions -->
        <div class="flex gap-1">
          <template v-for="action in actions" :key="action.label">
            <Button
              v-if="action.condition?.() ?? true"
              :label="action.label"
              :disabled="action.disabled?.()"
              text
              @click="action.command"
            />
          </template>
        </div>
      </div>

      <div v-if="subtitle" class="self-end text-neutral-500">
        <span>{{ subtitle }}</span>
      </div>

      <div v-if="$slots['attributes']" class="px-3">
        <slot name="attributes"></slot>
      </div>
    </div>

    <div class="border-color grow border-t p-4">
      <slot name="extra"></slot>
    </div>
  </div>
</template>
