import type { Period } from '@/services/general-ledger'

import type { ExplorerPeriodSelection, IExplorerPeriodState } from './state'

function ensureEntry(state: IExplorerPeriodState, sobId: string): ExplorerPeriodSelection {
  if (!state.selections[sobId]) {
    state.selections[sobId] = { startPeriod: undefined, endPeriod: undefined }
  }
  return state.selections[sobId]
}

function setRange(state: IExplorerPeriodState) {
  return (sobId: string, startPeriod: Period, endPeriod: Period): void => {
    const entry = ensureEntry(state, sobId)
    entry.startPeriod = startPeriod
    entry.endPeriod = endPeriod
  }
}

function clearForSob(state: IExplorerPeriodState) {
  return (sobId: string): void => {
    delete state.selections[sobId]
  }
}

export function createAction(state: IExplorerPeriodState) {
  return { setRange: setRange(state), clearForSob: clearForSob(state) }
}
