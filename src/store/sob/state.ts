import { reactive } from 'vue'
import type { Period } from '@/services/general-ledger'
import type { Sob } from '@/services/sob'

export interface ISobState {
  workingSob: Sob | undefined
  currentPeriod: Period | undefined
}

export const SobState: ISobState = {
  workingSob: undefined,
  currentPeriod: undefined,
}

export function createState() {
  return reactive(SobState)
}
