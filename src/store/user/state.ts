import { reactive } from "vue"

export interface IUserState {
  user: any
}

export const UserStats: IUserState = {
  user: {}
}

export function createState() {
  return reactive(UserStats)
}