export type FormItemValidator = (value: unknown) => boolean | Error

export type FormItemRule = {
  required?: boolean
  validator?: FormItemValidator
  message?: string
}

export type FormRules = {
  [path: string]: FormRules | FormItemRule
}

export type FormItemState = { [path: string]: FormItemStateResult }

export type FormItemStateResult = {
  invalid: boolean
  message?: string
}
