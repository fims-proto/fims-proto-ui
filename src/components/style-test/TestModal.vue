<script setup lang="ts">
import { ref } from 'vue'

const showModal1 = ref(false)
const showModal2 = ref(false)
</script>

<template>
  <div class="conatiner">
    <div class="flex gap-4">
      <BaseButton @click="showModal1 = true">Open modal</BaseButton>
      <BaseButton @click="showModal2 = true">Open modal with title</BaseButton>
    </div>

    <div v-for="i in 99" :key="i">Lorem ipsum dolor sit amet, vidisse vituperata {{ i }}</div>

    <BaseModal v-model:show="showModal1">
      <div class="w-96 flex flex-col gap-4">
        <div>content</div>
        <BaseButton @click="showModal1 = false">Close</BaseButton>
      </div>
    </BaseModal>

    <BaseModal v-model:show="showModal2" title="标题">
      <div class="w-96 flex flex-col gap-4">
        <div>content</div>
        <BaseButton @click="showModal1 = false">Close</BaseButton>
      </div>
    </BaseModal>
  </div>
</template>
