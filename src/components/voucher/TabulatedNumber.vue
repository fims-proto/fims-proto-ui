<script lang="ts">
import { computed, defineComponent, nextTick, ref, toRefs } from 'vue';
import TabulatedInput from './TabulatedInput.vue';

const NUMBER_UNITS = '亿千百十万千百十元角分'

export default defineComponent({
  props: {
    header: Boolean,
    disabled: Boolean,
    modelValue: Number,
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { header, modelValue } = toRefs(props)
    const editMode = ref<boolean>(false)
    const inputRef = ref<typeof TabulatedInput>()

    const content = computed(() => {
      const res = Array(11).fill('')
      let contentString

      if (header.value) {
        contentString = NUMBER_UNITS
      } else {
        const x100content = Math.round((modelValue.value ?? 0) * 100)
        contentString = (x100content ? x100content.toString() : '').padStart(11, ' ')
      }

      for (let i = 0; i < 11; i++) {
        res[i] = contentString[i]
      }

      return res
    })

    const onValueUpdate = (value: string) => {
      emit('update:modelValue', Number(value))
    }

    const changeEditMode = (value: boolean) => {
      editMode.value = value
      if (value) {
        // after edit mode is enbaled, focus on the input field at once
        nextTick(() => inputRef.value?.focus())
      }
    }

    return {
      content,
      editMode,
      inputRef,
      changeEditMode,
      onValueUpdate
    }
  }
})
</script>

<template>
  <!-- for display only -->
  <div class="h-full flex justify-between items-stretch" v-if="disabled">
    <div v-for="(c, i) in content" :key="`tabulated-number-${i}`"
      class="min-w-[1.5rem] w-[1.5rem] max-w-[1.5rem] flex-auto flex items-center justify-center border-r"
      :class="[i === 8 ? 'border-error-800' : (i + 1) % 3 === 0 ? 'border-neutral-400' : 'border-neutral-200']">
      {{ c }}
    </div>
  </div>
  <!-- for tabulated input -->
  <div class="h-full" v-else>
    <div tabindex="0" class="h-full flex justify-between items-stretch" v-show="!editMode"
      @focus="changeEditMode(true)">
      <div v-for="(c, i) in content" :key="`tabulated-number-${i}`"
        class="min-w-[1.5rem] w-[1.5rem] max-w-[1.5rem] flex-auto flex items-center justify-center border-r"
        :class="[i === 8 ? 'border-error-800' : (i + 1) % 3 === 0 ? 'border-neutral-400' : 'border-neutral-200']">
        {{ c }}
      </div>
    </div>
    <div v-show="editMode" class="p-[1px]">
      <tabulated-input ref="inputRef" html-type="number" :model-value="modelValue" @update:model-value="onValueUpdate"
        @blur="changeEditMode(false)" />
    </div>
  </div>
</template>