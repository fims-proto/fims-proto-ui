<script lang="ts">
import { defineComponent, ref, watchEffect } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { Ledger, LedgerService } from '../../domain';

export default defineComponent({
  setup() {
    const { t, n } = useI18n()
    const route = useRoute()

    const ledgers = ref<Ledger[]>([])

    watchEffect(async () => {
      const { sobId, periodId } = route.params
      if (sobId && periodId) {
        ledgers.value = await LedgerService.getAllLedgersInPeriod(sobId as string, periodId as string)
      }
    })

    return {
      t,
      n,
      ledgers
    }
  }
})
</script>

<template>
  <table class="w-full border border-collapse border-neutral-200 shadow-sm">
    <tr class="bg-neutral-100">
      <th class="border-b border-neutral-200 py-2 px-4 text-left">{{ t('ledger.accountNumber') }}</th>
      <th class="border-b border-neutral-200 py-2 px-4 text-left">{{ t('ledger.accountTitle') }}</th>
      <th class="border-b border-neutral-200 py-2 px-4 text-right">{{ t('ledger.openingBalance') }}</th>
      <th class="border-b border-neutral-200 py-2 px-4 text-right">{{ t('ledger.debit') }}</th>
      <th class="border-b border-neutral-200 py-2 px-4 text-right">{{ t('ledger.credit') }}</th>
      <th class="border-b border-neutral-200 py-2 px-4 text-right">{{ t('ledger.endingBalance') }}</th>
    </tr>
    <tr v-for="ledger in ledgers" :key="ledger.id">
      <td class="border-t border-neutral-200 py-2 px-4 text-left">{{ ledger.account.accountNumber }}</td>
      <td class="border-t border-neutral-200 py-2 px-4 text-left">{{ ledger.account.title }}</td>
      <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(Number(ledger.openingBalance), 'dec') }}</td>
      <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(Number(ledger.debit), 'dec') }}</td>
      <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(Number(ledger.credit), 'dec') }}</td>
      <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(Number(ledger.endingBalance), 'dec') }}</td>
    </tr>
  </table>
</template>