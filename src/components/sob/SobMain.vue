<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useSobStore } from '../../store/sob'

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()
const { sobs } = toRefs(sobStore.state)

const onCreate = () => router.push({ name: 'sobCreation' })
</script>

<template>
  <BasePage :subtitle="t('sob.subtitle')">
    <template #title>{{ t('sob.title') }}</template>
    <template #extra>
      <BaseButton category="primary" @click="onCreate">{{ t('action.create') }}</BaseButton>
    </template>
    <div v-if="sobs.length > 0" class="flex flex-wrap gap-8">
      <BaseNavLink
        v-for="sob in sobs"
        :key="sob.id"
        :to="{ name: 'sobDetail', params: { sobId: sob.id } }"
        class="group w-64 px-4 py-2 border border-neutral-300 rounded-md shadow-sm hover:shadow-lg"
      >
        <h3 class="group-hover:text-primary-700">{{ sob.name }}</h3>
        <p class="mt-2 text-sm text-neutral-500">{{ sob.description }}</p>
        <p class="mt-4">{{ sob.baseCurrency }}</p>
      </BaseNavLink>
    </div>
    <span v-else>empty</span>
  </BasePage>
</template>
