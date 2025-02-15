import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface ReportInjection {
  refreshList: Ref<() => void>
}

const reportInjectionKey = Symbol() as InjectionKey<ReportInjection>

export function provideContext(ctx: ReportInjection) {
  provide(reportInjectionKey, ctx)
}

export function injectContext() {
  return inject(reportInjectionKey, undefined)
}
