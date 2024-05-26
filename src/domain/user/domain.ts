import axios from 'axios'
import { type User } from '.'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import { KratosService } from '../kratos'
import { type Traits } from './type'
import type { Session } from '@ory/kratos-client'

class UserService {
  public async whoAmI(): Promise<User> {
    const { ok, data: session } = await KratosService.whoAmI()

    return {
      loggedIn: ok,
      id: session?.identity?.id ?? '',
      traits: {
        name: {
          first: session?.identity?.traits.name?.first,
          last: session?.identity?.traits.name?.last,
        },
        email: session?.identity?.traits.email,
      },
      recoveryLogin: this.checkIfRecoveryLogin(session),
    }
  }

  /**
   * If current login session is authenticated by recovery link, UI should redirect to register page.
   * Find the latest authentication method ordering by completed_at, check if it's 'link_recovery'
   */
  private checkIfRecoveryLogin(session: Session | undefined): boolean {
    return (
      session?.authentication_methods
        ?.map((a) => ({ ...a, completed_at: a.completed_at ? Date.parse(a.completed_at) : 0 }))
        .sort((a, b) => b.completed_at - a.completed_at)
        .at(0)?.method === 'link_recovery' || false
    )
  }

  public async logout() {
    const url = await KratosService.initLogoutFlow()
    if (url) {
      location.href = url
    }
  }

  public async updateUser(userId: string, traits: Traits): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/user/${userId}`, {
        traits: JSON.stringify(traits),
      })
    })
  }
}

export const UserServiceInstance = new UserService()
