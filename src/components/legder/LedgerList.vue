<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ledger, LedgerService } from '../../domain'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t, n } = useI18n()

const ledgers = ref<Ledger[]>([])

watch(
  [() => props.sobId, () => props.periodId],
  async () => {
    ledgers.value = await LedgerService.getAllLedgersInPeriod(props.sobId, props.periodId as string)
  },
  { immediate: true }
)
</script>

<template>
  <div class="w-full overflow-x-auto border border-neutral-300 shadow-lg rounded-md">
    <table class="w-full">
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
        <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(ledger.openingBalance, 'decimal') }}</td>
        <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(ledger.debit, 'decimal') }}</td>
        <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(ledger.credit, 'decimal') }}</td>
        <td class="border-t border-neutral-200 py-2 px-4 text-right">{{ n(ledger.endingBalance, 'decimal') }}</td>
      </tr>
    </table>
  </div>
</template>
