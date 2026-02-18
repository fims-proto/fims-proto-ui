import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

import { DataTableColumnHeader } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import type { Report } from '@/services/report'
import i18n from '@/i18n'

export const columns: ColumnDef<Report>[] = [
  {
    accessorKey: 'title',
    size: 250,
    header: ({ column }) => h(DataTableColumnHeader<Report>, { column, title: i18n.global.t('report.title') }),
    cell: ({ row }) => {
      const report = row.original
      return h('div', { class: 'font-medium truncate' }, report.title)
    },
    meta: {
      columnName: i18n.global.t('report.title'),
    },
  },
  {
    accessorKey: 'class',
    header: i18n.global.t('report.class'),
    cell: ({ row }) => {
      const reportClass = row.getValue('class') as string
      return i18n.global.t(`report.classEnum.${reportClass}`)
    },
    enableSorting: false,
    filterFn: (row, id, value) => value.includes(row.getValue(id)),
    meta: {
      columnName: i18n.global.t('report.class'),
    },
  },
  {
    accessorKey: 'period',
    header: i18n.global.t('report.period'),
    cell: ({ row }) => {
      const report = row.original
      if (!report.period) {
        return ''
      }
      return `${report.period.fiscalYear}-${report.period.periodNumber}`
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('report.period'),
    },
  },
  {
    accessorKey: 'template',
    header: i18n.global.t('report.template'),
    cell: ({ row }) => {
      const isTemplate = row.getValue('template') as boolean
      return h(
        Badge,
        {
          variant: isTemplate ? 'outline' : 'secondary',
        },
        () => i18n.global.t(isTemplate ? 'common.yes' : 'common.no'),
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => value.includes(String(row.getValue(id))),
    meta: {
      columnName: i18n.global.t('report.template'),
    },
  },
  {
    accessorKey: 'updatedAt',
    header: ({ column }) => h(DataTableColumnHeader<Report>, { column, title: i18n.global.t('common.createdAt') }),
    cell: ({ row }) => {
      const date = row.getValue('updatedAt') as Date
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date)
    },
    meta: {
      columnName: i18n.global.t('common.createdAt'),
    },
  },
]
