<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { Period, LedgerService, Page } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const periods = ref<Page<Period>>()

onMounted(async () => {
  const { data } = await LedgerService.getAllPeriods(props.sobId)
  periods.value = data

  if (route.name === 'ledgerMain') {
    const openPeriod = periods.value?.content.find((period) => !period.isClosed)
    if (openPeriod) {
      router.replace({
        name: 'ledgerList',
        params: {
          sobId: props.sobId,
          periodId: openPeriod.id,
        },
      })
    }
  }
})

onBeforeRouteUpdate(async (to, from) => {
  if (from.name === 'ledgerList' && to.name === 'ledgerMain') {
    return false
  }
})
</script>

<template>
  <BasePage>
    <template #title>{{ t('ledger.title') }}</template>
    <div class="flex gap-4">
      <div class="flex-none w-80">
        <PeriodList :periods="periods" />
      </div>
      <div class="flex-auto">
        <RouterView />
      </div>
    </div>
  </BasePage>
</template>
