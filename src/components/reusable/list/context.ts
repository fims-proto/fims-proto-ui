import type { Ref } from 'vue'
import { inject, provide, type InjectionKey } from 'vue'

export type ListOption = {
  defaultItem?: unknown
  hoverable?: boolean
  clickable?: boolean
}
export interface ListInjection {
  options: Ref<ListOption>
  selectedItem: Ref<unknown>
  onSelectItem(itemValue: unknown): void
}

const listInjectionKey = Symbol() as InjectionKey<ListInjection>

export function provideList(ctx: ListInjection) {
  provide(listInjectionKey, ctx)
}

export function injectList() {
  return inject(listInjectionKey, undefined)
}
