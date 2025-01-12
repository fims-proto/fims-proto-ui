import type { DATA_SOURCE, FORMULA_RULE, FORMULA_SUM_FACTOR, ITEM_SUM_FACTOR } from './constants'

export type Report = {
  id: string
  sobId: string
  period?: Period
  title: string
  template: boolean
  class: string
  amountTypes: string[]
  sections: Section[]
  createdAt: Date
  updatedAt: Date
}

export type Period = {
  fiscalYear: number
  periodNumber: number
}

export type Section = {
  id: string
  title?: string
  amounts: number[]
  sections?: Section[]
  items?: Item[]
}

export type Item = {
  id: string
  text: string
  level: number
  sumFactor: (typeof ITEM_SUM_FACTOR)[keyof typeof ITEM_SUM_FACTOR]
  displaySumFactor?: boolean
  dataSource: (typeof DATA_SOURCE)[number]
  formulas?: Formula[]
  amounts?: number[]
  isEditable?: boolean
  isBreakdownItem?: boolean
  isAbleToAddChild?: boolean
  isAbleToAddLeaf?: boolean
}

export type Formula = {
  id: string
  account: Account
  sumFactor: (typeof FORMULA_SUM_FACTOR)[keyof typeof FORMULA_SUM_FACTOR]
  rule: (typeof FORMULA_RULE)[number]
  amounts: number[]
}

export type Account = {
  id: string
  sobId: string
  superiorAccountId: string
  title: string
  accountNumber: string
  level: number
  isLeaf: boolean
  class: string
  group: string
  balanceDirection: string
}

export type GenerateReportRequest = {
  title?: string
  amountTypes?: string[]
  periodFiscalYear: number
  periodNumber: number
}

export type UpdateItemRequest = {
  text?: string
  sumFactor: (typeof ITEM_SUM_FACTOR)[keyof typeof ITEM_SUM_FACTOR]
  dataSource: (typeof DATA_SOURCE)[number]
  formulas?: UpdateItemFormulaRequest[]
}

export type UpdateItemFormulaRequest = {
  sumFactor: (typeof FORMULA_SUM_FACTOR)[keyof typeof FORMULA_SUM_FACTOR]
  accountNumber: string
  rule: (typeof FORMULA_RULE)[number]
}
