export interface AccountConfiguration {
  sobId: string
  accountId: string
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
  sobId: string
  periodId: string
  previousPeriodId: string
  financialYear: number
  number: number
  openingTime: Date
  endingTime: Date
  isClosed: boolean
  updatedAt: Date
  createdAt: Date
}

export interface Account {
  sobId: string
  accountId: string
  openingBalance: number
  endingBalance: number
  periodDebit: number
  periodCredit: number
  configuration: AccountConfiguration
  period: Period
  updatedAt: Date
  createdAt: Date
}
