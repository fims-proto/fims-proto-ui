import type { Formula, Item } from '@domain/report'

export type Header = {
  title: string
  lineNumber: string
  amountTypes: string[]
}

type EntryExtra = {
  lineNumber?: number
  indentation?: number
}

export type Entry = Item & EntryExtra

export type FormulaInput = Omit<Formula, 'id' | 'account' | 'amounts'> &
  Partial<Pick<Formula, 'id' | 'account' | 'amounts'>>

export type ItemInput = Omit<Item, 'formulas'> & { formulas?: FormulaInput[] }
