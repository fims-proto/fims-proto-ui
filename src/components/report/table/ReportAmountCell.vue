<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  amount: number | null | undefined
}>()

const { n } = useI18n()
</script>

<template>
  <td class="px-2 text-right tabular-nums">
    {{ props.amount ? n(props.amount, 'decimal') : '' }}
  </td>
</template>
