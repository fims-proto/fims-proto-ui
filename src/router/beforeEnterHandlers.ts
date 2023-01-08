import { RouteLocationNormalized } from 'vue-router'
import { useSobStore } from '../store/sob'
import { useUserStore } from '../store/user'

export async function beforeAppEnterHandler() {
  await useUserStore().action.loadUser()
  await useSobStore().action.loadWorkingSob()
}

export async function beforeWorkingZoneEnterHandler(to: RouteLocationNormalized) {
  await useSobStore().action.setWorkingSob(to.params['sobId'] as string)
}
