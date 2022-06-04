import { AppNotification } from '../../domain'
import { INotificationState } from './state'

function push(state: INotificationState) {
  return (notification: AppNotification) => {
    notification.id = Math.random().toString(36).slice(-8)
    state.notifications.push(notification)
  }
}

function remove(state: INotificationState) {
  return (id: string) => (state.notifications = state.notifications.filter((m) => m.id != id))
}

export function createAction(state: INotificationState) {
  return {
    push: push(state),
    remove: remove(state),
  }
}
