import { inject, provide, type InjectionKey, type Ref } from 'vue'
import { type FormRules, type FormValidationStatus } from './interface'

// Form injections

export interface FormInjection {
  model?: object
  rules?: FormRules
  itemValidationState: Ref<Record<string, true | string>>
}

const formInjectionKey = Symbol() as InjectionKey<FormInjection>

export function provideForm(ctx: FormInjection) {
  provide(formInjectionKey, ctx)
}

export function injectForm() {
  return inject(formInjectionKey, undefined)
}

// Form item injections

export interface FormItemInjection {
  itemStatus: Ref<FormValidationStatus | undefined>
  handleContentChange: () => void
}

const formItemInjectionKey = Symbol() as InjectionKey<FormItemInjection>

export function provideFormItem(ctx: FormItemInjection) {
  provide(formItemInjectionKey, ctx)
}

export function injectFormItem() {
  return inject(formItemInjectionKey, undefined)
}
