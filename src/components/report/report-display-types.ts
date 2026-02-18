import type { Item } from '@/services/report'

/**
 * Entry extends Item with rendering metadata computed during transformation.
 */
export type Entry = Item & {
  /** Sequential line number for items with dataSource 'formulas' or 'sum' */
  lineNumber?: number
  /** Indentation level in rem units for nested display */
  indentation: number
  /** Whether this entry is a continuation in a sum factor group (not the first item) */
  isSumFactorContinuation?: boolean
}

/**
 * Header represents column header information for a report section.
 */
export type Header = {
  title: string
  lineNumberLabel: string
  amountTypes: string[]
}

/**
 * Cell in a balance sheet row, representing either asset or liability side.
 */
export type BalanceSheetCell = {
  entry: Entry | null
  isBlank: boolean
}

/**
 * A single row in balance sheet display, containing both asset and liability cells.
 */
export type BalanceSheetRow = {
  asset: BalanceSheetCell
  liability: BalanceSheetCell
}

/**
 * Open-ended display data structure for report rendering.
 * Different report classes can have different payload shapes.
 *
 * - balance_sheet: uses `rows` (BalanceSheetRow[]) for two-column layout
 * - income_statement: uses `entries` (Entry[]) for single-column layout
 * - future report types can extend with their own structures
 */
export type ReportDisplayData = {
  /** Report class identifier (balance_sheet, income_statement, etc.) */
  class: string
  /** Column headers - 2 for balance sheet, 1 for income statement */
  headers: Header[]
  /** Balance sheet rows - only present for balance_sheet class */
  rows?: BalanceSheetRow[]
  /** Flat entries - for single-column reports like income_statement */
  entries?: Entry[]
}
