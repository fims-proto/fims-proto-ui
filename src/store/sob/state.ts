import { reactive } from 'vue'
import type { Sob } from '@/services/sob'

export interface ISobState {
  workingSob: Sob | undefined
}

export const SobState: ISobState = {
  workingSob: undefined,
}

export function createState() {
  return reactive(SobState)
}
