import { reactive } from 'vue'
import { AppNotification } from '../../domain'

export interface INotificationState {
  notifications: AppNotification[]
}

export const MessageState: INotificationState = {
  notifications: [],
}

export function createState() {
  return reactive(MessageState)
}
