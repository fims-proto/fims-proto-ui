import { inject, provide, ref, Ref } from 'vue';

export interface FormInterface {
  hideRequiredMark: Ref<boolean>,
}

export interface InputGroupInterface {
  insideGroup: Ref<boolean>
}

export function provideForm(ctx: FormInterface) {
  provide<FormInterface>('base-form', ctx)
}

export function injectForm(): FormInterface | undefined {
  return inject<FormInterface>('base-form')
}

export function provideInputGroup(ctx: InputGroupInterface) {
  provide<InputGroupInterface>('base-input-group', ctx)
}

export function injectInputGroup(): InputGroupInterface | undefined {
  return inject<InputGroupInterface>('base-input-group', {
    insideGroup: ref(false)
  })
}