import { SuccessfulSelfServiceLoginWithoutBrowser, SuccessfulSelfServiceSettingsWithoutBrowser } from "@ory/kratos-client";

export type UiText = {
  context?: object,
  id: number,
  text: string,
  type: string
}

export type UiNode = {
  attributes: {
    disabled: boolean
    label?: UiText,
    name: string
    pattern?: string,
    required?: boolean,
    type: string,
    value?: any | null
  },
  group: string,
  messages: Array<UiText>,
  meta: {
    label?: UiText
  },
  type: string
}

export type KratosFlow = {
  expires_at: string,
  id: string,
  ui: {
    action: string,
    messages?: Array<UiText>,
    method: string,
    nodes: Array<UiNode>,
  },
}

export type SubmitLoginResult = {
  data?: SuccessfulSelfServiceLoginWithoutBrowser,
  flow?: KratosFlow,
  error?: Error
}

export type SubmitSettingResult = {
  data?: SuccessfulSelfServiceSettingsWithoutBrowser,
  flow?: KratosFlow,
  error?: Error,
  success: Boolean
}