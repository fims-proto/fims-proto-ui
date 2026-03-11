import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { goHome } from '.'
import { useUserStore } from '@/store/user'
import { UserService } from '@/services/user'
import { useSobStore } from '@/store/sob'

/**
 * Before all functional pages, verify if there's valid session and the session is not recovery session (recovery session should go to /register page)
 */
export async function verifyCurrentUser(
  _to: RouteLocationNormalized,
  _from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  await useUserStore().action.loadUser()
  // verify the user is not login via recovery link
  if (useUserStore().state.user.recoveryLogin) {
    console.warn('Current login is via recovery link, redirecting to register page')
    next({ name: 'register' })
  } else {
    next()
  }
}

/**
 * Before register page, verify there's no valid session
 */
export async function verifyNotLoggedIn() {
  const user = await UserService.whoAmI()
  if (user.loggedIn && !user.recoveryLogin) {
    goHome()
  }
}

export async function loadWorkingSob() {
  const sobStore = useSobStore()
  await sobStore.action.loadWorkingSob()
}

export async function updateWorkingSob(to: RouteLocationNormalized) {
  if (to.params['sobId']) {
    await useSobStore().action.setWorkingSob(to.params['sobId'] as string)
  }
}
