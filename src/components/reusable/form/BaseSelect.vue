<script setup lang="ts">
import { ref } from 'vue'
import type { SelectOption } from '.'
import { VBinder, VTarget, VFollower } from 'vueuc'
import { injectForm } from './context'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = withDefaults(
  defineProps<{
    options: SelectOption[]
    modelValue: string | string[]
    multiple?: boolean
  }>(),
  {
    multiple: false,
  },
)

const emit = defineEmits<{
  (event: 'update:modelValue', value: string | string[]): void
}>()

const { t } = useI18n()

const Form = injectForm()
const editMode = computed(() => Form?.edit.value ?? true)

const defaultOptions = props.options.filter((option) => {
  if (Array.isArray(props.modelValue)) {
    return props.modelValue.includes(option.value)
  } else {
    return props.modelValue === option.value
  }
})
const selectedOptions = ref<SelectOption | SelectOption[] | undefined>(
  // if not mulitple select, use single object instance instead of array
  !props.multiple && defaultOptions.length > 0 ? defaultOptions[0] : defaultOptions,
)

const onChanged = (option: SelectOption | SelectOption[]) => {
  selectedOptions.value = option
  if (Array.isArray(option)) {
    emit(
      'update:modelValue',
      option.map((each) => each.value),
    )
  } else {
    emit('update:modelValue', option.value)
  }
}
</script>

<template>
  <Listbox
    v-if="editMode"
    v-slot="{ open }"
    :model-value="selectedOptions"
    :multiple="multiple"
    @update:model-value="onChanged"
  >
    <VBinder>
      <VTarget>
        <ListboxButton
          class="flex justify-between align-text-bottom w-full px-3 py-2 bg-white text-sm rounded-md border border-neutral-300 hover:border-primary-400"
        >
          <span class="truncate">{{
            Array.isArray(selectedOptions)
              ? selectedOptions.map((each) => each.label).join(', ')
              : selectedOptions?.label
          }}</span>
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
                :key="option.value"
                v-slot="{ active, selected }"
                :value="option"
                :disabled="option.disabled"
                as="template"
              >
                <li
                  class="flex gap-1 align-baseline px-3 py-2 text-sm"
                  :class="{ 'bg-primary-700 text-white cursor-pointer': active }"
                >
                  <span>{{ option.label }}</span>
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
  <span v-else class="text-sm">{{
    Array.isArray(selectedOptions) ? selectedOptions.map((each) => each.label).join(', ') : selectedOptions?.label
  }}</span>
</template>
