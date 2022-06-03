<script setup lang="ts">
import { toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { Period } from '../../domain'
import { useSobStore } from '../../store/sob'

const props = defineProps<{
  periods?: Period[]
  periodId?: string
}>()

const { t } = useI18n()
const router = useRouter()
const sobStore = useSobStore()

const { workingSob, currentPeriod } = toRefs(sobStore.state)

const isOpenPeriod = (periodId: string) => periodId === currentPeriod.value?.id
const isSelectedPeriod = (periodId: string) => periodId === props.periodId

const onPeriodSelected = (periodId: string) => {
  router.push({
    name: 'ledgerList',
    params: {
      sobId: workingSob.value?.id,
      periodId,
    },
  })
}

const onCreatePeriod = () => {
  // TODO
}
</script>

<template>
  <ol>
    <li v-for="period in periods" :key="period.id" @click="onPeriodSelected(period.id)">
      {{ `${period.financialYear} ${t('common.year')} ${period.number} ${t('common.month')}` }}
    </li>
    <li v-if="!periods?.length">
      <base-button @click="onCreatePeriod">{{ t('ledger.createPeriod') }}</base-button>
    </li>
  </ol>
</template>
