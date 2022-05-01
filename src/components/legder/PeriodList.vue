<script lang="ts">
import { computed, defineComponent, PropType, toRefs } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Period } from '../../domain';
import { useSobStore } from '../../store/sob';

export default defineComponent({
  props: {
    periods: {
      type: Array as PropType<Period[]> | undefined,
    }
  },
  setup() {
    const t = useI18n().t
    const route = useRoute()
    const router = useRouter()
    const sobStore = useSobStore()

    const { workingSob, currentPeriod } = toRefs(sobStore.state)
    const selectedPeriodId = computed(() => route.params['periodId'])

    const isOpenPeriod = (periodId: string) => {
      return periodId === currentPeriod.value?.id
    }

    const isSelectedPeriod = (periodId: string) => {
      return periodId === selectedPeriodId.value
    }

    const onPeriodSelected = (periodId: string) => {
      router.push({
        name: 'ledgerList',
        params: {
          sobId: workingSob.value?.id,
          periodId
        }
      })
    }

    const onCreatePeriod = () => { }

    return {
      t,
      isOpenPeriod,
      isSelectedPeriod,
      onPeriodSelected,
      onCreatePeriod
    }
  }
})
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