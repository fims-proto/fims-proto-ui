<script lang="ts">
import { NButton, NCard, NDescriptions, NDescriptionsItem, NEmpty, NIcon, NSpace } from 'naive-ui';
import { AddCircleOutline } from '@vicons/ionicons5'
import { defineComponent, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePage from './BasePage.vue'
import { useRouter } from 'vue-router';
import { useSobStore } from '../store/sob';

export default defineComponent({
  components: { NSpace, NCard, NDescriptions, NDescriptionsItem, NIcon, NButton, NEmpty, AddCircleOutline, BasePage },
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
      <n-button @click="onCreate">{{ t('action.create') }}</n-button>
    </template>
    <n-space inline>
      <template v-if="sobs.length > 0">
        <n-card v-for="sob in sobs" :key="sob.id" :title="sob.name" hoverable>
          <n-descriptions :column="1">
            <n-descriptions-item :label="t('sob.description')">{{ sob.description }}</n-descriptions-item>
            <n-descriptions-item :label="t('sob.baseCurrency')">{{ sob.baseCurrency }}</n-descriptions-item>
          </n-descriptions>
        </n-card>
      </template>
      <n-empty v-else :description="t('common.emptyContent')" />
    </n-space>
  </base-page>
</template>

<style scoped>
.n-card {
  width: 15rem;
  height: 14rem;
}
</style>