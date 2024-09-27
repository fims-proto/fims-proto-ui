<script lang="ts">
import Button from 'primevue/button'
import { defineComponent } from 'vue'

export default defineComponent({
  // eslint-disable-next-line vue/no-reserved-component-names
  components: { Button },
  props: {
    ...Button.props,
    message: {
      type: String,
      default: undefined,
    },
  },
  emits: ['accept', 'reject'],
  methods: {
    onClick(event: Event) {
      this.$confirm.require({
        target: event.currentTarget as HTMLElement,
        message: this.$props.message ? this.$props.message : this.$t('common.confirmationText'),
        icon: 'pi pi-exclamation-triangle',
        rejectProps: {
          label: this.$t('common.cancel'),
          severity: 'secondary',
          outlined: true,
        },
        acceptProps: {
          label: this.$t('common.confirm'),
        },
        accept: () => this.$emit('accept'),
        reject: () => this.$emit('reject'),
      })
    },
  },
})
</script>

<template>
  <Button v-bind="$props" @click="onClick"><slot></slot></Button>
</template>
