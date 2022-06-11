import { inject, provide, Ref } from 'vue'

export interface FormInterface {
  name: Ref<string | undefined>
  hideRequiredMark: Ref<boolean>
}

export interface FormItemInterface {
  inputId: Ref<string>
}

export function provideForm(ctx: FormInterface) {
  provide<FormInterface>('BaseForm', ctx)
}

export function provideFormItem(ctx: FormItemInterface) {
  provide<FormItemInterface>('BaseFormItem', ctx)
}

export function injectForm(): FormInterface | undefined {
  return inject<FormInterface | undefined>('BaseForm', undefined)
}

export function injectFormItem(): FormItemInterface | undefined {
  return inject<FormItemInterface | undefined>('BaseFormItem', undefined)
}
