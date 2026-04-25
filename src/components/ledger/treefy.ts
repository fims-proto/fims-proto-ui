import type { Ledger } from '@/services/general-ledger/ledger'
import type { AccountSlim } from '@/services/general-ledger/account/types'

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
    // Convert signed openingAmount to positive openingBalance for editing
    const openingBalance = Math.abs(ledger.openingAmount || 0)

    map.set(ledger.accountId, {
      ...ledger,
      children: [],
      openingBalance,
    })
  })

  // Build tree structure based on account parent relationships
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

// Recursively calculate parent balances from children (bottom-up)
export function calculateParentBalances(nodes: LedgerTreeNode[]): void {
  nodes.forEach((node) => {
    if (node.children.length > 0) {
      // Recursively calculate children first
      calculateParentBalances(node.children)

      // Sum all children's opening balances
      const childrenSum = node.children.reduce((sum, child) => sum + child.openingBalance, 0)

      // Set parent's opening balance (positive for editing)
      node.openingBalance = childrenSum

      // Set parent's openingAmount (signed, maintaining sign based on balance direction)
      if (node.balanceDirection === 'debit') {
        node.openingAmount = childrenSum
      } else {
        node.openingAmount = -childrenSum
      }
    }
  })
}

// Check if a single ledger node has any balance or activity
function hasBalance(node: LedgerTreeNode): boolean {
  return node.openingAmount !== 0 || node.periodDebit !== 0 || node.periodCredit !== 0 || node.endingAmount !== 0
}

// Filter tree to only include nodes with balance or activity (and their ancestors)
export function filterLedgersByBalance(nodes: LedgerTreeNode[]): LedgerTreeNode[] {
  return nodes
    .map((node) => ({
      ...node,
      children: filterLedgersByBalance(node.children),
    }))
    .filter((node) => node.children.length > 0 || hasBalance(node))
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

// Build a tree from leaf-only ledger data by reconstructing ancestors from the account store.
// The backend may return only leaves with activity; parents are synthesized with zero balances,
// then aggregated bottom-up via calculateParentBalances.
export function treefyLedgersFromLeaves(ledgers: Ledger[], allAccounts: AccountSlim[]): LedgerTreeNode[] {
  const accountMap = new Map<string, AccountSlim>(allAccounts.map((a) => [a.id, a]))
  const nodeMap = new Map<string, LedgerTreeNode>()

  // Ensure a node exists for the given accountId, creating a synthetic parent if needed
  function ensureNode(accountId: string): LedgerTreeNode {
    if (nodeMap.has(accountId)) return nodeMap.get(accountId)!
    const account = accountMap.get(accountId)
    const node: LedgerTreeNode = {
      sobId: account?.sobId ?? '',
      accountId,
      superiorAccountId: account?.superiorAccountId,
      accountNumber: account?.accountNumber ?? '',
      accountTitle: account?.title ?? '',
      accountClass: account?.class ?? '',
      accountGroup: account?.group ?? '',
      balanceDirection: account?.balanceDirection ?? 'debit',
      isLeaf: account?.isLeaf ?? false,
      openingAmount: 0,
      periodDebit: 0,
      periodCredit: 0,
      periodAmount: 0,
      endingAmount: 0,
      openingBalance: 0,
      children: [],
    }
    nodeMap.set(accountId, node)
    return node
  }

  // Insert each leaf ledger into the map
  ledgers.forEach((ledger) => {
    const node: LedgerTreeNode = {
      ...ledger,
      openingBalance: Math.abs(ledger.openingAmount || 0),
      children: [],
    }
    nodeMap.set(ledger.accountId, node)
    // Ensure all ancestors exist
    let currentId: string | undefined = ledger.superiorAccountId
    while (currentId) {
      ensureNode(currentId)
      currentId = accountMap.get(currentId)?.superiorAccountId
    }
  })

  // Wire up parent-child relationships
  const roots: LedgerTreeNode[] = []
  nodeMap.forEach((node) => {
    if (node.superiorAccountId && nodeMap.has(node.superiorAccountId)) {
      nodeMap.get(node.superiorAccountId)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Aggregate balances from leaves up to parents
  function aggregateBalances(nodes: LedgerTreeNode[]): void {
    nodes.forEach((node) => {
      if (node.children.length > 0) {
        aggregateBalances(node.children)
        node.periodDebit = node.children.reduce((s, c) => s + c.periodDebit, 0)
        node.periodCredit = node.children.reduce((s, c) => s + c.periodCredit, 0)
        node.periodAmount = node.children.reduce((s, c) => s + c.periodAmount, 0)
        const childrenEndingSum = node.children.reduce((s, c) => s + c.endingAmount, 0)
        node.endingAmount = childrenEndingSum
        node.openingAmount = node.children.reduce((s, c) => s + c.openingAmount, 0)
        node.openingBalance = Math.abs(node.openingAmount)
      }
    })
  }

  aggregateBalances(roots)
  return roots
}
