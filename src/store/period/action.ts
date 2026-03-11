import { PeriodService } from '@/services/general-ledger'
import type { IPeriodState } from './state'

function refreshPeriods(state: IPeriodState) {
  return async (sobId: string) => {
    if (!sobId) {
      state.allPeriods = []
      state.currentPeriod = undefined
      return
    }
    console.log('Refreshing periods')

    const { data, exception } = await PeriodService.getPeriods(sobId)
    if (exception) {
      return
    }
    state.allPeriods = data || []
    // Find the current open period
    state.currentPeriod = state.allPeriods.find((p) => p.isCurrent)
  }
}

function clearPeriods(state: IPeriodState) {
  return () => {
    state.allPeriods = []
    state.currentPeriod = undefined
  }
}

export function createAction(state: IPeriodState) {
  return {
    refreshPeriods: refreshPeriods(state),
    clearPeriods: clearPeriods(state),
  }
}
