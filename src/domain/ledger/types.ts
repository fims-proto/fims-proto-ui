export interface Period {
  id: string
  previousPeriodId?: string
  sobId: string
  financialYear: number
  number: number
  openingTime: string
  endingTime?: string
  isClosed: boolean
  createdAt: Date
  updatedAt: Date
}

export interface NewPeriod {
  previousPeriodId?: string
  sobId: string
  financialYear: number
  number: number
  openingTime?: Date
  endingTime?: Date
}

export interface AccountInLedger {
  id: string
  accountNumber: string
  title: string
  accountType: string
  balanceDirection: string
  level: number
  superiorAccountId: string
}

export interface Ledger {
  id: string
  periodId: string
  account: AccountInLedger
  credit: number
  debit: number
  openingBalance: number
  endingBalance: number
  updatedAt: Date
  createdAt: Date
}
