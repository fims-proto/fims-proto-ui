<script setup lang="ts">
import { computed, ref } from 'vue'
import { CalendarIcon } from 'lucide-vue-next'
import { CalendarDate, type DateValue } from '@internationalized/date'
import { useI18n } from 'vue-i18n'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const props = withDefaults(
  defineProps<{
    modelValue?: string // ISO 8601 date string (YYYY-MM-DD)
    disabled?: boolean
    placeholder?: string
  }>(),
  {
    modelValue: undefined,
    disabled: false,
    placeholder: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | undefined]
}>()

const { d } = useI18n()
const open = ref(false)

// Convert Date to DateValue for Calendar component
const calendarValue = computed({
  get: () => {
    if (!props.modelValue) return undefined
    // Parse YYYY-MM-DD string
    const [year, month, day] = props.modelValue.split('-').map(Number)
    return new CalendarDate(year!, month!, day!)
  },
  set: (value: DateValue | undefined) => {
    if (!value) {
      emit('update:modelValue', undefined)
      return
    }
    // Convert DateValue to YYYY-MM-DD string
    const year = value.year
    const month = String(value.month).padStart(2, '0')
    const day = String(value.day).padStart(2, '0')
    emit('update:modelValue', `${year}-${month}-${day}`)
    // Close popover after selection
    open.value = false
  },
})

const displayValue = computed(() => {
  if (!props.modelValue) return props.placeholder || ''
  // Parse and format the date string for display
  const date = new Date(props.modelValue)
  return d(date, 'short')
})
</script>

<template>
  <Popover v-model:open="open">
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :class="cn('w-full justify-start text-left font-normal', !modelValue && 'text-muted-foreground')"
        :disabled="disabled"
      >
        <CalendarIcon class="mr-2 h-4 w-4" />
        {{ displayValue }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        v-model="calendarValue"
        layout="month-and-year"
        :placeholder="calendarValue"
        :min-value="new CalendarDate(2000, 1, 1)"
        :max-value="new CalendarDate(2100, 12, 31)"
        :locale="'zh-CN'"
      />
    </PopoverContent>
  </Popover>
</template>
