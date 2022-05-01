import { inject, provide, ref, Ref } from 'vue';

export interface ButtonGroupInterface {
  insideGroup: Ref<boolean>
}

export function provideButtonGroup(ctx: ButtonGroupInterface) {
  provide<ButtonGroupInterface>('base-button-group', ctx)
}

export function injectButtonGroup(): ButtonGroupInterface | undefined {
  return inject<ButtonGroupInterface>('base-button-group', {
    insideGroup: ref(false)
  })
}