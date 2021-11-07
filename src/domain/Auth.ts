import { useUserStore } from '../store/user'

class Auth {

  private currentUser: any
  private userStore = useUserStore()

  public async logout() {
    alert('not implemented yet')
  }

  public getUserInfo() {
    return this.currentUser
  }
}

export default new Auth()