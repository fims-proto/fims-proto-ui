import { User, UserService } from '../../domain';
import { IUserState } from './state';

function setUser(state: IUserState) {
  return (user: User) => {
    mapUser(user, state)
  }
}

function loadUser(state: IUserState) {
  return async () => {
    mapUser(await UserService.whoAmI(), state)
  }
}

function mapUser(source: User, target: IUserState) {
  target.userId = source.id
  target.traits = {
    name: source.name,
    email: source.email
  }
}

export function createAction(state: IUserState) {
  return {
    loadUser: loadUser(state),
    setUser: setUser(state)
  }
}