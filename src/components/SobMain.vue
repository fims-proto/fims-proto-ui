<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSobStore } from '../store/sob';

export default defineComponent({
  setup() {
    const router = useRouter()
    const t = useI18n().t

    const sobStore = useSobStore()
    let { sobs } = toRefs(sobStore.state)

    return {
      sobs,
      t,
      onCreate() {
        router.push({ name: 'sobCreation' })
      }
    }
  }
})
</script>

<template>
  <base-page :subtitle="t('sob.subtitle')">
    <template #title>{{ t('sob.title') }}</template>
    <template #extra>
      <a-button @click="onCreate">{{ t('action.create') }}</a-button>
    </template>
    <a-space>
      <template v-if="sobs.length > 0">
        <a-card v-for="sob in sobs" :key="sob.id" :title="sob.name">
          <p>{{ sob.description }}</p>
          <p>{{ sob.baseCurrency }}</p>
        </a-card>
      </template>
      <a-empty v-else />
    </a-space>
  </base-page>
</template>
