import { AccountService } from '@/services/general-ledger'
import type { AccountSlim } from '@/services/general-ledger'
import type { IAccountState } from './state'

function buildFullTitleMap(accounts: AccountSlim[]): Map<string, string> {
  const sorted = [...accounts].sort((a, b) => a.level - b.level)
  const map = new Map<string, string>()
  for (const account of sorted) {
    const parentPath = account.superiorAccountId ? map.get(account.superiorAccountId) : undefined
    map.set(account.id, parentPath ? `${parentPath}_${account.title}` : account.title)
  }
  return map
}

function refreshAccounts(state: IAccountState) {
  return async (sobId: string) => {
    if (!sobId) {
      state.allAccounts = []
      state.accountFullTitleMap = new Map()
      return
    }
    console.log('Refreshing accounts')

    const { data, exception } = await AccountService.getAccounts(sobId)
    if (exception) {
      return
    }
    state.allAccounts = data || []
    state.accountFullTitleMap = buildFullTitleMap(state.allAccounts)
  }
}

function getFullTitle(state: IAccountState) {
  return (id: string): string => state.accountFullTitleMap.get(id) ?? ''
}

export function createAction(state: IAccountState) {
  return {
    refreshAccounts: refreshAccounts(state),
    getFullTitle: getFullTitle(state),
  }
}
