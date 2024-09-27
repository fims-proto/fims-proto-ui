<script setup lang="ts">
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { LedgerService, type Ledger, type Page } from '../../domain'
import type { DataTablePageEvent } from 'primevue/datatable'

const props = defineProps<{
  sobId: string
  periodId: string
}>()

const { t, n } = useI18n()

const ledgers = ref<Page<Ledger>>()
const pageable = ref({ page: 1, size: 10 })
const loading = ref(false)

const load = async (refresh?: boolean) => {
  loading.value = true
  if (refresh) {
    pageable.value.page = 1
  }
  ledgers.value = (await LedgerService.getLedgersInPeriod(props.sobId, props.periodId, pageable.value)).data
  loading.value = false
}

watch(
  () => props.periodId,
  () => load(true),
  { immediate: true },
)
watch(pageable.value, () => load())

const onPage = async (page: DataTablePageEvent) => (pageable.value.page = page.page + 1)
</script>

<template>
  <div>
    <DataTable
      :value="ledgers?.content"
      data-key="id"
      lazy
      paginator
      :loading="loading"
      :rows="pageable.size"
      :total-records="ledgers?.numberOfElements"
      @page="onPage"
    >
      <ColumnGroup type="header">
        <Row>
          <Column :header="t('account.accountNumber')" :rowspan="2" />
          <Column :header="t('account.accountTitle')" :rowspan="2" />
          <Column :header="t('ledger.openingBalance')" :colspan="2" />
          <Column :header="t('ledger.interimBalance')" :colspan="2" />
          <Column :header="t('ledger.endingBalance')" :colspan="2" />
        </Row>
        <Row>
          <!-- opening -->
          <Column :header="t('ledger.debit')" />
          <Column :header="t('ledger.credit')" />
          <!-- interim -->
          <Column :header="t('ledger.debit')" />
          <Column :header="t('ledger.credit')" />
          <!-- ending -->
          <Column :header="t('ledger.debit')" />
          <Column :header="t('ledger.credit')" />
        </Row>
      </ColumnGroup>

      <Column field="account.accountNumber" />
      <Column field="account.title" />
      <Column field="openingDebitBalance">
        <template #body="{ data }">
          {{ n(data.openingDebitBalance, 'decimal') }}
        </template>
      </Column>
      <Column field="openingCreditBalance">
        <template #body="{ data }">
          {{ n(data.openingCreditBalance, 'decimal') }}
        </template>
      </Column>
      <Column field="periodDebit">
        <template #body="{ data }">
          {{ n(data.periodDebit, 'decimal') }}
        </template>
      </Column>
      <Column field="periodCredit">
        <template #body="{ data }">
          {{ n(data.periodCredit, 'decimal') }}
        </template>
      </Column>
      <Column field="endingDebitBalance">
        <template #body="{ data }">
          {{ n(data.endingDebitBalance, 'decimal') }}
        </template>
      </Column>
      <Column field="endingCreditBalance">
        <template #body="{ data }">
          {{ n(data.endingCreditBalance, 'decimal') }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>
