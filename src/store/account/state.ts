import { reactive } from 'vue'
import type { AccountSlim } from '@/services/general-ledger'

export interface IAccountState {
  allAccounts: AccountSlim[]
  accountFullTitleMap: Map<string, string>
}

export const AccountState: IAccountState = {
  allAccounts: [],
  accountFullTitleMap: new Map(),
}

export function createState() {
  return reactive(AccountState)
}
