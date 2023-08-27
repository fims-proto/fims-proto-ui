export type Account = {
  id: string
  sobId: string
  superiorAccountId: string
  accountNumber: string
  numberHierarchy: number[]
  title: string
  level: number
  accountType: string
  balanceDirection: string
  auxiliaryCategories: AuxiliaryCategory[]
  createdAt: Date
  updatedAt: Date
}

export type AuxiliaryCategory = {
  id: string
  sobId: string
  key: string
  title: string
  isStandard: true
  createdAt: string
  updatedAt: string
}

export type AuxiliaryAccount = {
  id: string
  key: string
  title: string
  category: AuxiliaryCategory
  createdAt: string
  updatedAt: string
}
