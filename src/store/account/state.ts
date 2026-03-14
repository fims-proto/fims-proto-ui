import { reactive } from 'vue'
import type { AccountSlim } from '@/services/general-ledger'

export interface IAccountState {
  allAccounts: AccountSlim[]
}

export const AccountState: IAccountState = {
  allAccounts: [],
}

export function createState() {
  return reactive(AccountState)
}
