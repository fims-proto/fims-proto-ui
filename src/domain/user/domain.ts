import axios from 'axios'
import { type User } from '.'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import { KratosService } from '../kratos'
import { type Traits } from './type'

class UserService {
  public async whoAmI(): Promise<User> {
    const session = await KratosService.whoAmI()

    return {
      id: session?.identity?.id ?? '',
      traits: {
        name: {
          first: session?.identity?.traits.name?.first,
          last: session?.identity?.traits.name?.last,
        },
        email: session?.identity?.traits.email,
      },
      recoveryLogin: session?.authentication_methods?.some((a) => a.method === 'link_recovery') || false,
    }
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
