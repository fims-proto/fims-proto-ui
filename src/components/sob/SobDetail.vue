<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sob, SobService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const sobDetail = ref<Sob>()

onMounted(async () => {
  sobDetail.value = await SobService.getSobById(props.sobId)
})
</script>

<template>
  <base-page :subtitle="sobDetail?.description">
    <template #title>{{ sobDetail?.name }}</template>
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
          <account-list :sob-id="sobId" />
        </base-tab-panel>
      </template>
    </base-tabs>
  </base-page>
</template>
