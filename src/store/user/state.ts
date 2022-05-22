import { reactive } from 'vue'
import { Traits } from '../../domain'

export interface IUserState {
  userId: string
  traits: Traits
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
