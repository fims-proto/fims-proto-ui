<script setup lang="ts">
import { h, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, Voucher, Page } from '../../domain'
import { ColumnType } from '../reusable/table'
import BaseLink from '../reusable/link/BaseLink.vue'

const props = defineProps<{
  sobId: string
}>()

const { t, d, n } = useI18n()
const router = useRouter()

const vouchers = ref<Page<Voucher>>()

const pageable = ref({ page: 1, size: 10 })

const columns: ColumnType<Voucher>[] = [
  {
    title: t('voucher.transactionTime'),
    path: 'transactionTime',
    width: 'md',
    render: (value: Date) => d(value, 'date'),
  },
  {
    title: t('voucher.number'),
    path: 'number',
    width: 'sm',
    render: (_, { number, id }) =>
      h(
        BaseLink,
        {
          to: {
            name: 'voucherDetail',
            params: {
              sobId: props.sobId,
              voucherId: id,
            },
          },
        },
        () => number
      ),
  },
  {
    title: t('voucher.summary'),
    path: ['lineItems', '0', 'summary'],
  },
  {
    title: t('voucher.creator'),
    key: 'creator',
    width: 'sm',
    render: (_, { creator: { traits } }) =>
      traits ? t('common.userName', { lastName: traits.name?.last, firstName: traits.name?.first }) : '',
  },
  {
    title: t('voucher.auditor'),
    key: 'auditor',
    width: 'sm',
    render: (_, { auditor: { traits } }) =>
      traits ? t('common.userName', { lastName: traits.name?.last, firstName: traits.name?.first }) : '',
  },
  {
    title: t('voucher.reviewer'),
    key: 'reviewer',
    width: 'sm',
    render: (_, { reviewer: { traits } }) =>
      traits ? t('common.userName', { lastName: traits.name?.last, firstName: traits.name?.first }) : '',
  },
  {
    title: t('voucher.amount'),
    path: 'debit',
    align: 'right',
    width: 'md',
    render: (value: number) => n(value, 'decimal'),
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
    />
  </BasePage>
</template>
