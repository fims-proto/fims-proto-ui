<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { fullColumns, compactColumns } from './columns'
import { VoucherService, type Period, type Voucher } from '@/services/general-ledger'
import type { Page } from '@/services/types'
import { FilterFactory } from '@/services/filter'
import { VOUCHER_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const route = useRoute()
const bus = useEventBus(VOUCHER_CHANGED)

const vouchers = ref<Voucher[]>([])
const page = ref<Page<Voucher>>()
const pageable = ref({ page: 1, size: 50 })
const isLoading = ref(false)
const selectedPeriodId = ref<string>()

// Adaptive columns based on whether detail view is open
const hasDetailView = computed(() => route.matched.some((r) => r.components?.main))
const columns = computed(() => (hasDetailView.value ? compactColumns : fullColumns))

// Watch for pagination changes
watch(pageable.value, () => load(), { immediate: true })

// Watch for period changes - reset and reload
watch(selectedPeriodId, () => load(true))

// Listen for voucher changes
bus.on(() => load(true))

async function load(refresh = false) {
  if (refresh) {
    vouchers.value = []
    if (pageable.value.page !== 1) {
      pageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  // Don't load if no period selected
  if (!selectedPeriodId.value) {
    vouchers.value = []
    page.value = undefined
    return
  }

  isLoading.value = true
  try {
    const filterFactory = new FilterFactory<Voucher>()
    const periodFilter = filterFactory.eq('periodId', selectedPeriodId.value)

    const { data } = await VoucherService.getVouchers(props.sobId, pageable.value, periodFilter)

    if (data) {
      page.value = data
      vouchers.value = vouchers.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleLoadMore() {
  pageable.value.page++
}

function handleRowClick(row: Voucher) {
  router.push({
    name: 'voucherDetail',
    params: {
      sobId: props.sobId,
      voucherId: row.id,
    },
  })
}

function handlePeriodChange(period: Period) {
  selectedPeriodId.value = period.id
}

function handleCreate() {
  router.push({
    name: 'voucherNew',
    params: {
      sobId: props.sobId,
    },
  })
}
</script>

<template>
  <PageFrame :title="$t('voucher.listTitle', [page?.numberOfElements ?? 0])">
    <template #end>
      <PeriodSelector :sob-id="sobId" @period-selected="handlePeriodChange" />
      <Button @click="handleCreate">{{ $t('action.create') }}</Button>
    </template>

    <DataTable
      :columns="columns"
      :data="vouchers"
      :row-count="page?.numberOfElements ?? 0"
      :has-more="vouchers.length < (page?.numberOfElements ?? 0)"
      :is-loading="isLoading"
      :on-row-click="handleRowClick"
      @load-more="handleLoadMore"
    />
  </PageFrame>
</template>
