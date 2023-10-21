<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, type Page, type User, type Voucher } from '../../domain'
import { type ColumnType } from '../reusable/table'

const props = defineProps<{
  sobId: string
}>()

const { t, d, n } = useI18n()
const router = useRouter()

const vouchers = ref<Page<Voucher>>()

const pageable = ref({ page: 1, size: 10 })

const columns: ColumnType[] = [
  {
    title: t('voucher.transactionTime'),
    key: 'transactionTime',
    width: 'md',
  },
  {
    title: t('voucher.number'),
    key: 'number',
    width: 'sm',
  },
  {
    title: t('voucher.summary'),
    path: 'headerText',
  },
  {
    title: t('voucher.creator'),
    key: 'creator',
    width: 'sm',
  },
  {
    title: t('voucher.auditor'),
    key: 'auditor',
    width: 'sm',
  },
  {
    title: t('voucher.reviewer'),
    key: 'reviewer',
    width: 'sm',
  },
  {
    title: t('voucher.amount'),
    key: 'amount',
    align: 'right',
    width: 'md',
  },
]

watch(
  [() => pageable.value.page, () => pageable.value.size],
  async () => {
    const { data } = await VoucherService.getVouchers(props.sobId, pageable.value)
    vouchers.value = data
  },
  { immediate: true },
)

const getUserName = (user: User) =>
  user && user.traits
    ? t('common.userName', {
        lastName: user.traits.name?.last,
        firstName: user.traits.name?.first,
      })
    : ''

const onCreate = () => {
  router.push({
    name: 'voucherCreation',
    params: {
      sobId: props.sobId,
    },
  })
}
</script>

<template>
  <BasePage>
    <template #title>{{ t('voucher.title') }}</template>
    <template #extra>
      <BaseButton category="primary" @click="onCreate">{{ t('action.create') }}</BaseButton>
    </template>

    <BaseTable
      :data-source="vouchers?.content ?? []"
      :columns="columns"
      :row-key="(v) => v.id"
      :page="{
        currentPage: vouchers?.pageNumber ?? 1,
        totalElement: vouchers?.numberOfElements ?? 0,
        pageSize: vouchers?.pageSize,
      }"
      @page="
        (target) => {
          pageable.page = target.page
          pageable.size = target.size ?? 10
        }
      "
    >
      <template #bodyCell="{ record, column }: { record: Voucher; column: ColumnType }">
        <template v-if="column.key === 'transactionTime'">
          <span>{{ d(record.transactionTime, 'date') }}</span>
        </template>

        <template v-else-if="column.key === 'number'">
          <BaseNavLink
            :to="{
              name: 'voucherDetail',
              params: {
                sobId: sobId,
                voucherId: record.id,
              },
            }"
          >
            {{ record.documentNumber }}
          </BaseNavLink>
        </template>

        <template v-else-if="column.key === 'creator'">
          <span>{{ getUserName(record.creator) }}</span>
        </template>

        <template v-else-if="column.key === 'auditor'">
          <span>{{ getUserName(record.auditor) }}</span>
        </template>

        <template v-else-if="column.key === 'reviewer'">
          <span>{{ getUserName(record.reviewer) }}</span>
        </template>

        <template v-else-if="column.key === 'amount'">
          <span>{{ n(record.debit, 'decimal') }}</span>
        </template>
      </template>
    </BaseTable>
  </BasePage>
</template>
