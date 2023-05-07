export interface Account {
  id: string
  sobId: string
  superiorAccountId: string
  accountNumber: string
  numberHierarchy: number[]
  title: string
  level: number
  accountType: string
  balanceDirection: string
  createdAt: Date
  updatedAt: Date
}
