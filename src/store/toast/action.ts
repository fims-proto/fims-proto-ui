import type { ToastMessageOptions } from 'primevue/toast'
import type { IMessageState } from './state'

function add(state: IMessageState) {
  return (message: ToastMessageOptions) => {
    state.message = {
      ...message,
      life: message.life ?? 5000, // default message life as 5 sec
    }
  }
}

export function createAction(state: IMessageState) {
  return { add: add(state) }
}
