<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Ledger, LedgerService, Page } from '../../domain'
import { ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t, n } = useI18n()

const ledgers = ref<Page<Ledger>>()

const columns: ColumnType[] = [
  {
    title: t('ledger.accountNumber'),
    path: ['account', 'accountNumber'],
    width: 'md',
  },
  {
    title: t('ledger.accountTitle'),
    path: ['account', 'title'],
  },
  {
    title: t('ledger.openingBalance'),
    key: 'openingBalance',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.debit'),
    key: 'debit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.credit'),
    key: 'credit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.endingBalance'),
    key: 'endingBalance',
    align: 'right',
    width: 'sm',
  },
]

const pageable = ref({ page: 1, size: 10 })

const refresh = async () => {
  const { data } = await LedgerService.getAllLedgersInPeriod(props.sobId, props.periodId as string, pageable.value)
  ledgers.value = data
}

const calculateLedgerBalance = async () => {
  const { exception } = await LedgerService.calculateLedgersBalanceInPeriod(props.sobId, props.periodId)
  if (exception) {
    return
  }

  refresh()
}

watch([() => props.sobId, () => props.periodId, () => pageable.value.page, () => pageable.value.size], refresh, {
  immediate: true,
})

defineExpose({
  selectedPeriodId: props.periodId,
  refresh,
  calculateLedgerBalance,
})
</script>

<template>
  <BaseTable
    :data-source="ledgers?.content ?? []"
    :columns="columns"
    :page="{
      currentPage: ledgers?.page ?? 1,
      totalElement: ledgers?.numberOfElements ?? 0,
      pageSize: ledgers?.size,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  >
    <template #bodyCell="{ record, column }: { record: Ledger, column: ColumnType }">
      <template v-if="column.key === 'openingBalance'">
        <span>{{ n(record.openingBalance, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'debit'">
        <span>{{ n(record.debit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'credit'">
        <span>{{ n(record.credit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'endingBalance'">
        <span>{{ n(record.endingBalance, 'decimal') }}</span>
      </template>
    </template>
  </BaseTable>
</template>
