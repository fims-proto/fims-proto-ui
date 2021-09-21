<script setup lang="ts">
defineProps({
    modelValue: String,
})
</script>

<template>
    <input
        :value="modelValue"
        @input="$emit('update:modelValue', (<HTMLInputElement>$event.target).value)"
    />
</template>

<style scoped>
</style>