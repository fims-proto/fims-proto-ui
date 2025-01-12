<script setup lang="ts">
import { watch, ref, toRefs } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { injectContext } from './context'
import { PeriodService, VoucherService, type Period, type Voucher } from '@domain/general-ledger'
import type { Page } from '@domain/types'
import type { DataTablePageEvent } from 'primevue'
import { useSobStore } from '@store/sob'
import { FilterFactory } from '@domain/filter'

const props = defineProps<{
  sobId: string
  lite?: boolean
}>()

const { t, n, d } = useI18n()
const router = useRouter()
const { currentPeriod } = toRefs(useSobStore().state)

const vouchers = ref<Page<Voucher>>()
const selectedVoucher = ref<Voucher>()
const pageable = ref({ page: 1, size: 10 })
const periods = ref<Page<Period>>()
const selectedPeriod = ref<Period>()
const periodsPageable = ref({ page: 1, size: 99 })
const context = injectContext()
const factory = new FilterFactory<Voucher>()

if (context?.refreshList) {
  context.refreshList.value = load
}

watch(currentPeriod, defaultSelectedPeriod, { immediate: true })
watch([pageable, selectedPeriod], load, { immediate: true })
watch(periodsPageable.value, loadPeriods, { immediate: true })

function defaultSelectedPeriod() {
  if (!selectedPeriod.value && currentPeriod.value) {
    selectedPeriod.value = currentPeriod.value
  }
}

async function load() {
  if (!selectedPeriod.value) return
  vouchers.value = (
    await VoucherService.getVouchers(props.sobId, pageable.value, factory.eq('periodId', selectedPeriod.value.id ?? ''))
  ).data
}

async function loadPeriods() {
  periods.value = (await PeriodService.getPeriods(props.sobId, periodsPageable.value)).data
}

function onPage(page: DataTablePageEvent) {
  pageable.value.page = page.page + 1
}

function onSelect(selected?: Voucher) {
  if (!selected) return
  router.push({
    name: 'voucherDetail',
    params: {
      sobId: props.sobId,
      voucherId: selected.id,
    },
  })
}
</script>

<template>
  <div>
    <DataTable
      :value="vouchers?.content"
      v-model:selection="selectedVoucher"
      selection-mode="single"
      meta-key-selection
      data-key="id"
      lazy
      paginator
      :rows="pageable.size"
      :total-records="vouchers?.numberOfElements"
      @page="onPage"
      @update:selection="onSelect"
    >
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span>{{ t('voucher.listTitle', [vouchers?.numberOfElements ?? 0]) }}</span>
          <div class="flex gap-1">
            <Select
              v-model="selectedPeriod"
              :options="periods?.content"
              :option-label="(p) => t('period.periodText', { fiscalYear: p.fiscalYear, number: p.periodNumber })"
            />
            <Button as="router-link" :label="t('action.create')" :to="{ name: 'voucherNew' }" />
          </div>
        </div>
      </template>

      <Column :header="t('voucher.number')">
        <template #body="{ data }: { data: Voucher }">
          <span class="text-nowrap">{{ data.documentNumber }}</span>
        </template>
      </Column>

      <Column :header="t('voucher.summary')">
        <template #body="{ data }: { data: Voucher }">
          <span class="truncate">{{ data.headerText }}</span>
        </template>
      </Column>

      <Column v-if="!lite" :header="t('voucher.amount')">
        <template #body="{ data }: { data: Voucher }">
          <span>{{ n(data.debit, 'decimal') }}</span>
        </template>
      </Column>

      <Column v-if="!lite" :header="t('voucher.creator')">
        <template #body="{ data }: { data: Voucher }">
          <span>
            {{ t('user.fullname', { last: data.creator.traits.name?.last, first: data.creator.traits.name?.first }) }}
          </span>
        </template>
      </Column>

      <Column v-if="!lite" :header="t('voucher.transactionTime')" field="transactionTime">
        <template #body="{ data }: { data: Voucher }">
          <span>{{ d(data.transactionTime, 'short') }}</span>
        </template>
      </Column>

      <Column v-if="!lite" :header="t('common.status')">
        <template #body="{ data }: { data: Voucher }">
          <div class="flex gap-1">
            <Tag v-if="data.isAudited" severity="success" :value="t('voucher.isAudited')" />
            <Tag v-else severity="warn" :value="t('voucher.notAudited')" />
            <Tag v-if="data.isReviewed" severity="success" :value="t('voucher.isReviewed')" />
            <Tag v-else severity="warn" :value="t('voucher.notReviewed')" />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
