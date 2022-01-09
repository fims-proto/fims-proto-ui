import { useUserStore } from '../store/user'
import Kratos from './Kratos'

class Auth {

  private currentUser: any
  private userStore = useUserStore()

  public async logout() {
    const url = await Kratos.initLogoutFlow()
    if (url) {
      location.href = url
    }
  }

  public getUserInfo() {
    return this.currentUser
  }
}

export default new Auth()