import { type User } from '../../user'
import type { Account, AuxiliaryAccount } from '../account'
import { type Period } from '../period'

export type Voucher = {
  sobId: string
  id: string
  headerText: string
  period: Period
  documentNumber: string
  voucherType: string
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

export type LineItem = {
  id: string
  account: Account
  auxiliaryAccounts?: AuxiliaryAccount[]
  text: string
  credit: number
  debit: number
  createdAt: Date
  updatedAt: Date
}

export type CreateVoucherRequest = {
  headerText: string
  attachmentQuantity: number
  creator: string
  voucherType: string
  transactionTime: Date
  lineItems: LineItemRequest[]
}

export type UpdateVoucherRequest = {
  headerText: string
  attachmentQuantity: number
  lineItems: LineItemRequest[]
  transactionTime: Date
  updater: string
}

export type LineItemRequest = {
  id?: string
  accountNumber: string
  auxiliaryAccounts?: AuxiliaryItemRequest[]
  text: string
  credit: number
  debit: number
}

export type AuxiliaryItemRequest = {
  categoryKey: string
  accountKey: string
}
