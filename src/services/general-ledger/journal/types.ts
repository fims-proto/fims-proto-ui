import { type User } from '../../user'
import type { AccountDetail, DimensionOptionRef } from '../account'
import { type Period } from '../period'

export type JournalSlim = {
  sobId: string
  id: string
  headerText: string
  period: Period
  periodId?: string // for search filter
  documentNumber: string
  journalType: string
  referenceJournalId?: string
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
  createdAt: Date
  updatedAt: Date
}

export type JournalDetail = JournalSlim & {
  journalLines: JournalLine[]
}

export type JournalLine = {
  id: string
  account: AccountDetail
  dimensionOptions?: DimensionOptionRef[]
  cashFlowItemId?: string
  text: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export type CreateJournalRequest = {
  headerText: string
  journalType?: string
  referenceJournalId?: string
  attachmentQuantity: number
  creator: string
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
  dimensionOptionIds?: string[]
  cashFlowItemId?: string
  text: string
  amount: number
}

export type ClosingJournalResponse = {
  journalId: string
}

export type ClosingJournalIdsResponse = {
  monthlyClosingJournalId?: string
  yearEndClosingJournalId?: string
}
