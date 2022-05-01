import { provide, inject } from 'vue'

export interface DropdownInterface {
  handleItemSelect(key?: string): void
}

export function provideInterface(ctx: DropdownInterface) {
  provide<DropdownInterface>('base-dropdown', ctx)
}

export function injectInterface(): DropdownInterface | undefined {
  return inject<DropdownInterface>('base-dropdown')
}