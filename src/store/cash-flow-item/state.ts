import { reactive } from 'vue'
import type { CashFlowItem } from '@/services/general-ledger'

export interface ICashFlowItemState {
  allCashFlowItems: CashFlowItem[]
}

export const CashFlowItemState: ICashFlowItemState = {
  allCashFlowItems: [],
}

export function createState() {
  return reactive(CashFlowItemState)
}
