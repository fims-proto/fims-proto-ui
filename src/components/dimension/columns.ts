import { h } from 'vue'
import i18n from '@/i18n'
import type { ColumnDef } from '@tanstack/vue-table'
import { DataTableColumnHeader } from '@/components/common/data-table'
import { Button } from '@/components/ui/button'
import { Settings2 } from 'lucide-vue-next'
import type { DimensionCategory, DimensionOption } from '@/services/dimension'

export function createDimensionCategoryColumns(
  onView: (category: DimensionCategory) => void,
): ColumnDef<DimensionCategory>[] {
  const columns: ColumnDef<DimensionCategory>[] = [
    {
      accessorKey: 'name',
      header: ({ column }) =>
        h(DataTableColumnHeader<DimensionCategory>, {
          column: column,
          title: i18n.global.t('dimension.categoryName'),
        }),
      enableSorting: false,
      enableHiding: false,
      meta: {
        columnName: i18n.global.t('dimension.categoryName'),
      },
    },
    {
      id: 'actions',
      enableSorting: false,
      enableHiding: false,
      cell: ({ row }) => {
        return h('div', { class: 'flex items-center justify-end' }, [
          h(
            Button,
            {
              variant: 'ghost',
              size: 'icon',
              onClick: (e: Event) => {
                e.stopPropagation()
                onView?.(row.original)
              },
            },
            () => h(Settings2, { class: 'h-4 w-4' }),
          ),
        ])
      },
    },
  ]

  return columns
}

export function createDimensionOptionColumns(): ColumnDef<DimensionOption>[] {
  return [
    {
      accessorKey: 'name',
      header: ({ column }) =>
        h(DataTableColumnHeader<DimensionOption>, {
          column: column,
          title: i18n.global.t('dimension.optionName'),
        }),
      enableSorting: false,
      enableHiding: false,
      meta: {
        columnName: i18n.global.t('dimension.optionName'),
      },
    },
  ]
}
