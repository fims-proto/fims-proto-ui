import { type IUnsavedChangesState } from './state'

function enableProtection(state: IUnsavedChangesState) {
  return () => {
    console.debug('Unsaved changes detected')
    state.isDirty = true
  }
}

function disableProtection(state: IUnsavedChangesState) {
  return () => {
    console.debug('Unsaved changes cleared')
    state.isDirty = false
  }
}

export function createAction(state: IUnsavedChangesState) {
  return {
    enableProtection: enableProtection(state),
    disableProtection: disableProtection(state),
  }
}
