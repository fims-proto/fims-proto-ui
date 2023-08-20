<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { SobService, type Sob } from '../../domain'
import { useRouter } from 'vue-router'

const props = defineProps<{
  sobId: string
  view?: string
}>()

const { t } = useI18n()
const router = useRouter()
const sobDetail = ref<Sob>()
const tabIndex = ref(Number(props.view))

watch(
  () => props.sobId,
  async () => {
    if (props.sobId) {
      const { data } = await SobService.getSobById(props.sobId)
      sobDetail.value = data
    }
  },
  { immediate: true },
)

const tabChanged = (index: number) => {
  router.push({ name: 'sobDetail', params: { view: index } })
  tabIndex.value = index
}
</script>

<template>
  <BasePage :subtitle="sobDetail?.description">
    <template #title>{{ sobDetail?.name }}</template>

    <BaseTabs :defualt-index="Number(view)" @changed="tabChanged">
      <template #tabs>
        <BaseTabItem>{{ t('sob.detail.basic') }}</BaseTabItem>
        <BaseTabItem>{{ t('sob.detail.accounts') }}</BaseTabItem>
        <BaseTabItem>{{ t('sob.detail.auxiliaries') }}</BaseTabItem>
      </template>
      <template #panels>
        <!-- basic tab -->
        <BaseTabPanel>basic yet empty</BaseTabPanel>

        <!-- accounts tab -->
        <BaseTabPanel>
          <AccountList :sob-id="sobId" />
        </BaseTabPanel>

        <!-- auxiliary tab -->
        <BaseTabPanel>
          <AuxiliaryList :sob-id="sobId" />
        </BaseTabPanel>
      </template>
    </BaseTabs>
  </BasePage>
</template>
