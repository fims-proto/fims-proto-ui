import { AccountService } from '@/services/general-ledger'
import type { IAccountState } from './state'

function refreshAccounts(state: IAccountState) {
  return async (sobId: string) => {
    if (!sobId) {
      state.allAccounts = []
      return
    }
    const { data, exception } = await AccountService.getAccounts(sobId)
    if (exception) {
      return
    }
    state.allAccounts = data || []
  }
}

export function createAction(state: IAccountState) {
  return {
    refreshAccounts: refreshAccounts(state),
  }
}
