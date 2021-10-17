import { Session } from '@ory/kratos-client'
import FlowRepository from './FlowRepository'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

export default class Auth {

  private static session: Session | undefined
  private static currentUser: CurrentUser | undefined

  static async isLoggedIn(): Promise<boolean> {
    if (!this.session) {
      const session = await FlowRepository.whoAmI()
      this.setSession(session)
    }
    return !!this.session
  }

  static async logout() {
    const url = await FlowRepository.initLogoutFlow()
    if (url) {
      this.clearSession()
      location.href = url
    }
  }

  static setSession(session: Session | undefined) {
    if (!session) return

    this.session = session
    this.currentUser = {
      id: session.identity.id,
      email: session.identity.traits.email,
      firstName: session.identity.traits.name?.first,
      lastName: session.identity.traits.name?.last
    }
  }

  static clearSession() {
    this.session = undefined
    this.currentUser = undefined
  }

  static getUserInfo() {
    return this.currentUser
  }
}