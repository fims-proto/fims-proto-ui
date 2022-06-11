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
  <BasePage :subtitle="sobDetail?.description">
    <template #title>{{ sobDetail?.name }}</template>
    <BaseTabs>
      <template #tabs>
        <BaseTabItem>{{ t('sob.detail.basic') }}</BaseTabItem>
        <BaseTabItem>{{ t('sob.detail.accounts') }}</BaseTabItem>
      </template>
      <template #panels>
        <!-- basic tab -->
        <BaseTabPanel>basic yet empty</BaseTabPanel>
        <!-- accounts tab -->
        <BaseTabPanel>
          <AccountList :sob-id="sobId" />
        </BaseTabPanel>
      </template>
    </BaseTabs>
  </BasePage>
</template>
