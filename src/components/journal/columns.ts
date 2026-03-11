import { h } from 'vue'
import i18n from '@/i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTableColumnHeader } from '@/components/common/data-table'
import { Badge } from '@/components/ui/badge'
import type { Journal } from '@/services/general-ledger'

// Full columns - shown when detail view is closed
export const fullColumns: ColumnDef<Journal>[] = [
  {
    accessorKey: 'documentNumber',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.number'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', { class: 'text-nowrap font-medium' }, data.documentNumber)
    },
    enableHiding: false,
    meta: {
      columnName: i18n.global.t('journal.number'),
    },
  },
  {
    accessorKey: 'headerText',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.headerText'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', data.headerText)
    },
    meta: {
      columnName: i18n.global.t('journal.headerText'),
    },
  },
  {
    accessorKey: 'transactionDate',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.transactionDate'),
      }),
    cell: ({ row }) => {
      const date = new Date(row.original.transactionDate)
      return h('span', { class: 'text-nowrap' }, i18n.global.d(date, 'short'))
    },
    meta: {
      columnName: i18n.global.t('journal.transactionDate'),
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.amount'),
        class: 'justify-end',
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', { class: 'text-nowrap font-mono' }, i18n.global.n(data.amount || 0, 'decimal'))
    },
    meta: {
      columnName: i18n.global.t('journal.amount'),
      class: 'text-right',
    },
  },
  {
    accessorKey: 'attachmentQuantity',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.attachmentQuantity'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h(
        'span',
        { class: 'text-nowrap' },
        `${data.attachmentQuantity} ${i18n.global.t('journal.attachmentQuantityUnit')}`,
      )
    },
    meta: {
      columnName: i18n.global.t('journal.attachmentQuantity'),
    },
  },
  {
    accessorKey: 'creator',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.creator'),
      }),
    cell: ({ row }) => {
      const data = row.original
      const lastName = data.creator?.traits?.name?.last || ''
      const firstName = data.creator?.traits?.name?.first || ''
      const fullName = lastName + firstName
      return h('span', fullName || '-')
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('journal.creator'),
    },
  },
  {
    id: 'status',
    header: () => h('span', i18n.global.t('common.status')),
    cell: ({ row }) => {
      const data = row.original
      const badges = []

      if (data.isPosted) {
        badges.push(
          h(
            Badge,
            {
              variant: 'default',
              class: 'bg-green-600 text-xs',
            },
            () => i18n.global.t('journal.isPosted'),
          ),
        )
      } else {
        if (data.isAudited) {
          badges.push(
            h(
              Badge,
              {
                variant: 'outline',
                class: 'text-xs',
              },
              () => i18n.global.t('journal.isAudited'),
            ),
          )
        }

        if (data.isReviewed) {
          badges.push(
            h(
              Badge,
              {
                variant: 'outline',
                class: 'text-xs',
              },
              () => i18n.global.t('journal.isReviewed'),
            ),
          )
        }
      }

      return h('div', { class: 'flex gap-1 flex-wrap' }, badges)
    },
    enableSorting: false,
    enableHiding: false,
    meta: {
      columnName: i18n.global.t('common.status'),
    },
  },
]

// Compact columns - shown when detail view is open
export const compactColumns: ColumnDef<Journal>[] = [
  {
    accessorKey: 'documentNumber',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.number'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', { class: 'text-nowrap font-medium' }, data.documentNumber)
    },
    enableHiding: false,
    meta: {
      columnName: i18n.global.t('journal.number'),
    },
  },
  {
    accessorKey: 'headerText',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.headerText'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', data.headerText)
    },
    meta: {
      columnName: i18n.global.t('journal.headerText'),
    },
  },
  {
    accessorKey: 'transactionDate',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.transactionDate'),
      }),
    cell: ({ row }) => {
      const date = new Date(row.original.transactionDate)
      return h('span', { class: 'text-nowrap' }, i18n.global.d(date, 'short'))
    },
    meta: {
      columnName: i18n.global.t('journal.transactionDate'),
    },
  },
  {
    accessorKey: 'amount',
    header: ({ column }) =>
      h(DataTableColumnHeader<Journal>, {
        column: column,
        title: i18n.global.t('journal.amount'),
        class: 'justify-end',
      }),
    cell: ({ row }) => {
      const data = row.original
      return h('span', { class: 'text-nowrap font-mono' }, i18n.global.n(data.amount || 0, 'decimal'))
    },
    meta: {
      columnName: i18n.global.t('journal.amount'),
      class: 'text-right',
    },
  },
]
