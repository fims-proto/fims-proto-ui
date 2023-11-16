export type FormValidationStatus = 'success' | 'error' | 'warning'

export type FormItemValidator = (value: unknown) => boolean | Error

export type FormItemRule = {
  required?: boolean
  validator?: FormItemValidator
  message?: string
}

export type FormRules = {
  [path: string]: FormRules | FormItemRule
}

export type SelectItem = {
  value: string
  label: string
}
