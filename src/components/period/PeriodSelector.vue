<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LoadButton } from '@/components/common/list'
import { Badge } from '@/components/ui/badge'

import { PeriodService } from '@/services/general-ledger/period'
import type { Period } from '@/services/general-ledger'
import type { Page } from '@/services/types'
import { useSobStore } from '@/store/sob'

const props = defineProps<{
  sobId: string
}>()

const emit = defineEmits<{
  periodChange: [periodId: string]
  periodSelected: [period: Period]
}>()

const { t } = useI18n()
const sobStore = useSobStore()

const periods = ref<Period[]>([])
const page = ref<Page<Period>>()
const pageable = ref({ page: 1, size: 20 })
const selectedPeriodId = ref<string>()

const currentPeriodId = computed(() => sobStore.state.currentPeriod?.id)

watch(
  pageable.value,
  async () => {
    page.value = (await PeriodService.getPeriods(props.sobId, pageable.value)).data
    periods.value = periods.value.concat(page.value?.content ?? [])

    // Auto-select current period on first load
    if (pageable.value.page === 1 && currentPeriodId.value && !selectedPeriodId.value) {
      selectedPeriodId.value = currentPeriodId.value
      emit('periodChange', currentPeriodId.value)

      // Also emit the full period object
      const period = periods.value.find((p) => p.id === currentPeriodId.value)
      if (period) {
        emit('periodSelected', period)
      }
    }
  },
  { immediate: true },
)

function getPeriodText(period: Period): string {
  return t('period.periodText', [period.fiscalYear, period.periodNumber])
}

function handlePeriodChange(periodId: unknown) {
  if (!periodId || typeof periodId !== 'string') return
  selectedPeriodId.value = periodId
  emit('periodChange', periodId)

  // Also emit the full period object
  const period = periods.value.find((p) => p.id === periodId)
  if (period) {
    emit('periodSelected', period)
  }
}

function loadMore() {
  pageable.value.page++
}
</script>

<template>
  <Select :model-value="selectedPeriodId" @update:model-value="handlePeriodChange">
    <SelectTrigger class="w-50">
      <SelectValue :placeholder="$t('ledger.noPeriodMessage')" />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>{{ $t('period.title') }}</SelectLabel>
        <SelectItem v-for="period in periods" :key="period.id" :value="period.id">
          <div class="flex items-center gap-2">
            <span>{{ getPeriodText(period) }}</span>
            <Badge v-if="period.id === currentPeriodId" variant="default" class="text-xs">
              {{ $t('period.current') }}
            </Badge>
            <Badge v-if="period.isClosed" variant="secondary" class="text-xs">
              {{ $t('period.closed') }}
            </Badge>
          </div>
        </SelectItem>
        <LoadButton
          v-if="page && periods.length < page.numberOfElements"
          :loaded="periods.length"
          :total="page.numberOfElements"
          @click="loadMore"
        />
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
