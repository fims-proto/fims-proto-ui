import { reactive } from 'vue'
import { type AppNotification } from '../../domain'

export interface INotificationState {
  notifications: AppNotification[]
}

export const MessageState: INotificationState = {
  notifications: [],
}

export function createState() {
  return reactive(MessageState)
}
