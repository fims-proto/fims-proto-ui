<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { AccountService, type Account, type Page } from '../../domain'
import { type ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
}>()

const { t } = useI18n()

const accounts = ref<Page<Account>>()

const columns: ColumnType[] = [
  {
    title: t('account.accountNumber'),
    key: 'accountNumber',
    width: 'md',
  },
  {
    title: t('ledger.title'),
    path: 'title',
  },
]

const pageable = ref({ page: 1, size: 10 })

watch(
  [() => pageable.value.page, () => pageable.value.size],
  async () => {
    const { data } = await AccountService.getAccounts(props.sobId, pageable.value)
    accounts.value = data
  },
  { immediate: true },
)
</script>

<template>
  <BaseTable
    :data-source="accounts?.content ?? []"
    :columns="columns"
    :row-key="(account) => account.id"
    :page="{
      currentPage: accounts?.pageNumber ?? 1,
      totalElement: accounts?.numberOfElements ?? 0,
      pageSize: accounts?.pageSize,
    }"
    @page="
      (target) => {
        pageable.page = target.page
        pageable.size = target.size ?? 10
      }
    "
  >
    <template #bodyCell="{ record, column }: { record: Account; column: ColumnType }">
      <template v-if="column.key === 'accountNumber'">
        <BaseNavLink
          :to="{
            name: 'accountDetail',
            params: {
              sobId: sobId,
              accountId: record.id,
            },
          }"
        >
          {{ record.accountNumber }}
        </BaseNavLink>
      </template>
    </template>
  </BaseTable>
</template>
