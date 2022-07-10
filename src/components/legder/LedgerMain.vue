<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { Period, LedgerService, Page } from '../../domain'
import LedgerList from './LedgerList.vue'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const ledgerListRef = ref<InstanceType<typeof LedgerList>>()

const periods = ref<Page<Period>>()
const selectedPeriodId = computed(() => route.params['periodId'] as string)

onMounted(async () => {
  const { data } = await LedgerService.getAllPeriods(props.sobId)
  periods.value = data

  if (!route.params['periodId']) {
    const openPeriod = periods.value?.content.find((period) => !period.isClosed)
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

const onRefreshLedgers = () => {
  ledgerListRef.value?.calculateLedgerBalance()
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('ledger.title') }}</template>

    <template #extra>
      <BaseButton v-if="selectedPeriodId" @click="onRefreshLedgers">{{ t('ledger.refresh') }}</BaseButton>
    </template>

    <div class="flex gap-4">
      <div class="flex-none w-80">
        <PeriodList :periods="periods" />
      </div>
      <div class="flex-auto">
        <LedgerList v-if="selectedPeriodId" ref="ledgerListRef" :sob-id="sobId" :period-id="selectedPeriodId" />
      </div>
    </div>
  </BasePage>
</template>
