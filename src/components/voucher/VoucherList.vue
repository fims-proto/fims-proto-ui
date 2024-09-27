<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VoucherService, type Page, type Voucher } from '../../domain'
import type { DataTableRowClickEvent } from 'primevue/datatable'
import { injectContext } from './context'

const props = defineProps<{
  sobId: string
}>()

const { t, n, d } = useI18n()
const router = useRouter()

const vouchers = ref<Page<Voucher>>()
const selectedVoucher = ref<Voucher>()
const pageable = ref({ page: 1, size: 10 })
const context = injectContext()

const refresh = async () => {
  vouchers.value = (await VoucherService.getVouchers(props.sobId, pageable.value)).data
}

if (context?.refreshList) {
  context.refreshList.value = refresh
}

onMounted(refresh)

const onRowClick = (event: DataTableRowClickEvent) => {
  router.push({
    name: 'voucherDetail',
    params: {
      sobId: props.sobId,
      voucherId: event.data.id,
    },
  })
}
</script>

<template>
  <div>
    <DataTable
      v-model:selection="selectedVoucher"
      :value="vouchers?.content"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      @row-click="onRowClick"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span>{{ t('voucher.listTitle', [vouchers?.numberOfElements ?? 0]) }}</span>
          <Button as="router-link" :label="t('action.create')" :to="{ name: 'voucherNew' }" />
        </div>
      </template>

      <Column :header="t('voucher.number')" field="documentNumber" />
      <Column :header="t('voucher.summary')" field="headerText" />
      <Column :header="t('voucher.amount')" field="debit">
        <template #body="{ data }">
          <span>{{ n(data.debit, 'decimal') }}</span>
        </template>
      </Column>
      <Column :header="t('voucher.transactionTime')" field="transactionTime">
        <template #body="{ data }">
          <span>{{ d(data.transactionTime, 'short') }}</span>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
