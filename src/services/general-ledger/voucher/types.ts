import { type User } from '../../user'
import type { Account, AuxiliaryAccount } from '../account'
import { type Period } from '../period'

export type Voucher = {
  sobId: string
  id: string
  headerText: string
  period: Period
  periodId?: string // for search filter
  documentNumber: string
  voucherType: string
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
  lineItems: LineItem[]
  createdAt: Date
  updatedAt: Date
}

export type LineItem = {
  id: string
  account: Account
  auxiliaryAccounts?: AuxiliaryAccount[]
  text: string
  amount: number
  createdAt: Date
  updatedAt: Date
}

export type CreateVoucherRequest = {
  headerText: string
  attachmentQuantity: number
  creator: string
  voucherType: string
  transactionDate: string
  lineItems: LineItemRequest[]
}

export type UpdateVoucherRequest = {
  headerText: string
  attachmentQuantity: number
  lineItems: LineItemRequest[]
  transactionDate: string
  updater: string
}

export type LineItemRequest = {
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
