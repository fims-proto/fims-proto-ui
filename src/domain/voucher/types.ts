export interface Voucher {
  attachmentQuantity: number
  auditor: string
  createdAt: string
  creator: string
  credit: number
  debit: number
  id: string
  isAudited: boolean
  isPosted: boolean
  isReviewed: boolean
  number: string
  reviewer: string
  sobId: string
  transactionTime: string
  type: string
  updatedAt: string
  lineItems: LineItem[]
}

export interface LineItem {
  id: string
  summary: string
  accountId: string
  credit: number
  debit: number
}

export interface NewVoucher {
  attachmentQuantity: number
  creator: string
  transactionTime: Date
  voucherType: string
  lineItems: NewLineItem[]
}

export interface NewLineItem {
  id?: string
  summary: string
  accountNumber: string
  credit: number
  debit: number
}
