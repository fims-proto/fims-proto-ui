<script setup lang="ts" generic="T">
import { VBinder, VTarget, VFollower } from 'vueuc'
import { injectForm } from './context'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: T | T[]
  disabled?: boolean
  multiple?: boolean
  displayValue: (v: T | undefined) => string | undefined
  options: (T & { disabled?: boolean })[]
  optionKey: (opt: T | undefined) => string | undefined
  displayOption: (opt: T | undefined) => string | undefined
}>()

defineEmits<{
  (event: 'update:modelValue', value: T | T[]): void
}>()

const { t } = useI18n()

const Form = injectForm()
const editMode = computed(() => Form?.edit.value ?? true)
</script>

<template>
  <Listbox
    v-if="editMode"
    v-slot="{ open }"
    :model-value="modelValue as object"
    :multiple="multiple"
    :disabled="disabled"
    @update:model-value="(v) => $emit('update:modelValue', v)"
  >
    <VBinder>
      <VTarget>
        <ListboxButton
          class="flex justify-between align-text-bottom w-full px-3 py-2 text-sm rounded-md border border-neutral-300"
          :class="disabled ? 'text-neutral-500' : 'bg-white hover:border-primary-400'"
        >
          <span class="truncate">
            {{ Array.isArray(modelValue) ? modelValue.map(displayValue).join(', ') : displayValue(modelValue as T) }}
          </span>
          <ChevronUpDownMiniIcon class="w-5 h-5 text-neutral-400" aria-hidden="true" />
        </ListboxButton>
      </VTarget>
      <VFollower :show="open" placement="bottom-start" width="target">
        <transition
          :appear="open"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 -translate-y-2 opacity-0"
        >
          <ListboxOptions
            class="my-1 bg-white divide-y divide-neutral-200 border border-neutral-200 overflow-hidden rounded-md shadow-lg focus:outline-none"
          >
            <template v-if="options.length > 0">
              <ListboxOption
                v-for="option in options"
                :key="optionKey(option)"
                v-slot="{ active, selected }"
                :value="option"
                :disabled="option.disabled"
                as="template"
              >
                <li
                  class="flex gap-1 align-baseline px-3 py-2 text-sm"
                  :class="{ 'bg-primary-700 text-white cursor-pointer': active }"
                >
                  <span>{{ displayOption(option) }}</span>
                  <CheckMiniIcon
                    v-if="selected"
                    class="w-5 h-5"
                    :class="[active ? 'text-primary-100' : 'text-primary-700']"
                    aria-hidden="true"
                  />
                </li>
              </ListboxOption>
            </template>

            <div v-else class="flex justify-center gap-1 px-3 py-2 text-sm text-neutral-400">
              <FaceFrownOutlineIcon class="w-5 h-5" aria-hidden="true" />
              <span>{{ t('common.emptyContent') }}</span>
            </div>
          </ListboxOptions>
        </transition>
      </VFollower>
    </VBinder>
  </Listbox>

  <!-- display mode -->
  <span v-else class="text-sm">
    {{ Array.isArray(modelValue) ? modelValue.map(displayValue).join(', ') : displayValue(modelValue as T) }}
  </span>
</template>
