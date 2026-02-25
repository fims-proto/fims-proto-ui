import { h, useId } from 'vue'
import i18n from '@/i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTableColumnHeader } from '@/components/common/data-table'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ChevronRight } from 'lucide-vue-next'
import type { LedgerTreeNode } from './treefy'

export function createColumns(
  isEditing: boolean,
  onBalanceChange: (ledger: LedgerTreeNode, value: number) => void,
): ColumnDef<LedgerTreeNode>[] {
  return [
    {
      accessorKey: 'account.accountNumber',
      header: ({ column }) =>
        h(DataTableColumnHeader<LedgerTreeNode>, {
          column: column,
          title: i18n.global.t('account.accountNumber'),
        }),
      cell: ({ row }) => {
        const data = row.original
        return h(
          'span',
          {
            class: 'text-nowrap',
            style: { marginLeft: `${row.depth * 1}rem` },
          },
          data.account.accountNumber,
        )
      },
      meta: {
        columnName: i18n.global.t('account.accountNumber'),
      },
    },
    {
      accessorKey: 'account.title',
      header: ({ column }) =>
        h(DataTableColumnHeader<LedgerTreeNode>, {
          column: column,
          title: i18n.global.t('account.accountTitle'),
        }),
      enableSorting: false,
      enableHiding: false,
      meta: {
        columnName: i18n.global.t('account.accountTitle'),
      },
    },
    {
      id: 'class',
      accessorKey: 'account.class',
      header: ({ column }) =>
        h(DataTableColumnHeader<LedgerTreeNode>, {
          column: column,
          title: i18n.global.t('account.class'),
        }),
      cell: ({ row }) => {
        const data = row.original
        return h(
          'span',
          {
            class: 'text-nowrap',
          },
          i18n.global.t(`account.classEnum.${data.account.class}`),
        )
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id))
      },
      enableSorting: false,
      meta: {
        columnName: i18n.global.t('account.class'),
      },
    },
    {
      accessorKey: 'account.balanceDirection',
      header: ({ column }) =>
        h(DataTableColumnHeader<LedgerTreeNode>, {
          column: column,
          title: i18n.global.t('ledger.balanceDirection'),
        }),
      cell: ({ row }) => {
        const data = row.original
        const direction = data.account.balanceDirection
        const label = i18n.global.t(`account.balanceDirectionEnum.${direction}`)
        return h(
          Badge,
          {
            variant: 'outline',
          },
          () => label,
        )
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        columnName: i18n.global.t('ledger.balanceDirection'),
      },
    },
    {
      accessorKey: 'openingBalance',
      size: 10,
      header: ({ column }) =>
        h(DataTableColumnHeader<LedgerTreeNode>, {
          column: column,
          title: i18n.global.t('ledger.openingBalance'),
          class: 'text-right',
        }),
      cell: ({ row }) => {
        const data = row.original
        const isLeaf = data.account.isLeaf

        // In edit mode, show input for leaf accounts, readonly for parents
        if (isEditing && isLeaf) {
          return h(Input, {
            id: useId(),
            type: 'number',
            min: 0,
            step: 0.01,
            modelValue: data.openingBalance || '',
            'onUpdate:modelValue': (value: string | number) => {
              const numValue = typeof value === 'string' ? parseFloat(value) || 0 : value
              onBalanceChange(data, numValue)
            },
            class: 'w-32 float-right',
          })
        }

        // Display mode or parent accounts - show formatted number
        return data.openingBalance
          ? h(
              'div',
              {
                class: 'text-right',
              },
              i18n.global.n(data.openingBalance, 'decimal'),
            )
          : null
      },
      enableSorting: false,
      enableHiding: false,
      meta: {
        columnName: i18n.global.t('ledger.openingBalance'),
      },
    },
  ]
}

