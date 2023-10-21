export type Account = {
  id: string
  sobId: string
  superiorAccountId: string
  title: string
  accountNumber: string
  numberHierarchy: number[]
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
  category: AuxiliaryCategory
  key: string
  title: string
  description: string
  createdAt: string
  updatedAt: string
}

export type UpdateAccountRequest = {
  title: string
  levelNumber: number
  balanceDirection: string
  categoryKeys: string[]
}

export type CreateAuxiliaryCategoryRequest = {
  key: string
  title: string
}

export type CreateAuxiliaryAccountRequest = {
  key: string
  title: string
  description?: string
}
