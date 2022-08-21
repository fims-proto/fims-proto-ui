import { Period } from '../account'
import { User } from '../user'

export interface JournalEntry {
  sobId: string
  entryId: string
  period: Period
  documentNumber: string
  journalType: string
  attachmentQuantity: number
  debit: number
  credit: number
  creator: User
  auditor: User
  reviewer: User
  poster: User
  isAudited: boolean
  isPosted: boolean
  isReviewed: boolean
  transactionTime: Date
  lineItems: LineItem[]
  createdAt: Date
  updatedAt: Date
}

export interface NewJournalEntry {
  attachmentQuantity: number
  creator: string
  transactionTime: Date
  journalType: string
  lineItems: LineItem[]
}

export interface LineItem {
  id?: string
  summary: string
  accountId?: string
  accountNumber: string
  credit: number
  debit: number
}
