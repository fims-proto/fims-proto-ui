<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { Account, AccountService, Page } from '../../domain'
import { ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t, n } = useI18n()

const accounts = ref<Page<Account>>()

const columns: ColumnType[] = [
  {
    title: t('account.accountNumber'),
    path: ['account', 'accountNumber'],
    width: 'md',
  },
  {
    title: t('account.accountTitle'),
    path: ['account', 'title'],
  },
  {
    title: t('account.openingBalance'),
    key: 'openingBalance',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('account.periodDebit'),
    key: 'debit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('account.periodCredit'),
    key: 'credit',
    align: 'right',
    width: 'sm',
  },
  {
    title: t('account.endingBalance'),
    key: 'endingBalance',
    align: 'right',
    width: 'sm',
  },
]

const pageable = ref({ page: 1, size: 10 })

const refresh = async () => {
  const { data } = await AccountService.getAccountsInPeriod(props.sobId, props.periodId as string, pageable.value)
  accounts.value = data
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
    :data-source="accounts?.content ?? []"
    :columns="columns"
    :page="{
      currentPage: accounts?.page ?? 1,
      totalElement: accounts?.numberOfElements ?? 0,
      pageSize: accounts?.size,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  >
    <template #bodyCell="{ record, column }: { record: Account, column: ColumnType }">
      <template v-if="column.key === 'openingBalance'">
        <span>{{ n(record.openingBalance, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'debit'">
        <span>{{ n(record.periodDebit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'credit'">
        <span>{{ n(record.periodCredit, 'decimal') }}</span>
      </template>

      <template v-else-if="column.key === 'endingBalance'">
        <span>{{ n(record.endingBalance, 'decimal') }}</span>
      </template>
    </template>
  </BaseTable>
</template>
