import type { Ledger } from '@/services/general-ledger/ledger'

export type LedgerTreeNode = Ledger & {
  children: LedgerTreeNode[]
  openingBalance: number // For editing: single positive amount
}

// Convert a flat list of ledgers into a tree structure based on account hierarchy
export function treefyLedgers(ledgers: Ledger[]): LedgerTreeNode[] {
  const map = new Map<string, LedgerTreeNode>()
  const roots: LedgerTreeNode[] = []

  // Initialize all nodes with children array and openingBalance
  ledgers.forEach((ledger) => {
    const openingBalance =
      ledger.account.balanceDirection === 'debit' ? ledger.openingDebitBalance : ledger.openingCreditBalance

    map.set(ledger.accountId, {
      ...ledger,
      children: [],
      openingBalance,
    })
  })

  // Build tree structure based on account parent relationships
  map.forEach((node) => {
    if (node.account.superiorAccountId) {
      const parent = map.get(node.account.superiorAccountId)
      if (parent) {
        parent.children.push(node)
      }
    } else {
      roots.push(node)
    }
  })

  return roots
}

// Recursively calculate parent balances from children (bottom-up)
export function calculateParentBalances(nodes: LedgerTreeNode[]): void {
  nodes.forEach((node) => {
    if (node.children.length > 0) {
      // Recursively calculate children first
      calculateParentBalances(node.children)

      // Sum all children's opening balances
      node.openingBalance = node.children.reduce((sum, child) => sum + child.openingBalance, 0)

      // Update the appropriate debit/credit balance based on account direction
      if (node.account.balanceDirection === 'debit') {
        node.openingDebitBalance = node.openingBalance
        node.openingCreditBalance = 0
      } else {
        node.openingCreditBalance = node.openingBalance
        node.openingDebitBalance = 0
      }
    }
  })
}

// Flatten tree back to array for iteration
export function flattenTree(nodes: LedgerTreeNode[]): LedgerTreeNode[] {
  const result: LedgerTreeNode[] = []

  function traverse(nodes: LedgerTreeNode[]) {
    nodes.forEach((node) => {
      result.push(node)
      if (node.children.length > 0) {
        traverse(node.children)
      }
    })
  }

  traverse(nodes)
  return result
}
