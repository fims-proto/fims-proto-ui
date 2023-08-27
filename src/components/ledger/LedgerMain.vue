<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRouter } from 'vue-router'
import { PeriodService, type Page, type Period } from '../../domain'

const props = defineProps<{
  sobId: string
  periodId?: string
}>()

const { t } = useI18n()
const router = useRouter()

const periods = ref<Page<Period>>()

onMounted(async () => {
  const { data } = await PeriodService.getPeriods(props.sobId)
  periods.value = data

  if (!props.periodId) {
    const openPeriod = periods.value?.content.find((period) => period.isCurrent)
    if (openPeriod) {
      router.replace({
        name: 'ledgerMain',
        params: {
          sobId: props.sobId,
          periodId: openPeriod.id,
        },
      })
      console.log('display default open period')
    }
  }
})

onBeforeRouteUpdate(async (to) => {
  if (to.name === 'ledgerMain' && !to.params['periodId']) {
    return false
  }
})
</script>

<template>
  <BasePage>
    <template #title>{{ t('ledger.title') }}</template>

    <BaseSplitPage detail-size="L">
      <template #main>
        <PeriodList :periods="periods" :period-id="periodId" />
      </template>

      <template #detail>
        <LedgerList v-if="periodId" :sob-id="sobId" :period-id="periodId" />
      </template>
    </BaseSplitPage>
  </BasePage>
</template>
