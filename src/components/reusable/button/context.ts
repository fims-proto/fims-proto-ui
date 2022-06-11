import { inject, provide, ref, Ref } from 'vue'

export interface ButtonGroupInterface {
  insideGroup: Ref<boolean>
}

export function provideButtonGroup(ctx: ButtonGroupInterface) {
  provide<ButtonGroupInterface>('BaseButtonGroup', ctx)
}

export function injectButtonGroup(): ButtonGroupInterface | undefined {
  return inject<ButtonGroupInterface>('BaseButtonGroup', {
    insideGroup: ref(false),
  })
}
