import axios from 'axios'
import { type User } from '.'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import { KratosService } from '../kratos'
import { type Traits } from './type'

class UserService {
  public async whoAmI(): Promise<User> {
    const { ok, data: session } = await KratosService.whoAmI()

    return {
      loggedIn: ok,
      id: session?.id ?? '',
      traits: {
        name: {
          first: session?.name.first,
          last: session?.name.last,
        },
        email: session?.email ?? '',
      },
      recoveryLogin: session?.authenticationMethod === 'link_recovery',
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
