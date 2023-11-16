<script setup lang="ts" generic="T extends object">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { type ColumnType, type PageType } from '.'
import { type Pageable } from '../../../domain'

const props = defineProps<{
  title?: string
  dataSource: T[]
  columns: ColumnType[]
  rowKey: (row: T) => string
  page?: PageType
  freeSearch?: boolean
  rowClickable?: boolean
}>()

const emit = defineEmits<{
  (event: 'page', pageable: Pageable): void
  (event: 'search', query: string): void
  (event: 'row-click', row: T, i: number): void
}>()

const { t } = useI18n()

const freeSearchQuery = ref('')

const getColumnKey = (col: ColumnType) => {
  if (col.key) {
    return col.key
  }
  if (col.path) {
    if (typeof col.path === 'string') {
      return col.path
    }
    return (col.path as string[]).join(':')
  }
  throw 'cannot determine column key'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getColumnData = (record: any, col: ColumnType) => {
  let value

  if (col.path) {
    if (typeof col.path === 'string') {
      value = record[col.path]
    } else {
      value = record
      for (const path of col.path as string[]) {
        value = value[path]
      }
    }
  }

  return value
}

const onSearch = () => {
  emit('search', freeSearchQuery.value)
}

const onRowClick = (row: T, i: number) => {
  props.rowClickable && emit('row-click', row, i)
}
</script>

<template>
  <div class="flex flex-col overflow-clip border border-neutral-300 shadow-lg rounded-md">
    <!-- toolbar -->
    <div
      v-if="title || freeSearch || $slots['actions']"
      class="w-full py-2 px-4 flex gap-2 justify-end bg-neutral-100 border-b-2 border-neutral-300"
    >
      <!-- table title -->
      <div v-if="title" class="flex-auto font-bold text-lg">{{ title }}</div>

      <!-- free search -->
      <div v-if="freeSearch" class="relative">
        <input
          v-model="freeSearchQuery"
          class="appearance-none w-80 py-1 pr-8 bg-transparent border-0 placeholder-neutral-500 focus:outline-none focus:ring focus:ring-primary-600/50"
          :placeholder="t('common.freeSearch')"
          @keyup.enter="onSearch()"
        />
        <button
          class="absolute inset-y-0 right-0 flex items-center px-2 text-neutral-400 focus:outline-none focus:ring focus:ring-primary-600/50 hover:text-neutral-700"
          @click="onSearch()"
        >
          <MagnifyingGlassMiniIcon class="w-4 h-4" aria-hidden="true" />
        </button>
      </div>

      <!-- action buttons -->
      <div class="flex gap-1">
        <slot name="actions" />
      </div>
    </div>

    <!-- table -->
    <div class="w-full">
      <table class="w-full table-fixed">
        <tr class="border-b-2 border-neutral-200">
          <th
            v-for="column in columns"
            :key="getColumnKey(column)"
            :class="[
              'border-b border-neutral-200 py-2 px-4',
              { 'text-left': column.align === 'left' || !column.align },
              { 'text-right': column.align === 'right' },
              { 'text-center': column.align === 'center' },
              { 'w-32': column.width === 'sm' },
              { 'w-64': column.width === 'md' },
              { 'w-96': column.width === 'lg' },
            ]"
          >
            {{ column.title }}
          </th>
        </tr>
        <tr
          v-for="(data, i) in dataSource"
          :key="rowKey(data)"
          class="rounded-md hover:bg-neutral-200/50 hover:shadow-inner"
          :class="{ 'cursor-pointer active:bg-neutral-200': rowClickable }"
          :tabindex="rowClickable ? 0 : -1"
          @click="onRowClick(data, i)"
        >
          <td
            v-for="column in columns"
            :key="`${getColumnKey(column)}-${rowKey(data)}`"
            :class="[
              'border-t border-neutral-200 py-2 px-4',
              { 'text-left': column.align === 'left' || !column.align },
              { 'text-right': column.align === 'right' },
              { 'text-center': column.align === 'center' },
            ]"
          >
            <slot name="bodyCell" :record="data" :index="i" :column="column">
              {{ getColumnData(data, column) }}
            </slot>
          </td>
        </tr>
      </table>

      <!-- pagination -->
      <div class="px-2 text-sm bg-neutral-100 border-t border-neutral-100 shadow-inner">
        <BasePagination
          v-if="dataSource.length && !!page"
          :current-page="page.currentPage"
          :total-element="page.totalElement"
          :page-size="page.pageSize"
          @select="$emit('page', $event)"
        />
      </div>

      <!-- empty content -->
      <div
        v-if="!dataSource.length"
        class="h-24 mx-auto flex items-center justify-center font-bold text-xl text-neutral-400/50"
      >
        {{ t('common.emptyContent') }}
      </div>
    </div>
  </div>
</template>
