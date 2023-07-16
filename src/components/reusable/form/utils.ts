import { type FormItemRule } from './interface'

export function validate(value: unknown, rule: FormItemRule): true | string {
  if (!rule) {
    // no rule specified, regard as validate pass
    return true
  }

  if (rule.required && !value) {
    return rule.message ?? 'common.mandatoryFieldMissing'
  }

  if (rule.validator) {
    const validationResult = rule.validator(value)
    if (validationResult instanceof Error) {
      return validationResult.message ?? rule.message ?? ''
    }
    return true
  }

  return true
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function get<T>(obj: any, path: string | undefined, defaultValue = undefined): T {
  const travel = (regexp: RegExp) =>
    String.prototype.split
      .call(path, regexp)
      .filter(Boolean)
      .reduce((res, key) => (res !== null && res !== undefined ? res[key] : res), obj)
  const result = travel(/[,[\]]+?/) || travel(/[,[\].]+?/)
  return result === undefined || result === obj ? defaultValue : result
}
