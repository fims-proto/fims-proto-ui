export type UiText = {
  context?: object
  id: number
  text: string
  type: string
}

export type UiNode = {
  attributes: {
    disabled: boolean
    label?: UiText
    name: string
    pattern?: string
    required?: boolean
    type: string
    value?: string | null
  }
  group: string
  messages: UiText[]
  meta: {
    label?: UiText
  }
  type: string
}

export type UiContainer = {
  action: string
  messages?: UiText[]
  method: string
  nodes: UiNode[]
}

export type KratosFlow = {
  expires_at: string
  id: string
  ui: UiContainer
}

export declare enum IdentityState {
  Active = 'active',
  Inactive = 'inactive',
}

export type Identity = {
  created_at?: string
  id: string
  state?: IdentityState
  state_changed_at?: string
  traits: {
    email: string
    name: {
      first: string
      last: string
    }
  } | null
  updated_at?: string
}

export type Session = {
  active?: boolean
  authenticated_at?: string
  expires_at?: string
  id: string
  identity: Identity
  issued_at?: string
}

export type SuccessfulLogin = {
  session: Session
  session_token?: string
}

export type LoginResult = {
  data?: SuccessfulLogin
  flow?: KratosFlow
  error?: Error
}
