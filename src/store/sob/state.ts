import { reactive } from 'vue'
import { Period, Sob } from '../../domain'

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
