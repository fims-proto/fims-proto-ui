export const ROW_SUM_FACTOR = {
  add: 1,
  ignore: 0,
  deduct: -1,
} as const

export const REFERENCE_SUM_FACTOR = {
  add: 1,
  deduct: -1,
} as const

export const EXPRESSION_KIND = ['ledger_accounts', 'cash_flow_items', 'rows_explicit', 'children_sum', 'none'] as const

export const LEDGER_MEASURE = ['net', 'debit', 'credit', 'transaction', 'opening_balance'] as const

export const CLASS_OPTIONS = ['balance_sheet', 'income_statement', 'cash_flow_statement'] as const

export const TEMPLATE_OPTIONS = [true, false] as const

export const COLUMN_VALUE_TYPE = [
  'year_opening_balance',
  'period_ending_balance',
  'year_to_date_amount',
  'last_year_amount',
  'period_amount',
] as const
