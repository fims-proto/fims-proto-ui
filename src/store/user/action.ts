import { User, UserService } from '../../domain';
import { IUserState } from './state';

function setUser(state: IUserState) {
  return (user: User) => {
    state.user = user
  }
}

function loadUser(state: IUserState) {
  return async () => {
    state.user = await UserService.whoAmI()
  }
}

export function createAction(state: IUserState) {
  return {
    loadUser: loadUser(state),
    setUser: setUser(state)
  }
}