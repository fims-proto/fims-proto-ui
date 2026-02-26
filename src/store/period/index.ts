import { readonly } from 'vue'
import { createAction } from './action'
import { createState } from './state'

const state = createState()
const action = createAction(state)

export const usePeriodStore = () => ({
  state: readonly(state),
  action: readonly(action),
})
