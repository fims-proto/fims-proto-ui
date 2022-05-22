<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { LedgerService, Period } from '../../domain'

export default defineComponent({
  props: {
    sobId: {
      type: String,
      required: true,
    },
  },
  setup(props) {
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

    return {
      t,
      periods,
    }
  },
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
