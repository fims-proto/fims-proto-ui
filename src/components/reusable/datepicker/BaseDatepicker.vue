<script lang="ts">
import { computed, defineComponent, PropType, ref, toRefs } from 'vue'
import { VBinder, VFollower, VTarget } from 'vueuc'

export default defineComponent({
  components: { VBinder, VTarget, VFollower },
  props: {
    modelValue: Date,
    placement: {
      type: String as PropType<'bottom-start' | 'bottom-end'>,
      default: 'bottom-start',
    },
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { modelValue } = toRefs(props)
    const show = ref(false)

    const formattedInputDate = computed(() => {
      if (!modelValue.value) {
        return ''
      }
      const year = modelValue.value.getFullYear()
      const month = (modelValue.value.getMonth() + 1).toString().padStart(2, '0')
      const date = modelValue.value.getDate().toString().padStart(2, '0')
      return `${year}-${month}-${date}`
    })

    const open = () => (show.value = true)
    const close = () => (show.value = false)
    const onValueUpdated = (value: string) => {
      emit('update:modelValue', new Date(value))
      close()
    }

    return {
      show,
      formattedInputDate,
      open,
      close,
      onValueUpdated,
    }
  },
})
</script>

<template>
  <div>
    <v-binder>
      <v-target>
        <base-input
          type="date"
          :hide-label="true"
          :model-value="formattedInputDate"
          autocomplete="off"
          @focus="open"
          @update:model-value="onValueUpdated"
        />
      </v-target>

      <v-follower :show="show" :placement="placement">
        <transition
          :appear="show"
          enter-active-class="transition duration-100 ease-out"
          enter-from-class="scale-95 -translate-y-2 opacity-0"
          enter-to-class="scale-100 translate-y-0 opacity-100"
          leave-active-class="transition duration-75 ease-in"
          leave-from-class="scale-100 translate-y-0 opacity-100"
          leave-to-class="scale-95 -translate-y-2 opacity-0"
        >
          <base-inline-datepicker v-show="show" :model-value="modelValue" @update:model-value="onValueUpdated" />
        </transition>
      </v-follower>
    </v-binder>
  </div>
</template>
