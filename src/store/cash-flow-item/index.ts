import { createAction } from './action'
import { createState } from './state'

const state = createState()
const action = createAction(state)

export const useCashFlowItemStore = () => ({
  get state() {
    return state
  },
  get action() {
    return action
  },
})
