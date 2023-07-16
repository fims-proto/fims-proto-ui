<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { type ColumnType, type PageType } from '.'
import { type Pageable } from '../../../domain'

const props = defineProps<{
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dataSource: any[]
  columns: ColumnType[]
  rowKey?: string
  page?: PageType
}>()

defineEmits<{
  (event: 'page', pageable: Pageable): void
}>()

const { t } = useI18n()

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
const getRowKey = (record: any) => record[props.rowKey ?? 'id']

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
</script>

<template>
  <div class="flex flex-col gap-4">
    <!-- table -->
    <div class="w-full overflow-clip border border-neutral-300 shadow-lg rounded-md">
      <table class="w-full table-fixed">
        <tr class="bg-neutral-100">
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
          :key="getRowKey(data)"
          class="rounded-md hover:bg-neutral-200/50 hover:shadow-inner"
        >
          <td
            v-for="column in columns"
            :key="`${getColumnKey(column)}-${getRowKey(data)}`"
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
