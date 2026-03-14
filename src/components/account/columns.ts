import { h } from 'vue'
import i18n from '@/i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTableColumnHeader } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import type { AccountTreeNode } from './treefy'
import { ChevronRight } from 'lucide-vue-next'

export const columns: ColumnDef<AccountTreeNode>[] = [
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
      class: 'w-[32px] p-0',
    },
  },
  {
    accessorKey: 'accountNumber',
    header: ({ column }) =>
      h(DataTableColumnHeader<AccountTreeNode>, {
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
        data.accountNumber,
      )
    },
    meta: {
      columnName: i18n.global.t('account.accountNumber'),
    },
  },
  {
    accessorKey: 'title',
    header: ({ column }) =>
      h(DataTableColumnHeader<AccountTreeNode>, {
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
    accessorKey: 'class',
    header: ({ column }) =>
      h(DataTableColumnHeader<AccountTreeNode>, {
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
        i18n.global.t(`account.classEnum.${data.class}`),
      )
    },
    enableSorting: false,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
    meta: {
      columnName: i18n.global.t('account.class'),
    },
  },
  {
    accessorKey: 'group',
    header: ({ column }) =>
      h(DataTableColumnHeader<AccountTreeNode>, {
        column: column,
        title: i18n.global.t('account.group'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h(
        'span',
        {
          class: 'text-nowrap',
        },
        i18n.global.t(`account.groupEnum.${data.group}`),
      )
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('account.group'),
    },
  },
  {
    accessorKey: 'balanceDirection',
    header: ({ column }) =>
      h(DataTableColumnHeader<AccountTreeNode>, {
        column: column,
        title: i18n.global.t('account.balanceDirection'),
      }),
    cell: ({ row }) => {
      const data = row.original
      return h(
        'span',
        {
          class: 'text-nowrap',
        },
        i18n.global.t(`account.balanceDirectionEnum.${data.balanceDirection}`),
      )
    },
    enableSorting: false,
    meta: {
      columnName: i18n.global.t('account.balanceDirection'),
    },
  },
]
