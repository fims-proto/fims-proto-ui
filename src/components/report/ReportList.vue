<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { DataTable } from '@/components/common/data-table'

import { columns } from './columns'
import { ReportService, type Report, CLASS_OPTIONS, TEMPLATE_OPTIONS } from '@/services/report'
import type { Page } from '@/services/types'
import { REPORT_CHANGED } from '@/services/event'

const props = defineProps<{
  sobId: string
}>()

const router = useRouter()
const bus = useEventBus(REPORT_CHANGED)

const reports = ref<Report[]>([])
const page = ref<Page<Report>>()
const pageable = ref({ page: 1, size: 50 })
const isLoading = ref(false)

// Listen for report changes
bus.on(() => load(true))

// Watch for pagination changes
watch(pageable.value, () => load(), { immediate: true })

async function load(refresh = false) {
  if (refresh) {
    reports.value = []
    if (pageable.value.page !== 1) {
      pageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  isLoading.value = true
  try {
    const { data } = await ReportService.getReports(props.sobId, pageable.value)

    if (data) {
      page.value = data
      reports.value = reports.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleLoadMore() {
  pageable.value.page++
}

function handleRowClick(row: Report) {
  router.push({
    name: 'reportDetail',
    params: {
      sobId: props.sobId,
      reportId: row.id,
    },
  })
}
</script>

<template>
  <PageFrame :title="$t('report.subjectName')">
    <DataTable
      :columns="columns"
      :data="reports"
      :row-count="page?.numberOfElements ?? 0"
      :total-count="page?.numberOfElements ?? 0"
      :is-loading="isLoading"
      :faceted-filters="[
        {
          name: 'class',
          title: $t('report.class'),
          options: CLASS_OPTIONS.map((c) => ({ label: $t(`report.classEnum.${c}`), value: c })),
        },
        {
          name: 'template',
          title: $t('report.template'),
          options: TEMPLATE_OPTIONS.map((t) => ({ label: $t(t ? 'common.yes' : 'common.no'), value: String(t) })),
        },
      ]"
      @row-click="handleRowClick"
      @load-more="handleLoadMore"
    />
  </PageFrame>
</template>
