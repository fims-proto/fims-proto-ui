<script setup lang="ts" generic="T">
import type { HTMLAttributes } from 'vue'
import { computed } from 'vue'

import { Field, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'

const props = defineProps<{
  label?: string
  labelFor?: string
  description?: string
  errors?: Array<string | { message: string | undefined } | undefined>
  isEditing: boolean
  value?: T
  formatter?: (value: T | undefined) => string | number | null | undefined
  dataInvalid?: boolean
  class?: HTMLAttributes['class']
}>()

const emit = defineEmits<{
  (e: 'update:value', value: T | undefined): void
}>()

defineSlots<{
  display?: (scope: { value: T | undefined }) => unknown
  edit?: (scope: { value: T | undefined; onUpdate: (value: T | undefined) => void }) => unknown
}>()

const formattedValue = computed(() => {
  const rawValue = props.value
  const maybeFormatted = props.formatter ? props.formatter(rawValue) : rawValue

  if (maybeFormatted === undefined || maybeFormatted === null || maybeFormatted === '') {
    return ''
  }

  return String(maybeFormatted)
})

function handleUpdate(value: T | undefined) {
  emit('update:value', value)
}
</script>

<template>
  <Field :data-invalid="props.dataInvalid" :class="props.class">
    <template v-if="props.label">
      <FieldLabel v-if="props.isEditing" :for="props.labelFor">
        {{ props.label }}
      </FieldLabel>
      <span v-else class="text-sm leading-snug font-medium select-none">
        {{ props.label }}
      </span>
    </template>

    <div data-slot="field-content" class="flex flex-col gap-2">
      <template v-if="props.isEditing">
        <slot name="edit" :value="props.value" :on-update="handleUpdate" />
      </template>
      <template v-else>
        <slot name="display" :value="props.value">
          <span class="text-sm">{{ formattedValue }}</span>
        </slot>
      </template>

      <FieldDescription v-if="props.description">
        {{ props.description }}
      </FieldDescription>

      <FieldError v-if="props.errors?.length" :errors="props.errors" />
    </div>
  </Field>
</template>
