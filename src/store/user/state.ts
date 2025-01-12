import type { User } from '@domain/user'
import { reactive } from 'vue'

export interface IUserState {
  user: User
}

export const UserState: IUserState = {
  user: {
    id: '',
    traits: {
      name: {
        first: '',
        last: '',
      },
      email: '',
    },
  },
}

export function createState() {
  return reactive(UserState)
}
