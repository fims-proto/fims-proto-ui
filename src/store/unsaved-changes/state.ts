import { reactive } from 'vue'

export interface IUnsavedChangesState {
  isDirty: boolean
}

export const UnsavedChangesState: IUnsavedChangesState = {
  isDirty: false,
}

export function createState() {
  return reactive(UnsavedChangesState)
}
