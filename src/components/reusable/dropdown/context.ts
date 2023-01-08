import { provide, inject } from 'vue'

export interface DropdownInterface {
  handleItemSelect(key?: string): void
}

export function provideInterface(ctx: DropdownInterface) {
  provide<DropdownInterface>('BaseDropdown', ctx)
}

export function injectInterface(): DropdownInterface | undefined {
  return inject<DropdownInterface>('BaseDropdown')
}
