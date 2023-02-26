export interface Account {
  id: string
  sobId: string
  superiorAccountId: string
  accountNumber: string
  numberHierarchy: number[]
  title: string
  level: number
  accountType: string
  balanceDirection: string
  createdAt: Date
  updatedAt: Date
}

export interface Period {
  id: string
  sobId: string
  previousPeriodId: string
  fiscalYear: number
  periodNumber: number
  openingTime: Date
  endingTime: Date
  isClosed: boolean
  isCurrent: boolean
  updatedAt: Date
  createdAt: Date
}

export interface Ledger {
  id: string
  sobId: string
  accountId: string
  openingBalance: number
  endingBalance: number
  periodDebit: number
  periodCredit: number
  account: Account
  periodId: string
  updatedAt: Date
  createdAt: Date
}
