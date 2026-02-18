import { reactive } from 'vue'
import type { Account } from '@/services/general-ledger'

export interface IAccountState {
  allAccounts: Account[]
}

export const AccountState: IAccountState = {
  allAccounts: [],
}

export function createState() {
  return reactive(AccountState)
}
