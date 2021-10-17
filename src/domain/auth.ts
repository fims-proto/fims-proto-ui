import { Identity, Session } from '@ory/kratos-client'
import FlowRepository from './FlowRepository'
import store from '../store'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
}

class Auth {

  private session: Session | undefined
  private currentUser: CurrentUser | undefined

  public async isLoggedIn(): Promise<boolean> {
    if (!this.session) {
      const session = await FlowRepository.whoAmI()
      this.setSession(session)
    }
    return !!this.session
  }

  public async logout() {
    const url = await FlowRepository.initLogoutFlow()
    if (url) {
      this.clearSession()
      location.href = url
    }
  }

  public setSession(session: Session | undefined) {
    if (!session) return

    this.session = session
    this.setUser(session.identity)
  }

  public setUser(ident: Identity | undefined) {
    if (!ident) return

    this.currentUser = {
      id: ident.id,
      email: ident.traits.email,
      firstName: ident.traits.name?.first,
      lastName: ident.traits.name?.last
    }

    store.commit('setUser', this.currentUser)
  }

  public clearSession() {
    this.session = undefined
    this.currentUser = undefined
  }

  public getUserInfo() {
    return this.currentUser
  }
}

export default new Auth()