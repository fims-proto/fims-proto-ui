import { IUserState } from "./state";

function updateUser(state: IUserState) {
  return (user: any) => {
    state.user = user
  }
}

export function createAction(state: IUserState) {
  return {
    updateUser: updateUser(state)
  }
}