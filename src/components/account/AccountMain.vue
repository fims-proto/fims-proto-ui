<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { Period, Page, PeriodService } from '../../domain'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

const periods = ref<Page<Period>>()
const selectedPeriodId = computed(() => route.params['periodId'] as string)

onMounted(async () => {
  const { data } = await PeriodService.getPeriods(props.sobId)
  periods.value = data

  if (!route.params['periodId']) {
    const openPeriod = periods.value?.content.find((period) => period.isCurrent)
    if (openPeriod) {
      router.replace({
        name: 'accountMain',
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
  if (to.name === 'accountMain' && !to.params['periodId']) {
    return false
  }
})
</script>

<template>
  <BasePage>
    <template #title>{{ t('account.title') }}</template>

    <div class="flex gap-4">
      <div class="flex-none w-80">
        <PeriodList :periods="periods" :period-id="selectedPeriodId" />
      </div>
      <div class="flex-auto">
        <LedgerList v-if="selectedPeriodId" :sob-id="sobId" :period-id="selectedPeriodId" />
      </div>
    </div>
  </BasePage>
</template>
