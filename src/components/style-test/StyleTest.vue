<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  view?: string
}>()

const router = useRouter()

const onSelect = (view: string) => {
  router.push({ name: 'styleTest', params: { view } })
}
</script>

<!-- style test page for Tailwindcss -->
<template>
  <div class="flex flex-col gap-8 p-4">
    <div class="flex gap-4">
      <BaseLink @click="onSelect('button')">Buttons</BaseLink>
      <BaseLink @click="onSelect('form')">Form</BaseLink>
      <BaseLink @click="onSelect('page')">Page</BaseLink>
      <BaseLink @click="onSelect('table')">Table</BaseLink>
      <BaseLink @click="onSelect('modal')">Modal</BaseLink>
      <BaseLink @click="onSelect('others')">Others</BaseLink>
    </div>

    <div>
      <TestButton v-if="view === 'button'" />
      <TestForm v-if="view === 'form'" />
      <TestPage v-if="view === 'page'" />
      <TestTable v-if="view === 'table'" />
      <TestModal v-if="view === 'modal'" />
      <OtherElements v-if="view === 'others'" />
    </div>
  </div>
</template>
