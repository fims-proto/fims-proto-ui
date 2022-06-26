import { User } from '../user'

export interface Voucher {
  attachmentQuantity: number
  auditor: User
  createdAt: Date
  creator: User
  credit: number
  debit: number
  id: string
  isAudited: boolean
  isPosted: boolean
  isReviewed: boolean
  number: string
  reviewer: User
  sobId: string
  transactionTime: Date
  type: string
  updatedAt: Date
  lineItems: LineItem[]
}

export interface NewVoucher {
  attachmentQuantity: number
  creator: string
  transactionTime: Date
  voucherType: string
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
