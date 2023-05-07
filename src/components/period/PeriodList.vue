<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Page, Period } from '../../domain'
import { useSobStore } from '../../store/sob'

defineProps<{
  periods?: Page<Period>
  periodId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()

const { workingSob } = toRefs(sobStore.state)

const onPeriodSelected = (periodId: string) => {
  router.push({
    name: 'ledgerMain',
    params: {
      sobId: workingSob.value?.id,
      periodId,
    },
  })
}
</script>

<template>
  <BaseList clickable hoverable>
    <BaseListItem
      v-for="period in periods?.content ?? []"
      :key="period.id"
      :active="periodId === period.id"
      @click="onPeriodSelected(period.id)"
    >
      {{ t('period.periodText', { fiscalYear: period.fiscalYear, number: period.periodNumber }) }}
    </BaseListItem>
    <BaseListItem v-if="!periods?.content.length">
      <BaseButton>{{ t('period.createPeriod') }}</BaseButton>
    </BaseListItem>
  </BaseList>
</template>
