import { reactive } from 'vue'

export interface IUserState {
  userId: string
  traits: {
    name?: {
      first?: string
      last?: string
    }
    email: string
  }
}

export const UserState: IUserState = {
  userId: '',
  traits: {
    name: {
      first: '',
      last: '',
    },
    email: '',
  },
}

export function createState() {
  return reactive(UserState)
}
