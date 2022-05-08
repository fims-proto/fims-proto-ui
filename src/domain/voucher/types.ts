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
  accountId: string
  credit: number
  debit: number
  id: string
  summary: string
}
