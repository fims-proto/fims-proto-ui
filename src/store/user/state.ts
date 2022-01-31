import { reactive } from "vue"
import { User } from '../../domain'

export interface IUserState {
  user: User
}

export const UserState: IUserState = {
  user: {
    id: '',
    name: {
      first: '',
      last: ''
    },
    email: ''
  }
}

export function createState() {
  return reactive(UserState)
}