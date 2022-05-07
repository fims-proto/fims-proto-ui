<script lang="ts">
import { computed, defineComponent, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  props: {
    modelValue: Date
  },
  emits: ['update:modelValue'],
  setup(props, { emit }) {
    const { t } = useI18n()
    const tmpDate = ref(props.modelValue ?? new Date())
    const level = ref(0) // 0 day, 1 month, 2 year

    const yearList = ref<number[]>(Array(12).fill(0))
    const monthList = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
    const dateList = ref<{ date: number, previousMonth: boolean, nextMonth: boolean }[]>()

    const displayedYearRangeStartYear = ref<number>(getNearestDecadeStartYear(tmpDate.value.getFullYear()))
    const displayedYear = ref(tmpDate.value.getFullYear())
    const displayedMonth = ref(tmpDate.value.getMonth())

    const calculateYearList = () => {
      for (let i = 0; i < 12; i++) {
        yearList.value[i] = displayedYearRangeStartYear.value - 1 + i
      }
    }

    const calculateDateList = () => {
      const currentMonth = []
      const previousMonth = []
      const nextMonth = []

      const firstDayInCurrentMonth = new Date(displayedYear.value, displayedMonth.value, 1)
      const lastDayInCurrentMonth = new Date(displayedYear.value, displayedMonth.value + 1, 0)
      const lastDayInPreviousMonth = new Date(displayedYear.value, displayedMonth.value, 0)

      const daysInMonth = lastDayInCurrentMonth.getDate()
      for (let i = 0; i < daysInMonth; i++) {
        currentMonth.push({
          date: i + 1,
          previousMonth: false,
          nextMonth: false
        })
      }

      const padStartDays = firstDayInCurrentMonth.getDay()
      for (let i = 0; i < padStartDays; i++) {
        previousMonth.push({
          date: lastDayInPreviousMonth.getDate() - padStartDays + i + 1,
          previousMonth: true,
          nextMonth: false
        })
      }

      // make sure date list has 42 dates (6 lines)
      const padEndDays = 42 - previousMonth.length - currentMonth.length
      for (let i = 0; i < padEndDays; i++) {
        nextMonth.push({
          date: i + 1,
          previousMonth: false,
          nextMonth: true
        })
      }

      dateList.value = [...previousMonth, ...currentMonth, ...nextMonth]
    }

    const title = computed(() => {
      if (level.value === 0) {
        // for date, display month
        return `${displayedYear.value} ${t(`base.datepicker.month[${displayedMonth.value}]`)}`
      }
      if (level.value === 1) {
        // for month, display yaer
        return displayedYear.value
      }
      if (level.value === 2) {
        // for year, display start year - end year
        return `${yearList.value[1]} - ${yearList.value[10]}`
      }
      return ''
    })

    const onUpLevel = () => level.value = level.value === 2 ? 2 : ++level.value
    const downLevel = () => level.value = level.value === 0 ? 0 : --level.value

    const moveDisplayedYearRange = (val: -10 | 10) => displayedYearRangeStartYear.value = displayedYearRangeStartYear.value + val
    const moveDisplayedYear = (val: -1 | 1) => {
      displayedYear.value = displayedYear.value + val
      if (displayedYear.value < displayedYearRangeStartYear.value || displayedYear.value > displayedYearRangeStartYear.value + 10) {
        moveDisplayedYearRange(val * 10 as -10 | 10)
      }
    }
    const moveDisplayedMonth = (val: -1 | 1) => {
      displayedMonth.value = displayedMonth.value + val;
      if (displayedMonth.value < 0 || displayedMonth.value > 11) {
        displayedMonth.value = (12 + displayedMonth.value) % 12;
        moveDisplayedYear(val)
      }
    }

    const onNav = (val: -1 | 1) => {
      switch (level.value) {
        case 0:
          // nav on month
          moveDisplayedMonth(val)
          break
        case 1:
          moveDisplayedYear(val)
          break
        case 2:
          moveDisplayedYearRange(val * 10 as -10 | 10)
          break;
        default:
          break;
      }
    }

    const onYearSelected = (year: number) => {
      displayedYear.value = year
      displayedYearRangeStartYear.value = getNearestDecadeStartYear(year)
      downLevel()
    }
    const onMonthSelected = (month: number) => {
      displayedMonth.value = month
      downLevel()
    }
    const onDateSelectd = (date: { date: number, previousMonth: boolean, nextMonth: boolean }) => {
      if (date.previousMonth) {
        moveDisplayedMonth(-1)
      }
      if (date.nextMonth) {
        moveDisplayedMonth(1)
      }
      tmpDate.value.setTime(new Date(displayedYear.value, displayedMonth.value, date.date).getTime())
      emit('update:modelValue', tmpDate.value.toString())
    }

    const onTodaySelected = () => {
      const today = new Date()
      displayedYearRangeStartYear.value = getNearestDecadeStartYear(today.getFullYear())
      displayedYear.value = today.getFullYear()
      displayedMonth.value = today.getMonth()
      tmpDate.value.setTime(today.getTime())
      level.value = 0
      emit('update:modelValue', tmpDate.value.toString())
    }

    onMounted(() => {
      calculateYearList()
      calculateDateList()
    })

    watch([displayedYearRangeStartYear, displayedYear, displayedMonth], () => {
      calculateYearList()
      calculateDateList()
    })

    watch(() => props.modelValue, () => {
      if (props.modelValue) {
        displayedYearRangeStartYear.value = getNearestDecadeStartYear(props.modelValue.getFullYear())
        displayedYear.value = props.modelValue.getFullYear()
        displayedMonth.value = props.modelValue.getMonth()
      }
    })

    return {
      t,
      level,
      title,
      yearList,
      monthList,
      dateList,
      onUpLevel,
      onNav,
      onYearSelected,
      onMonthSelected,
      onDateSelectd,
      onTodaySelected
    }
  }
})

