import type { ConfirmationOptions, IConfirmationState } from './state'

function confirm(state: IConfirmationState) {
  return (options: ConfirmationOptions) => {
    state.open = true
    state.title = options.title
    state.message = options.message
    state.onConfirm = options.onConfirm
    state.onCancel = options.onCancel
  }
}

function close(state: IConfirmationState) {
  return () => {
    state.open = false
    state.title = undefined
    state.message = undefined
    state.onConfirm = undefined
    state.onCancel = undefined
  }
}

export function createAction(state: IConfirmationState) {
  return {
    confirm: confirm(state),
    close: close(state),
  }
}
