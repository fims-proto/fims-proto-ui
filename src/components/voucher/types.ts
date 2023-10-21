import type { User } from '../../domain'

export type VoucherFormInput = {
  documentNumber?: string
  voucherType: string
  headerText: string
  transactionTime: Date
  attachmentQuantity: number
  lineItems: VoucherFormLineItem[]
  creator?: User
  isReviewed?: boolean
  isAudited?: boolean
  isPosted?: boolean
}

export type VoucherFormOutput = VoucherFormInput & {
  totalDebit: number
  totalCredit: number
}

export type VoucherFormLineItem = {
  id?: string
  text: string
  account?: AccountInputAccount
  auxiliaryAccounts?: AccountInputAuxiliaryAccount[]
  credit: number
  debit: number
}

export type AccountInputAccount = {
  accountNumber: string
  title: string
  auxiliaryCategories: { key: string; title: string }[]
}

export type AccountInputAuxiliaryAccount = {
  key: string
  title: string
  category: { key: string; title: string }
}
