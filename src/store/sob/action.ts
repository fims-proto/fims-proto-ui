import { Period, PeriodService, SobService, StorageService } from '../../domain'
import { ISobState } from './state'

const CURRENT_SOB_KEY = 'CURRENT_SOB'

function refreshSobs(state: ISobState) {
  return async () => {
    const { data } = await SobService.getAllSods()
    state.sobs = data?.content ?? []
  }
}

function setWorkingSob(state: ISobState) {
  return async (sobId: string) => {
    if (state.workingSob?.id !== sobId && sobId) {
      console.log('Updating working sob')

      const foundSob = state.sobs.find((sob) => sob.id === sobId)
      if (!foundSob) {
        console.warn('sob-not-found')
        return
      }

      state.workingSob = foundSob
      StorageService.set(CURRENT_SOB_KEY, sobId)

      const { data } = await PeriodService.getOpenPeriod(sobId)
      state.currentPeriod = data
    }
  }
}

function loadWorkingSob(state: ISobState) {
  return async () => {
    await refreshSobs(state)()
    const sobId = StorageService.get(CURRENT_SOB_KEY)
    if (sobId) {
      await setWorkingSob(state)(sobId)
    }
  }
}

function setCurrentPeriod(state: ISobState) {
  return (period: Period) => (state.currentPeriod = period)
}

export function createAction(state: ISobState) {
  return {
    refreshSobs: refreshSobs(state),
    setWorkingSob: setWorkingSob(state),
    loadWorkingSob: loadWorkingSob(state),
    setCurrentPeriod: setCurrentPeriod(state),
  }
}
