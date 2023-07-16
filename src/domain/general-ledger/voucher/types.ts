import { type User } from '../../user'
import { type Period } from '../period'

export interface Voucher {
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

export interface NewVoucher {
  attachmentQuantity: number
  creator: string
  headerText: string
  transactionTime: Date
  voucherType: string
  lineItems: LineItem[]
}

export interface LineItem {
  id?: string
  text: string
  accountId?: string
  accountNumber: string
  credit: number
  debit: number
}
