import { reactive } from 'vue'
import type { Period } from '@/services/general-ledger'

export interface IPeriodState {
  allPeriods: Period[]
  currentPeriod: Period | undefined
}

export const PeriodState: IPeriodState = {
  allPeriods: [],
  currentPeriod: undefined,
}

export function createState() {
  return reactive(PeriodState)
}
