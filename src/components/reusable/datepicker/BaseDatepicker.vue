<script setup lang="ts">
import { ref, computed, type PropType } from 'vue'
import { VBinder, VFollower, VTarget } from 'vueuc'

const props = defineProps({
  modelValue: Date,
  placement: {
    type: String as PropType<'bottom-start' | 'bottom-end'>,
    default: 'bottom-start',
  },
})

const emit = defineEmits<{
  (event: 'update:modelValue', value: Date): void
}>()

const show = ref(false)

const formattedInputDate = computed(() => {
  if (!props.modelValue) {
    return ''
  }
  const year = props.modelValue.getFullYear()
  const month = (props.modelValue.getMonth() + 1).toString().padStart(2, '0')
  const date = props.modelValue.getDate().toString().padStart(2, '0')
  return `${year}-${month}-${date}`
})

const onValueUpdated = (value: string | number | Date) => {
  emit('update:modelValue', new Date(value))
  show.value = false
}
</script>

<template>
  <div>
    <VBinder>
      <VTarget>
        <BaseInput
          html-type="date"
          :hide-label="true"
          :model-value="formattedInputDate"
          autocomplete="off"
          @focus="show = true"
          @update:model-value="onValueUpdated"
        />
      </VTarget>

      <VFollower :show="show" :placement="placement">
        <transition
          :appear="show"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 -translate-y-2 opacity-0"
        >
          <BaseInlineDatepicker v-show="show" :model-value="modelValue" @update:model-value="onValueUpdated" />
        </transition>
      </VFollower>
    </VBinder>
  </div>
</template>
