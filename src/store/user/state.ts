import { reactive } from 'vue'
import { type User } from '../../domain'

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
