import { readonly } from 'vue'
import { createAction } from './action'
import { createState } from './state'

const state = createState()
const action = createAction(state)

export const useToastStore = () => ({
  state: readonly(state),
  action: readonly(action),
})

export type { ToastType } from './state'
