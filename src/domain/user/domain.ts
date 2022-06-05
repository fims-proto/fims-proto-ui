import axios from 'axios'
import { User } from '.'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'
import { KratosService } from '../kratos'
import { Traits } from './type'

class UserService {
  public async whoAmI(): Promise<User> {
    const session = await KratosService.whoAmI()

    return {
      id: session?.identity.id ?? '',
      traits: {
        name: {
          first: session?.identity.traits.name.first,
          last: session?.identity.traits.name.last,
        },
        email: session?.identity.traits.email,
      },
    }
  }

  public async logout() {
    const url = await KratosService.initLogoutFlow()
    if (url) {
      location.href = url
    }
  }

  public async whoIs(userId: string): Promise<User> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/user/${userId}`)
      return {
        id: result.data.id,
        traits: result.data.traits,
      }
    })
  }

  public async updateUser(userId: string, traits: Traits): Promise<User> {
    return invokeWithErrorHandler(async () => {
      // update
      await axios.patch(`${FIMS_URL}/api/v1/user/${userId}`, {
        traits: JSON.stringify(traits),
      })

      return this.whoIs(userId)
    })
  }
}

export const UserServiceInstance = new UserService()
