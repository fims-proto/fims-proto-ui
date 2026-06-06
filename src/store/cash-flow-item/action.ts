import { CashFlowItemService } from '@/services/general-ledger'
import type { ICashFlowItemState } from './state'

function refreshCashFlowItems(state: ICashFlowItemState) {
  return async (sobId: string) => {
    if (!sobId) {
      state.allCashFlowItems = []
      return
    }

    const { data, exception } = await CashFlowItemService.getCashFlowItems(sobId)
    if (exception) {
      return
    }
    state.allCashFlowItems = [...(data ?? [])].sort((a, b) => a.sequence - b.sequence)
  }
}

export function createAction(state: ICashFlowItemState) {
  return {
    refreshCashFlowItems: refreshCashFlowItems(state),
  }
}
