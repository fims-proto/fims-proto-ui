<script setup lang="ts">
import { ref, toRefs } from 'vue'
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
import { Badge } from '@/components/ui/badge'

import type { Period } from '@/services/general-ledger'
import { usePeriodStore } from '@/store/period'

defineProps<{
  sobId: string
}>()

const emit = defineEmits<{
  periodSelected: [period: Period]
}>()

const { t } = useI18n()
const periodStore = usePeriodStore()
const { allPeriods: periods, currentPeriod } = toRefs(periodStore.state)

// Local selected state managed by component
const selectedPeriodId = ref<string | undefined>()

function getPeriodText(period: Period): string {
  return t('period.periodText', [period.fiscalYear, period.periodNumber])
}

function handlePeriodChange(periodId: unknown) {
  if (!periodId || typeof periodId !== 'string') return
  selectedPeriodId.value = periodId

  const period = periods.value.find((p) => p.id === periodId)
  if (period) {
    emit('periodSelected', period)
  }
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
            <Badge v-if="period.id === currentPeriod?.id" variant="default" class="text-xs">
              {{ $t('period.current') }}
            </Badge>
            <Badge v-if="period.isClosed" variant="secondary" class="text-xs">
              {{ $t('period.closed') }}
            </Badge>
          </div>
        </SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
</template>
