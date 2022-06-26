<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, Voucher, Page, User } from '../../domain'
import { ColumnType } from '../reusable/table'
import BaseLink from '../reusable/link/BaseLink.vue'

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
    path: ['lineItems', '0', 'summary'],
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
    const { data } = await VoucherService.getAllVouchers(props.sobId, pageable.value)
    vouchers.value = data
  },
  { immediate: true }
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
      <BaseButton type="primary" @click="onCreate">{{ t('action.create') }}</BaseButton>
    </template>

    <BaseTable
      :data-source="vouchers?.content ?? []"
      :columns="columns"
      :page="{
        currentPage: vouchers?.page ?? 1,
        totalElement: vouchers?.numberOfElements ?? 0,
        pageSize: vouchers?.size,
      }"
      @page="
        (target) => {
          pageable.page = target.page
          pageable.size = target.size ?? 10
        }
      "
    >
      <template #bodyCell="{ record, column }: { record: Voucher, index: number, column: ColumnType }">
        <span v-if="column.key === 'transactionTime'">{{ d(record.transactionTime, 'date') }}</span>
        <BaseLink
          v-else-if="column.key === 'number'"
          :to="{
            name: 'voucherDetail',
            params: {
              sobId: sobId,
              voucherId: record.id,
            },
          }"
        >
          {{ record.number }}
        </BaseLink>
        <span v-else-if="column.key === 'creator'">{{ getUserName(record.creator) }}</span>
        <span v-else-if="column.key === 'auditor'">{{ getUserName(record.auditor) }}</span>
        <span v-else-if="column.key === 'reviewer'">{{ getUserName(record.reviewer) }}</span>
        <span v-else-if="column.key === 'amount'">{{ n(record.debit, 'decimal') }}</span>
      </template>
    </BaseTable>
  </BasePage>
</template>
