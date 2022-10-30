import { inject, provide, Ref } from 'vue'
import { FormProps } from './BaseForm.vue'
import { FormValidationStatus } from './interface'

// Form injections

export interface FormInjection {
  props: FormProps
}

export function provideForm(ctx: FormInjection) {
  provide<FormInjection>('BaseForm', ctx)
}

export function injectForm(): FormInjection | undefined {
  return inject<FormInjection | undefined>('BaseForm', undefined)
}

// Form item injections

export interface FormItemInjection {
  itemStatus: Ref<FormValidationStatus | undefined>
  handleContentChange: () => void
}

export function provideFormItem(ctx: FormItemInjection) {
  provide<FormItemInjection>('BaseFormItem', ctx)
}

export function injectFormItem(): FormItemInjection | undefined {
  return inject<FormItemInjection | undefined>('BaseFormItem', undefined)
}
