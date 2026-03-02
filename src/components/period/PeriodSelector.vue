<script setup lang="ts">
import { computed, ref, toRefs, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-vue-next'

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
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

import type { Period } from '@/services/general-ledger'
import { usePeriodStore } from '@/store/period'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    sobId: string
    mode?: 'single' | 'range'
  }>(),
  { mode: 'single' },
)

const emit = defineEmits<{
  periodSelected: [period: Period]
  rangeSelected: [startPeriod: Period, endPeriod: Period]
}>()

const { t } = useI18n()
const periodStore = usePeriodStore()
const { allPeriods: periods, currentPeriod } = toRefs(periodStore.state)

// Single mode state
const selectedPeriodId = ref<string | undefined>(currentPeriod.value?.id)

// Range mode state
const startYear = ref<number | undefined>()
const startPeriod = ref<Period | undefined>()
const endYear = ref<number | undefined>()
const endPeriod = ref<Period | undefined>()

// Shared initialization
watch(
  currentPeriod,
  (newPeriod) => {
    if (!newPeriod) return

    // Single mode
    if (!selectedPeriodId.value) {
      selectedPeriodId.value = newPeriod.id
    }

    // Range mode
    if (!startPeriod.value) {
      startPeriod.value = newPeriod
      startYear.value = newPeriod.fiscalYear
    }
    if (!endPeriod.value) {
      endPeriod.value = newPeriod
      endYear.value = newPeriod.fiscalYear
    }
    if (props.mode === 'range' && startPeriod.value && endPeriod.value) {
      emit('rangeSelected', startPeriod.value, endPeriod.value)
    }
  },
  { immediate: true },
)

// Single mode helpers
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

// Range mode helpers
const minYear = computed(() =>
  periods.value.length ? Math.min(...periods.value.map((p) => p.fiscalYear)) : new Date().getFullYear(),
)
const maxYear = computed(() =>
  periods.value.length ? Math.max(...periods.value.map((p) => p.fiscalYear)) : new Date().getFullYear(),
)

const PERIOD_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

function findPeriod(year: number, num: number): Period | undefined {
  return periods.value.find((p) => p.fiscalYear === year && p.periodNumber === num)
}

function periodExists(year: number, num: number): boolean {
  return !!findPeriod(year, num)
}

function comparePeriods(a: Period, b: Period): number {
  if (a.fiscalYear !== b.fiscalYear) return a.fiscalYear - b.fiscalYear
  return a.periodNumber - b.periodNumber
}

function isInRange(year: number, num: number): boolean {
  if (!startPeriod.value || !endPeriod.value) return false
  const sp = startPeriod.value
  const ep = endPeriod.value
  const afterStart = year > sp.fiscalYear || (year === sp.fiscalYear && num >= sp.periodNumber)
  const beforeEnd = year < ep.fiscalYear || (year === ep.fiscalYear && num <= ep.periodNumber)
  return afterStart && beforeEnd
}

function isStartSelected(year: number, num: number): boolean {
  return !!startPeriod.value && startPeriod.value.fiscalYear === year && startPeriod.value.periodNumber === num
}

function isEndSelected(year: number, num: number): boolean {
  return !!endPeriod.value && endPeriod.value.fiscalYear === year && endPeriod.value.periodNumber === num
}

function handleStartSelect(year: number, num: number) {
  const period = findPeriod(year, num)
  if (!period) return
  startPeriod.value = period
  // Enforce end >= start
  if (endPeriod.value && comparePeriods(endPeriod.value, period) < 0) {
    endPeriod.value = period
    endYear.value = year
  }
  emitRange()
}

function handleEndSelect(year: number, num: number) {
  const period = findPeriod(year, num)
  if (!period) return
  endPeriod.value = period
  // Enforce start <= end
  if (startPeriod.value && comparePeriods(startPeriod.value, period) > 0) {
    startPeriod.value = period
    startYear.value = year
  }
  emitRange()
}

function emitRange() {
  if (startPeriod.value && endPeriod.value) {
    emit('rangeSelected', startPeriod.value, endPeriod.value)
  }
}

