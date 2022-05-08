import { User } from '.'
import { KratosServiceInstance as KratosService } from '../Kratos'

class UserService {
  public async whoAmI(): Promise<User> {
    const session = await KratosService.whoAmI()

    return {
      id: session?.identity.id ?? '',
      name: {
        first: session?.identity.traits.name.first,
        last: session?.identity.traits.name.last,
      },
      email: session?.identity.traits.email,
    }
  }

  public async logout() {
    const url = await KratosService.initLogoutFlow()
    if (url) {
      location.href = url
    }
  }
}

export const UserServiceInstance = new UserService()
