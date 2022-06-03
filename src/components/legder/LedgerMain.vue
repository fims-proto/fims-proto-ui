<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter, onBeforeRouteUpdate } from 'vue-router'
import { Period, LedgerService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const periods = ref<Period[]>()

onMounted(async () => {
  periods.value = await LedgerService.getAllPeriods(props.sobId)

  if (route.name === 'ledgerMain') {
    const openPeriod = periods.value?.find((period) => !period.isClosed)
    if (openPeriod) {
      console.log('display default period')
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
  <base-page>
    <template #title>{{ t('ledger.title') }}</template>
    <div class="flex gap-4">
      <div class="flex-none w-80">
        <period-list :periods="periods" />
      </div>
      <div class="flex-auto">
        <router-view />
      </div>
    </div>
  </base-page>
</template>
