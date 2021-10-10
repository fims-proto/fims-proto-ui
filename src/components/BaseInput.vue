<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  props: {
    modelValue: String,
  }
})
</script>

<template>
  <input
    :value="modelValue"
    @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
  />
</template>

<style scoped>
</style>