// Columns for ledger list view (read-only with grouped headers)
export const viewColumns: ColumnDef<LedgerTreeNode>[] = [
  {
    id: 'expander',
    cell: ({ row }) => {
      return h(
        'div',
        { class: 'flex items-center justify-center' },
        row.getCanExpand()
          ? [
              h(
                Button,
                {
                  size: 'icon-sm',
                  variant: 'ghost',
                  onClick: (event: Event) => {
                    event.stopPropagation()
                    row.toggleExpanded()
                  },
                },
                () =>
                  h(ChevronRight, {
                    class: `transition-transform duration-200 ${row.getIsExpanded() ? 'rotate-90' : ''}`,
                  }),
              ),
            ]
          : [],
      )
    },
    meta: {
      class: 'w-[32px] p-0 border-r-0!',
    },
  },
  {
    accessorKey: 'account.accountNumber',
    header: ({ column }) =>
      h(DataTableColumnHeader<LedgerTreeNode>, {
        column: column,
        title: i18n.global.t('account.accountNumber'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h(
        'span',
        {
          class: 'text-nowrap',
          style: { marginLeft: `${row.depth * 1}rem` },
        },
        data.account.accountNumber,
      )
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('account.accountNumber'),
    },
  },
  {
    accessorKey: 'account.title',
    header: ({ column }) =>
      h(DataTableColumnHeader<LedgerTreeNode>, {
        column: column,
        title: i18n.global.t('account.accountTitle'),
      }),
    enableSorting: false,
    enableHiding: false,
    meta: {
      columnName: i18n.global.t('account.accountTitle'),
    },
  },
  {
    id: 'class',
    accessorKey: 'account.class',
    header: ({ column }) =>
      h(DataTableColumnHeader<LedgerTreeNode>, {
        column: column,
        title: i18n.global.t('account.class'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h(
        'span',
        {
          class: 'text-nowrap',
        },
        i18n.global.t(`account.classEnum.${data.account.class}`),
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('account.class'),
    },
  },
  // Grouped column: Opening Balance
  {
    id: 'opening',
    header: i18n.global.t('ledger.openingBalance'),
    meta: {
      class: 'text-right',
    },
    columns: [
      {
        accessorKey: 'openingAmount',
        header: i18n.global.t('ledger.debit'),
        cell: ({ row }) => {
          const amount = row.original.openingAmount || 0
          return amount > 0 ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(amount, 'decimal')) : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.openingBalance')} - ${i18n.global.t('ledger.debit')}`,
        },
      },
      {
        accessorKey: 'openingAmount',
        header: i18n.global.t('ledger.credit'),
        cell: ({ row }) => {
          const amount = row.original.openingAmount || 0
          return amount < 0
            ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(Math.abs(amount), 'decimal'))
            : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.openingBalance')} - ${i18n.global.t('ledger.credit')}`,
        },
      },
    ],
  },
  // Grouped column: Changes (Period Amount)
  {
    id: 'changes',
    header: i18n.global.t('ledger.interimBalance'),
    meta: {
      class: 'text-right',
    },
    columns: [
      {
        accessorKey: 'periodDebit',
        header: i18n.global.t('ledger.debit'),
        cell: ({ row }) => {
          const value = row.original.periodDebit
          return value ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(value, 'decimal')) : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.interimBalance')} - ${i18n.global.t('ledger.debit')}`,
        },
      },
      {
        accessorKey: 'periodCredit',
        header: i18n.global.t('ledger.credit'),
        cell: ({ row }) => {
          const value = row.original.periodCredit
          return value ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(value, 'decimal')) : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.interimBalance')} - ${i18n.global.t('ledger.credit')}`,
        },
      },
    ],
  },
  // Grouped column: Ending Balance
  {
    id: 'ending',
    header: i18n.global.t('ledger.endingBalance'),
    meta: {
      class: 'text-right',
    },
    columns: [
      {
        accessorKey: 'endingAmount',
        header: i18n.global.t('ledger.debit'),
        cell: ({ row }) => {
          const amount = row.original.endingAmount || 0
          return amount > 0 ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(amount, 'decimal')) : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.endingBalance')} - ${i18n.global.t('ledger.debit')}`,
        },
      },
      {
        accessorKey: 'endingAmount',
        header: i18n.global.t('ledger.credit'),
        cell: ({ row }) => {
          const amount = row.original.endingAmount || 0
          return amount < 0
            ? h('span', { class: 'text-nowrap text-right' }, i18n.global.n(Math.abs(amount), 'decimal'))
            : null
        },
        enableSorting: false,
        meta: {
          class: 'text-right',
          columnName: `${i18n.global.t('ledger.endingBalance')} - ${i18n.global.t('ledger.credit')}`,
        },
      },
    ],
  },
]
