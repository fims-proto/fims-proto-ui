import { inject, InjectionKey, provide } from 'vue'

export interface ListInjection {
  hoverable: boolean
  clickable: boolean
}

const listInjectionKey = Symbol() as InjectionKey<ListInjection>

export function provideList(ctx: ListInjection) {
  provide(listInjectionKey, ctx)
}

export function injectList() {
  return inject(listInjectionKey, undefined)
}
