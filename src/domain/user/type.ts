export interface Traits {
  name?: {
    first?: string
    last?: string
  }
  email: string
}

export interface User {
  id: string
  traits: Traits
}
