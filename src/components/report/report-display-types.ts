import type { Column, Row } from '@/services/report'

export type Entry = Row & {
  hasBreakDownPrefix: boolean
  showBreakDownPrefix: boolean
  hasSumFactorPrefix: boolean
  showSumFactorPrefix: boolean
  padding?: true
}

export type Header = {
  rowTextLabel: string
  lineNumberLabel: string
  columns: Column[]
}

export type ReportDisplayData = {
  class: string
  headers: Header[]
  balanceSheetEntries?: [Entry[], Entry[]]
  entries?: Entry[]
}
