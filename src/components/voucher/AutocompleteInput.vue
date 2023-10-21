<script lang="ts">
export default defineComponent({ inheritAttrs: false })
</script>

<script setup lang="ts" generic="T">
import { defineComponent } from 'vue'
import { VBinder, VTarget, VFollower } from 'vueuc'

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
  (event: 'focus'): void
  (event: 'blur'): void
}>()
</script>

<template>
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
          class="appearance-none focus:z-10"
          :class="[$attrs.class ? $attrs.class : 'w-full border-none px-3 py-2']"
          @change="(e) => $emit('change', e.target.value)"
          @focus="$emit('focus')"
          @blur="$emit('blur')"
        />
      </VTarget>

      <VFollower :show="!disabled" placement="bottom-start">
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
