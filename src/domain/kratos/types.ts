import { type UiContainer } from '@ory/kratos-client'

export type UiText = {
  context?: object
  id: number
  text: string
  type: string
}

export type UiNode = {
  attributes: {
    disabled: boolean
    label?: UiText
    name: string
    pattern?: string
    required?: boolean
    type: string
    value?: string | null
  }
  group: string
  messages: UiText[]
  meta: {
    label?: UiText
  }
  type: string
}

export type KratosFlow = {
  ui: UiContainer
}
