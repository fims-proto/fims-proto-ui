import { reactive } from 'vue'
import type { Period } from '@domain/general-ledger'
import type { Sob } from '@domain/sob'

export interface ISobState {
  sobs: Sob[]
  workingSob: Sob | undefined
  currentPeriod: Period | undefined
}

export const SobState: ISobState = {
  sobs: [],
  workingSob: undefined,
  currentPeriod: undefined,
}

export function createState() {
  return reactive(SobState)
}
