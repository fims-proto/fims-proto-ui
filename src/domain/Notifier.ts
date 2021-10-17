import store from "../store"

export interface Message {
  id?: string;
  content: string;
  type?: 'info' | 'success' | 'warning' | 'danger';
  autoHide?: boolean;
  autoHideDelayMs?: number;
}

class Notifier {
  public push(message: Message) {
    message.id = Math.random().toString(16).slice(2)
    store.commit('push', message)
  }

  public remove(messageId: string) {
    store.commit('remove', messageId)
  }
}

export default new Notifier()