function getNearestDecadeStartYear(year: number) {
  return year - (year % 10)
}
</script>

<template>
  <div
    class="w-80 h-80 bg-white my-2 flex flex-col shadow-lg rounded-md ring-1 ring-black ring-opacity-5 divide-y divide-neutral-300">
    <div class="flex flex-row justify-between items-center px-4 py-2">
      <base-button text class="w-4" @click="onNav(-1)">
        <chevron-left-solid-icon />
      </base-button>
      <base-button text @click="onUpLevel">{{ title }}</base-button>
      <base-button text class="w-4" @click="onNav(1)">
        <chevron-right-solid-icon />
      </base-button>
    </div>

    <div class="h-full grid grid-cols-4 gap-2 px-4 py-2 content-around justify-items-stretch"
      :class="[level === 0 ? 'grid-cols-7' : 'grid-cols-4']">
      <!-- year list -->
      <template v-if="level === 2">
        <button v-for="year in yearList" :key="`datepicker-year-${year}`" @click="onYearSelected(year)"
          class="py-2 rounded-md hover:bg-black hover:bg-opacity-5">
          {{ year }}
        </button>
      </template>

      <!-- month list -->
      <template v-if="level === 1">
        <button v-for="month in monthList" :key="`datepicker-month-${month}`" @click="onMonthSelected(month)"
          class="py-2 rounded-md hover:bg-black hover:bg-opacity-5">
          {{ t(`base.datepicker.month[${month}]`) }}
        </button>
      </template>

      <!-- date list -->
      <template v-if="level === 0">
        <div v-for="weekday in 7" :key="`datepicker-weekday-${weekday}`" class="text-center">
          {{ t(`base.datepicker.weekday[${weekday - 1}]`) }}
        </div>
        <button v-for="(date, i) in dateList" :key="`datepicker-date-${i}`" @click="onDateSelectd(date)"
          class="text-neutral-800 rounded-md hover:bg-black hover:bg-opacity-5"
          :class="{ 'text-opacity-40': date.previousMonth || date.nextMonth }">
          {{ date.date }}
        </button>
      </template>
    </div>
    <div class="px-4 py-2">
      <base-button text class="w-full" @click="onTodaySelected">{{ t('base.datepicker.today') }}</base-button>
    </div>
  </div>
</template>