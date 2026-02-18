<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useEventBus } from '@vueuse/core'

import { PageFrame } from '@/components/common/page'
import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/common/data-table'

import { columns } from './columns'
import { SobService, type Sob } from '@/services/sob'
import type { Page } from '@/services/types'
import { SOB_CHANGED } from '@/services/event'

const router = useRouter()
const bus = useEventBus(SOB_CHANGED)

const sobs = ref<Sob[]>([])
const page = ref<Page<Sob>>()
const pageable = ref({ page: 1, size: 50 })
const isLoading = ref(false)

// Watch for pagination changes
watch(pageable.value, () => load(), { immediate: true })

// Listen for SOB changes
bus.on(() => load(true))

async function load(refresh = false) {
  if (refresh) {
    sobs.value = []
    if (pageable.value.page !== 1) {
      pageable.value.page = 1
      return // Watcher will trigger load again
    }
  }

  isLoading.value = true
  try {
    const { data } = await SobService.searchSobs(pageable.value)

    if (data) {
      page.value = data
      sobs.value = sobs.value.concat(data.content ?? [])
    }
  } finally {
    isLoading.value = false
  }
}

function handleLoadMore() {
  pageable.value.page++
}

function handleRowClick(row: Sob) {
  router.push({
    name: 'sobDetail',
    params: {
      sobId: row.id,
    },
  })
}

function handleCreate() {
  router.push({
    name: 'sobNew',
  })
}
</script>

<template>
  <PageFrame :title="$t('sob.listTitle', [page?.numberOfElements ?? 0])">
    <template #end>
      <Button @click="handleCreate">{{ $t('action.create') }}</Button>
    </template>

    <DataTable
      :columns="columns"
      :data="sobs"
      :row-count="page?.numberOfElements ?? 0"
      :has-more="sobs.length < (page?.numberOfElements ?? 0)"
      :is-loading="isLoading"
      :on-row-click="handleRowClick"
      @load-more="handleLoadMore"
    />
  </PageFrame>
</template>
