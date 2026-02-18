import { UserService, type User } from '@/services/user'
import { type IUserState } from './state'

function setUser(state: IUserState) {
  return (user: User) => {
    state.user = user
  }
}

function loadUser(state: IUserState) {
  return async () => {
    console.log('Setting current user')
    state.user = await UserService.whoAmI()
  }
}

export function createAction(state: IUserState) {
  return {
    loadUser: loadUser(state),
    setUser: setUser(state),
  }
}
