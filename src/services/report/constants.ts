export const ITEM_SUM_FACTOR = {
  add: 1,
  ignore: 0,
  deduct: -1,
} as const

export const FORMULA_SUM_FACTOR = {
  add: 1,
  deduct: -1,
} as const

export const DATA_SOURCE = ['sum', 'formulas', 'none'] as const

export const FORMULA_RULE = ['net', 'debit', 'credit', 'transaction'] as const

export const CLASS_OPTIONS = ['balance_sheet', 'income_statement'] as const

export const TEMPLATE_OPTIONS = [true, false] as const

export const AMOUNT_TYPE = [
  'year_opening_balance',
  'period_ending_balance',
  'year_to_date_amount',
  'last_year_amount',
  'period_amount',
] as const
