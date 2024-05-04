import { type NavigationGuardNext, type RouteLocationNormalized } from 'vue-router'
import { useSobStore } from '../store/sob'
import { useUserStore } from '../store/user'

export async function verifyCurrentUser(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  await useUserStore().action.loadUser()
  // verify the user is not login via recovery link
  if (useUserStore().state.user.recoveryLogin) {
    console.warn('Current login is via recovery link, redirecting...')
    next({ name: 'register' })
  } else {
    next()
  }
}

export async function loadWorkingSob() {
  await useSobStore().action.loadWorkingSob()
}

export async function updateWorkingSob(to: RouteLocationNormalized) {
  await useSobStore().action.setWorkingSob(to.params['sobId'] as string)
}
