<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { type Page, type Period } from '../../domain'
import { useSobStore } from '../../store/sob'

const props = defineProps<{
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
  <BaseList :default-item="props.periods?.content.find((p) => p.id === props.periodId)" clickable hoverable>
    <BaseListItem
      v-for="period in periods?.content ?? []"
      :key="period.id"
      :value="period"
      @click="onPeriodSelected(period.id)"
    >
      {{ t('period.periodText', { fiscalYear: period.fiscalYear, number: period.periodNumber }) }}
    </BaseListItem>

    <BaseButton v-if="!periods?.content.length">{{ t('period.createPeriod') }}</BaseButton>
  </BaseList>
</template>
