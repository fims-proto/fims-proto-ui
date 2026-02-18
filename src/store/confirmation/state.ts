import { reactive } from 'vue'

export interface IConfirmationState {
  open: boolean
  title?: string
  message?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export type ConfirmationOptions = Omit<IConfirmationState, 'open'>

export const ConfirmationState: IConfirmationState = {
  open: false,
}

export function createState() {
  return reactive(ConfirmationState)
}
