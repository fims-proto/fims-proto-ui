// Response wrapper for Kratos response
export type Response<T> = {
  ok: boolean
  data: T
}

// Current login session info
export type Session = {
  id?: string
  name: {
    first: string
    last: string
  }
  email: string
  authenticationMethod: 'link_recovery' | 'password'
}

// Flow with password method, used for login or update password
export type PasswordFlow = {
  flowId: string
  method: 'password'
  identifier: string
  password: string
  csrfToken: string
}

// Flow with profile method, used for profile update
export type ProfileFlow = {
  flowId: string
  method: 'profile'
  email: string
  name: {
    first: string
    last: string
  }
  csrfToken: string
}
