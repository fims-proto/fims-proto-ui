import { type Account } from '../account'

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
