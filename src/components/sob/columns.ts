import type { ColumnDef } from '@tanstack/vue-table'
import { h } from 'vue'

import { DataTableColumnHeader } from '@/components/common/data-table'
import type { Sob } from '@/services/sob'
import i18n from '@/i18n'

export const columns: ColumnDef<Sob>[] = [
  {
    accessorKey: 'name',
    size: 250,
    header: ({ column }) => h(DataTableColumnHeader<Sob>, { column, title: i18n.global.t('sob.name') }),
    cell: ({ row }) => {
      const sob = row.original
      return h('div', { class: 'space-y-1 w-sm' }, [
        h('div', { class: 'font-medium truncate' }, sob.name),
        h('div', { class: 'text-sm text-muted-foreground truncate' }, sob.description || '-'),
      ])
    },
  },
  {
    accessorKey: 'baseCurrency',
    header: i18n.global.t('sob.baseCurrency'),
    cell: ({ row }) => row.getValue('baseCurrency'),
  },
  {
    accessorKey: 'startingPeriod',
    header: i18n.global.t('sob.startingPeriod'),
    cell: ({ row }) => {
      const sob = row.original
      return `${sob.startingPeriodYear}-${sob.startingPeriodMonth}`
    },
  },
]
