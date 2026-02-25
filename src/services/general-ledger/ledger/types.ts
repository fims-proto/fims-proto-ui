import { type Account } from '../account'
import { type Period } from '../period'

export interface Ledger {
  id: string
  sobId: string
  accountId: string
  openingAmount: number
  periodDebit: number
  periodCredit: number
  endingAmount: number
  account: Account
  periodId: string
  updatedAt: Date
  createdAt: Date
}

export interface PeriodAndLedgers {
  period: Period
  ledgers: Ledger[]
}

export interface InitializeLedgersRequest {
  ledgers: InitializeLedgerItem[]
}

export interface InitializeLedgerItem {
  accountNumber: string
  openingBalance: number
}