const rangeTriggerText = computed(() => {
  if (!startPeriod.value || !endPeriod.value) return t('period.periodUnselected')
  const startFull = t('period.periodText', [startPeriod.value.fiscalYear, startPeriod.value.periodNumber])
  const start = t('period.periodTextShort', [startPeriod.value.fiscalYear, startPeriod.value.periodNumber])
  const end = t('period.periodTextShort', [endPeriod.value.fiscalYear, endPeriod.value.periodNumber])
  if (start === end) return startFull
  return `${start} ${t('period.rangeSeparator')} ${end}`
})
</script>

<template>
  <!-- Single mode -->
  <template v-if="mode === 'single'">
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

  <!-- Range mode -->
  <template v-else>
    <Popover>
      <PopoverTrigger as-child>
        <Button variant="outline" class="relative h-9 min-w-48 justify-start font-normal">
          {{ rangeTriggerText }}
          <ChevronDown
            class="absolute top-1/2 right-3.5 size-4 -translate-y-1/2 opacity-50 select-none"
            aria-hidden="true"
          />
        </Button>
      </PopoverTrigger>

      <PopoverContent class="w-auto p-4" align="start">
        <div class="flex gap-6">
          <!-- Start period panel -->
          <div class="flex flex-col gap-2">
            <p class="text-muted-foreground text-xs font-medium">{{ $t('period.startPeriod') }}</p>

            <!-- Year navigation -->
            <div class="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!startYear || startYear <= minYear"
                @click="startYear = (startYear ?? 0) - 1"
              >
                <ChevronLeft class="size-4" />
              </Button>
              <span class="min-w-16 text-center text-sm font-medium"> {{ startYear }} {{ $t('common.year') }} </span>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!startYear || startYear >= maxYear"
                @click="startYear = (startYear ?? 0) + 1"
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>

            <!-- Period grid -->
            <div class="grid grid-cols-4 gap-1">
              <Button
                v-for="num in PERIOD_NUMBERS"
                :key="num"
                :variant="isStartSelected(startYear!, num) ? 'default' : 'ghost'"
                size="sm"
                class="h-8 w-10 p-0 text-xs"
                :class="
                  cn(
                    !isStartSelected(startYear!, num) &&
                      isInRange(startYear!, num) &&
                      'bg-accent text-accent-foreground',
                  )
                "
                :disabled="!periodExists(startYear!, num)"
                @click="handleStartSelect(startYear!, num)"
              >
                {{ num }}
              </Button>
            </div>
          </div>

          <!-- Divider -->
          <div class="bg-border w-px self-stretch" />

          <!-- End period panel -->
          <div class="flex flex-col gap-2">
            <p class="text-muted-foreground text-xs font-medium">{{ $t('period.endPeriod') }}</p>

            <!-- Year navigation -->
            <div class="flex items-center justify-between gap-2">
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!endYear || endYear <= minYear"
                @click="endYear = (endYear ?? 0) - 1"
              >
                <ChevronLeft class="size-4" />
              </Button>
              <span class="min-w-16 text-center text-sm font-medium"> {{ endYear }} {{ $t('common.year') }} </span>
              <Button
                variant="ghost"
                size="icon"
                class="h-7 w-7"
                :disabled="!endYear || endYear >= maxYear"
                @click="endYear = (endYear ?? 0) + 1"
              >
                <ChevronRight class="size-4" />
              </Button>
            </div>

            <!-- Period grid -->
            <div class="grid grid-cols-4 gap-1">
              <Button
                v-for="num in PERIOD_NUMBERS"
                :key="num"
                :variant="isEndSelected(endYear!, num) ? 'default' : 'ghost'"
                size="sm"
                class="h-8 w-10 p-0 text-xs"
                :class="
                  cn(!isEndSelected(endYear!, num) && isInRange(endYear!, num) && 'bg-accent text-accent-foreground')
                "
                :disabled="!periodExists(endYear!, num)"
                @click="handleEndSelect(endYear!, num)"
              >
                {{ num }}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  </template>
</template>
