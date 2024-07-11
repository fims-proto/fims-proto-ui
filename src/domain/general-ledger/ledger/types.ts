import { type Account } from '../account'
import { type Period } from '../period'

export interface Ledger {
  id: string
  sobId: string
  accountId: string
  openingDebitBalance: number
  openingCreditBalance: number
  periodDebit: number
  periodCredit: number
  endingDebitBalance: number
  endingCreditBalance: number
  account: Account
  periodId: string
  updatedAt: Date
  createdAt: Date
}

export interface PeriodAndLedgers {
  period: Period
  ledgers: Ledger[]
}
