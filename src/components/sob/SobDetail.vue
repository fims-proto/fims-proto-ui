<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Sob, SobService } from '../../domain'

export default defineComponent({
  props: {
    sobId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
    const { t } = useI18n()
    const sobDetail = ref<Sob>()

    onMounted(async () => {
      sobDetail.value = await SobService.getSobById(props.sobId)
    })

    return {
      t,
      sobDetail,
    }
  },
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
