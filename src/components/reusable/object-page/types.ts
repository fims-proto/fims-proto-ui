export type ActionItem = {
  condition?: () => boolean | undefined
  label?: string
  icon?: string
  command: (e: Event) => void
  disabled?: () => boolean | undefined
}
