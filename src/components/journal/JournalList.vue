<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'
import PeriodSelector from '@/components/period/PeriodSelector.vue'

import { fullColumns, compactColumns } from './columns'
import { JournalService, type Period, type Journal } from '@/services/general-ledger'
import type { Page } from '@/services/types'
import { FilterFactory } from '@/services/filter'
import { JOURNAL_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const route = useRoute()
const bus = useEventBus(JOURNAL_CHANGED)

const journals = ref<Journal[]>([])
const page = ref<Page<Journal>>()
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

// Listen for journal changes
bus.on(() => load(true))

async function load(refresh = false) {
  if (refresh) {
    journals.value = []
    if (pageable.value.page !== 1) {
      pageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  // Don't load if no period selected
  if (!selectedPeriodId.value) {
    journals.value = []
    page.value = undefined
    return
  }

  isLoading.value = true
  try {
    const filterFactory = new FilterFactory<Journal>()
    const periodFilter = filterFactory.eq('periodId', selectedPeriodId.value)

    const { data } = await JournalService.getJournals(props.sobId, pageable.value, periodFilter)

    if (data) {
      page.value = data
      journals.value = journals.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleLoadMore() {
  pageable.value.page++
}

function handleRowClick(row: Journal) {
  router.push({
    name: 'journalDetail',
    params: {
      sobId: props.sobId,
      journalId: row.id,
    },
  })
}

function handlePeriodChange(period: Period) {
  selectedPeriodId.value = period.id
}

function handleCreate() {
  router.push({
    name: 'journalNew',
    params: {
      sobId: props.sobId,
    },
  })
}
</script>

<template>
  <PageFrame :title="$t('journal.listTitle', [page?.numberOfElements ?? 0])">
    <template #end>
      <PeriodSelector :sob-id="sobId" @period-selected="handlePeriodChange" />
      <Button @click="handleCreate">{{ $t('action.create') }}</Button>
    </template>

    <DataTable
      :columns="columns"
      :data="journals"
      :row-count="page?.numberOfElements ?? 0"
      :has-more="journals.length < (page?.numberOfElements ?? 0)"
      :is-loading="isLoading"
      :on-row-click="handleRowClick"
      @load-more="handleLoadMore"
    />
  </PageFrame>
</template>
