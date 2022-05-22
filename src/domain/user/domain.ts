import axios from 'axios'
import { User } from '.'
import { FIMS_URL } from '../../config'
import { KratosService } from '../kratos'

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
    const result = await axios.get(`${FIMS_URL}/api/v1/user/${userId}`)
    return {
      id: result.data.id,
      traits: result.data.traits,
    }
  }
}

export const UserServiceInstance = new UserService()
