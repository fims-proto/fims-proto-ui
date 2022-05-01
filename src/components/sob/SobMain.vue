<script lang="ts">
import { defineComponent, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useSobStore } from '../../store/sob';

export default defineComponent({
  setup() {
    const t = useI18n().t;
    const router = useRouter();
    const sobStore = useSobStore();
    const { sobs } = toRefs(sobStore.state);
    return {
      t,
      sobs,
      onCreate() {
        router.push({ name: "sobCreation" });
      }
    };
  }
})
</script>

<template>
  <base-page :subtitle="t('sob.subtitle')">
    <template #title>{{ t('sob.title') }}</template>
    <template #extra>
      <base-button type="primary" @click="onCreate">{{ t('action.create') }}</base-button>
    </template>
    <div v-if="sobs.length > 0" class="flex flex-wrap gap-8">
      <base-link
        :to="{ name: 'sobDetail', params: { sobId: sob.id } }"
        v-for="sob in sobs"
        :key="sob.id"
        class="group w-64 px-4 py-2 border border-neutral-300 rounded-md shadow-sm hover:shadow-lg"
      >
        <h3 class="group-hover:text-primary-700">{{ sob.name }}</h3>
        <p class="mt-2 text-sm text-neutral-500">{{ sob.description }}</p>
        <p class="mt-4">{{ sob.baseCurrency }}</p>
      </base-link>
    </div>
    <span v-else>empty</span>
  </base-page>
</template>
