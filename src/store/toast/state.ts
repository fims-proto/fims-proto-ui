import { reactive } from 'vue'
import type { ToastMessageOptions } from 'primevue/toast'

export interface IMessageState {
  message: ToastMessageOptions
}

export const MessageState: IMessageState = {
  message: {},
}

export function createState() {
  return reactive(MessageState)
}
