export interface SlugError {
  slug: string
  message: string
}

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

export type Page<T> = {
  content: T[]
  page: number
  size: number
  total: number
  numberOfElements: number
  isFirst: boolean
  isLast: boolean
}

export interface AppNotification {
  id?: string
  type?: 'error' | 'info' | 'success' | 'warning'
  duration?: number
  closable?: boolean
  message: string
}
