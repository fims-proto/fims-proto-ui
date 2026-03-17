import { SobService } from '@/services/sob'
import { StorageService } from '@/services/storage'
import { useAccountStore } from '@/store/account'
import { usePeriodStore } from '@/store/period'
import { type ISobState } from './state'

const CURRENT_SOB_KEY = 'CURRENT_SOB'

function setWorkingSob(state: ISobState) {
  return async (sobId: string) => {
    if (state.workingSob?.id !== sobId && sobId) {
      console.log('Updating working sob')

      const { data, exception } = await SobService.getSobById(sobId)
      if (exception || !data) {
        console.error('Failed to set working sob', exception)
        return
      }

      state.workingSob = data
      StorageService.set(CURRENT_SOB_KEY, sobId)

      usePeriodStore().action.refreshPeriods(sobId)
      useAccountStore().action.refreshAccounts(sobId)
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

export function createAction(state: ISobState) {
  return {
    setWorkingSob: setWorkingSob(state),
    loadWorkingSob: loadWorkingSob(state),
  }
}
