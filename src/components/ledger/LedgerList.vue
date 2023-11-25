<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LedgerService, type Ledger, type Page } from '../../domain'
import { type ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t, n } = useI18n()

const ledgers = ref<Page<Ledger>>()

const columns: ColumnType[] = [
  {
    title: t('account.accountNumber'),
    path: ['account', 'accountNumber'],
  },
  {
    title: t('account.accountTitle'),
    path: ['account', 'title'],
  },
  {
    title: t('ledger.openingDebitBalance'),
    key: 'openingDebitBalance',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.openingCreditBalance'),
    key: 'openingCreditBalance',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.periodDebit'),
    key: 'periodDebit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.periodCredit'),
    key: 'periodCredit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.endingDebitBalance'),
    key: 'endingDebitBalance',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('ledger.endingCreditBalance'),
    key: 'endingCreditBalance',
    align: 'right',
    width: 'sm',
  },
]

const pageable = ref({ page: 1, size: 10 })

const refresh = async () => {
  const { data } = await LedgerService.getLedgersInPeriod(props.sobId, props.periodId as string, pageable.value)
  ledgers.value = data
}

watch([() => props.sobId, () => props.periodId, () => pageable.value.page, () => pageable.value.size], refresh, {
  immediate: true,
})

defineExpose({
  selectedPeriodId: props.periodId,
})
</script>

<template>
  <BaseTable
    :data-source="ledgers?.content ?? []"
    :columns="columns"
    :row-key="(l) => l.id"
    :page="{
      currentPage: ledgers?.pageNumber ?? 1,
      totalElement: ledgers?.numberOfElements ?? 0,
      pageSize: ledgers?.pageSize,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  >
    <template #bodyCell="{ record, column }: { record: Ledger; column: ColumnType }">
      <template v-if="column.key === 'openingDebitBalance'">
        <span>{{ n(record.openingDebitBalance, 'decimal') }}</span>
      </template>

      <template v-if="column.key === 'openingCreditBalance'">
        <span>{{ n(record.openingCreditBalance, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'periodDebit'">
        <span>{{ n(record.periodDebit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'periodCredit'">
        <span>{{ n(record.periodCredit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'endingDebitBalance'">
        <span>{{ n(record.endingDebitBalance, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'endingCreditBalance'">
        <span>{{ n(record.endingCreditBalance, 'decimal') }}</span>
      </template>
    </template>
  </BaseTable>
</template>
