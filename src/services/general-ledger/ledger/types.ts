import { type Period } from '../period'

export interface Ledger {
  sobId: string
  accountId: string
  superiorAccountId?: string
  accountNumber: string
  accountTitle: string
  accountClass: string
  accountGroup: string
  balanceDirection: 'debit' | 'credit'
  isLeaf: boolean
  openingAmount: number
  periodDebit: number
  periodCredit: number
  periodAmount: number
  endingAmount: number
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
