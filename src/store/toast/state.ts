import { reactive } from 'vue'

export type ToastType = 'default' | 'success' | 'info' | 'warning' | 'error'

export type ToastMessage = {
  toastType?: ToastType
  title: string
  description?: string
  duration?: number // in ms, -1 means infinite
  closable?: boolean
}

export type ToastMessageOptions = Omit<ToastMessage, 'title'>

export interface IMessageState {
  message: ToastMessage | undefined
}

export const MessageState: IMessageState = {
  message: undefined,
}

export function createState() {
  return reactive(MessageState)
}
