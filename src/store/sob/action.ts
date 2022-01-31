import { LedgerService, Period, Sob, StorageService } from '../../domain';
import { ISobState } from "./state";

const CURRENT_SOB_KEY = 'CURRENT_SOB'

function setSobs(state: ISobState) {
  return (sobs: Sob[]) => {
    state.sobs = sobs
  }
}

function setCurrentSob(state: ISobState) {
  return async (sobId: string) => {
    state.currentSob = state.sobs.find(sob => sob.id === sobId)
    StorageService.set(CURRENT_SOB_KEY, sobId)
    state.currentPeriod = await fetchPeriod(sobId)
  }
}

function loadCurrentSob(state: ISobState) {
  return async () => {
    const sobId = StorageService.get(CURRENT_SOB_KEY)
    state.currentSob = state.sobs.find(sob => sob.id === sobId)
    if (sobId) {
      state.currentPeriod = await fetchPeriod(sobId)
    }
  }
}

function setCurrentPeriod(state: ISobState) {
  return (period: Period) => {
    state.currentPeriod = period
  }
}

async function fetchPeriod(sobId: string): Promise<Period | undefined> {
  try {
    return await LedgerService.getCurrentPeriod(sobId)
  } catch (error) {
    console.error(error)
    return undefined
  }
}

export function createAction(state: ISobState) {
  return {
    setSobs: setSobs(state),
    setCurrentSob: setCurrentSob(state),
    loadCurrentSob: loadCurrentSob(state),
    setCurrentPeriod: setCurrentPeriod(state)
  }
}