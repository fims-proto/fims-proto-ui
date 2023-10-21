<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts" generic="T">
import { computed, defineComponent } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { injectForm, injectFormItem } from './context'

defineProps<{
  modelValue: T | undefined
  disabled?: boolean
  displayValue: (item: T | undefined) => string | undefined
  options: T[]
  optionKey: (opt: T | undefined) => string | undefined
  displayOption: (opt: T | undefined) => string | undefined
}>()

defineEmits<{
  (event: 'update:modelValue', value: T): void
  (event: 'change', value: string): void
}>()

const Form = injectForm()
const FormItem = injectFormItem()

const edit = computed(() => Form?.edit.value ?? true)
const errorStatus = () => FormItem?.itemStatus.value === 'error'
</script>

<template>
  <!-- edit mode -->
  <template v-if="edit">
    <VBinder>
      <Combobox
        :model-value="modelValue as object"
        :disabled="disabled"
        nullable
        @update:model-value="(v) => $emit('update:modelValue', v)"
      >
        <VTarget>
          <ComboboxInput
            :disabled="disabled"
            :display-value="(item) => displayValue(item as T) ?? ''"
            autocomplete="off"
            class="appearance-none w-full text-sm rounded-md border focus:z-10 focus:outline-none focus:ring"
            :class="[
              disabled
                ? 'text-neutral-500 border-neutral-300'
                : [
                    'bg-white',
                    errorStatus()
                      ? 'border-error-700 focus:ring-error-700/50 focus:border-error-600'
                      : 'border-neutral-300 hover:border-primary-400 focus:ring-primary-600/50 focus:border-primary-600',
                  ],
            ]"
            @change="(e) => $emit('change', e.target.value)"
          />
        </VTarget>

        <VFollower :show="!disabled" placement="bottom-start" teleport-disabled>
          <transition
            enter-active-class="transition duration-100 ease-out"
            enter-from-class="scale-95 -translate-y-2 opacity-0"
            enter-to-class="scale-100 translate-y-0 opacity-100"
            leave-active-class="transition duration-75 ease-in"
            leave-from-class="scale-100 translate-y-0 opacity-100"
            leave-to-class="scale-95 -translate-y-2 opacity-0"
          >
            <ComboboxOptions
              v-show="options.length"
              class="max-h-60 min-w-[12rem] bg-white z-20 my-1 border border-neutral-300 rounded-md shadow-lg overflow-auto"
            >
              <ComboboxOption
                v-for="option in options"
                v-slot="{ active }"
                :key="optionKey(option)"
                :value="option as object"
                as="template"
              >
                <li :class="['p-2 text-sm cursor-pointer', active ? 'bg-primary-700 text-white' : 'bg-transparent']">
                  {{ displayOption(option) }}
                </li>
              </ComboboxOption>
            </ComboboxOptions>
          </transition>
        </VFollower>
      </Combobox>
    </VBinder>
  </template>

  <!-- display mode -->
  <span v-else class="text-sm">{{ displayValue(modelValue as T) }}</span>
</template>
