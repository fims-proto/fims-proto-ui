export const DATA_SOURCE = ['sum', 'formulas', 'none'] as const

export const ITEM_SUM_FACTOR = {
  add: 1,
  ignore: 0,
  deduct: -1,
} as const

export const FORMULA_SUM_FACTOR = {
  add: 1,
  deduct: -1,
} as const

export const FORMULA_RULE = ['net', 'debit', 'credit', 'transaction'] as const
