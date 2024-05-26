import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { useSobStore } from '../store/sob'
import { useUserStore } from '../store/user'
import { UserService } from '../domain'
import { goHome } from '.'

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
  await useSobStore().action.loadWorkingSob()
}

export async function updateWorkingSob(to: RouteLocationNormalized) {
  await useSobStore().action.setWorkingSob(to.params['sobId'] as string)
}
