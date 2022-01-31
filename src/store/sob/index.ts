import { readonly } from 'vue';
import { createAction } from './action';
import { createState } from './state';

const state = createState()
const action = createAction(state)

export const useSobStore = () => ({
  state: readonly(state),
  action: readonly(action)
})