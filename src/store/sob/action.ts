import { LedgerService, Period, SobService, StorageService } from '../../domain'
import { ISobState } from './state'

const CURRENT_SOB_KEY = 'CURRENT_SOB'

function refreshSobs(state: ISobState) {
  return async () => {
    state.sobs = await SobService.getAllSods()
  }
}

function setWorkingSob(state: ISobState) {
  return async (sobId: string) => {
    if (state.workingSob?.id !== sobId) {
      console.log('update working sob')

      await refreshSobs(state)()

      const foundSob = state.sobs.find((sob) => sob.id === sobId)
      if (!foundSob) {
        throw new Error('sob-not-found')
      }

      state.workingSob = foundSob
      StorageService.set(CURRENT_SOB_KEY, sobId)
      state.currentPeriod = await LedgerService.getCurrentPeriod(sobId)
    }
  }
}

function loadWorkingSob(state: ISobState) {
  return async () => {
    const sobId = StorageService.get(CURRENT_SOB_KEY)
    if (sobId) {
      await setWorkingSob(state)(sobId)
    }
  }
}

function setCurrentPeriod(state: ISobState) {
  return (period: Period) => {
    state.currentPeriod = period
  }
}

export function createAction(state: ISobState) {
  return {
    refreshSobs: refreshSobs(state),
    setWorkingSob: setWorkingSob(state),
    loadWorkingSob: loadWorkingSob(state),
    setCurrentPeriod: setCurrentPeriod(state),
  }
}
