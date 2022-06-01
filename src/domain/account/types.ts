export interface Account {
  id: string
  sobId: string
  title: string
  accountNumber: string
  numberHierarchy: number[]
  level: number
  superiorAccountId: string
  accountType: string
  balanceDirection: string
}
