import { inject, provide, type InjectionKey, type Ref } from 'vue'

export interface VoucherInjection {
  refreshList: Ref<() => void>
}

const voucherInjectionKey = Symbol() as InjectionKey<VoucherInjection>

export function provideContext(ctx: VoucherInjection) {
  provide(voucherInjectionKey, ctx)
}

export function injectContext() {
  return inject(voucherInjectionKey, undefined)
}
