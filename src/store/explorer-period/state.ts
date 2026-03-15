import { reactive } from 'vue'

import type { Period } from '@/services/general-ledger'

export interface ExplorerPeriodSelection {
  startPeriod: Period | undefined
  endPeriod: Period | undefined
}

export interface IExplorerPeriodState {
  /**
   * Keyed by sobId. Each SOB independently remembers the explorer period selection.
   */
  selections: Record<string, ExplorerPeriodSelection>
}

export function createState(): IExplorerPeriodState {
  return reactive<IExplorerPeriodState>({ selections: {} })
}
