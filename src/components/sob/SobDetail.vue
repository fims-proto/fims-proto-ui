<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Sob, SobService } from '../../domain';

export default defineComponent({
  setup() {
    const t = useI18n().t
    const route = useRoute()
    const sobId = route.params['sobId']
    const sob = ref<Sob>()

    onMounted(async () => {
      sob.value = await SobService.getSobById(sobId as string)
    })

    return {
      t,
      sob
    }
  }
})
</script>

<template>
  <base-page :subtitle="sob?.description">
    <template #title>{{ sob?.name }}</template>
    <base-tabs>
      <template #tabs>
        <base-tab-item>{{ t('sob.detail.basic') }}</base-tab-item>
        <base-tab-item>{{ t('sob.detail.accounts') }}</base-tab-item>
      </template>
      <template #panels>
        <!-- basic tab -->
        <base-tab-panel>basic yet empty</base-tab-panel>
        <!-- accounts tab -->
        <base-tab-panel>
          <account-list />
        </base-tab-panel>
      </template>
    </base-tabs>
  </base-page>
</template>