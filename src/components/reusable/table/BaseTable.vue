<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ColumnType, PageType } from '.'
import BaseNode from './BaseNode'
import { Pageable } from '../../../domain'
import { h } from 'vue'

defineProps<{
  dataSource: object[]
  columns: ColumnType<unknown>[]
  page?: PageType
}>()

defineEmits<{
  (event: 'page', pageable: Pageable): void
}>()

const { t } = useI18n()

const columnKey = (col: ColumnType<unknown>) => {
  if (col.key) {
    return col.key
  }
  if (col.path) {
    if (typeof col.path === 'string') {
      return col.path
    }
    return (col.path as string[]).join('/')
  }
  throw 'cannot determine column key'
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const columnData = (data: any, col: ColumnType<unknown>, index: number) => {
  let value

  if (col.path) {
    if (typeof col.path === 'string') {
      value = data[col.path]
    } else {
      value = data
      for (const path of col.path as string[]) {
        value = value[path]
      }
    }
  }

  if (col.render) {
    return col.render(value, data, index)
  }

  return h('span', value)
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
            :key="columnKey(column)"
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
          :key="`table-data-key-${i}`"
          class="rounded-md hover:bg-neutral-200/50 hover:shadow-inner"
          tabindex="0"
        >
          <td
            v-for="column in columns"
            :key="`${columnKey(column)}-data`"
            :class="[
              'border-t border-neutral-200 py-2 px-4',
              { 'text-left': column.align === 'left' || !column.align },
              { 'text-right': column.align === 'right' },
              { 'text-center': column.align === 'center' },
            ]"
          >
            <BaseNode :content="columnData(data, column, i)" />
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
