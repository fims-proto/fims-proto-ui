import { type User } from '../../user'
import type { Account, AuxiliaryAccount } from '../account'
import { type Period } from '../period'

export type Journal = {
  sobId: string
  id: string
  headerText: string
  period: Period
  periodId?: string // for search filter
  documentNumber: string
  journalType: string
  attachmentQuantity: number
  amount: number
  creator: User
  auditor: User
  reviewer: User
  poster: User
  isAudited: boolean
  isPosted: boolean
  isReviewed: boolean
  transactionDate: string
  journalLines: JournalLine[]
  createdAt: Date
  updatedAt: Date
}

export type JournalLine = {
  id: string
  account: Account
  auxiliaryAccounts?: AuxiliaryAccount[]
  text: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export type CreateJournalRequest = {
  headerText: string
  attachmentQuantity: number
  creator: string
  journalType: string
  transactionDate: string
  journalLines: JournalLineRequest[]
}

export type UpdateJournalRequest = {
  headerText: string
  attachmentQuantity: number
  journalLines: JournalLineRequest[]
  transactionDate: string
  updater: string
}

export type JournalLineRequest = {
  id?: string
  accountNumber: string
  auxiliaryAccounts?: AuxiliaryItemRequest[]
  text: string
  amount: number
}

export type AuxiliaryItemRequest = {
  categoryKey: string
  accountKey: string
}
