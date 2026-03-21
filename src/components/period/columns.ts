import { h } from 'vue'
import type { ColumnDef } from '@tanstack/vue-table'
import { Badge } from '@/components/ui/badge'
import i18n from '@/i18n'
import type { Period } from '@/services/general-ledger'

export const columns: ColumnDef<Period>[] = [
  {
    id: 'label',
    accessorFn: (row) => i18n.global.t('period.periodText', [row.fiscalYear, row.periodNumber]),
    header: () => i18n.global.t('period.management.periodList.title'),
    enableSorting: false,
    enableHiding: false,
    meta: { columnName: i18n.global.t('period.management.periodList.title') },
  },
  {
    id: 'status',
    header: '',
    enableSorting: false,
    enableHiding: false,
    cell: ({ row }) => {
      const period = row.original
      if (period.isCurrent)
        return h(Badge, { variant: 'default', class: 'text-xs' }, () => i18n.global.t('period.current'))
      if (period.isClosed)
        return h(Badge, { variant: 'secondary', class: 'text-xs' }, () => i18n.global.t('period.closed'))
      return h(Badge, { variant: 'outline', class: 'text-xs' }, () =>
        i18n.global.t('period.management.periodList.open'),
      )
    },
    meta: { class: 'w-[80px] text-right' },
  },
]
