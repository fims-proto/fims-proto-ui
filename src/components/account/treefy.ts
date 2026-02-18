import type { Account } from '@/services/general-ledger'

export type AccountTreeNode = Account & {
  children: AccountTreeNode[]
}

// Convert a flat list of accounts into a tree structure
export function treefyAccounts(accounts: Account[]): AccountTreeNode[] {
  const map = new Map<string, AccountTreeNode>()
  const roots: AccountTreeNode[] = []

  accounts.forEach((account) => {
    map.set(account.id, { ...account, children: [] })
  })

  map.forEach((node) => {
    if (node.superiorAccountId) {
      const parent = map.get(node.superiorAccountId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}
