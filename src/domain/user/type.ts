export interface Traits {
  name?: {
    first?: string
    last?: string
  }
  email: string
}

export interface User {
  loggedIn?: boolean
  id: string
  traits: Traits
  recoveryLogin?: boolean
}
