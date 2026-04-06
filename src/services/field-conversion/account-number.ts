/* eslint-disable @typescript-eslint/no-explicit-any */

import { rawToDisplay, displayToRaw } from './account-number-pure-logic'

type AccountNumberConversionDirective = {
  fn: 'rawToDisplay' | 'displayToRaw'
  targetField: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccountNumberConversionRecord extends Record<
  string,
  AccountNumberConversionDirective | AccountNumberConversionRecord
> {}

/**
 * Converts account number fields in-place within a data object or array,
 * applying field renames and value conversions per the provided mapping.
 *
 * For each path in the mapping:
 * - If the value is a AccountNumberConversionDirective:
 *   - Read data[key] (source field)
 *   - Convert using the specified function
 *   - Write to data[targetField]
 *   - Delete data[key] (unless key === targetField)
 * - If the value is a nested record: recurse into data[key]
 *
 * @param data - The object or array to transform (mutated in-place)
 * @param options - The mapping configuration
 * @param accountsCodeLength - The SoB's code length per level
 * @returns The transformed data (same reference as input)
 *
 * @example
 * const response = { rawAccountNumber: "003401", title: "Sales" }
 * convertAccountNumberFields(response, { rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' } }, [4,2,2])
 * // Result: { accountNumber: "3401", title: "Sales" } (rawAccountNumber removed)
 */
export function convertAccountNumberFields(
  data: any,
  options: AccountNumberConversionRecord,
  accountsCodeLength: readonly number[],
): any {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = convertField('_array_element', data[i], options, accountsCodeLength)
    }
  } else if (isObject(data)) {
    for (const key in options) {
      const result = convertField(key, data[key], options[key], accountsCodeLength)
      if (isDirectiveResult(result)) {
        data[result.targetField] = result.value
        delete data[key]
      } else {
        data[key] = result
      }
    }
  } else {
    throw new Error('[convertAccountNumberFields] Unexpected data type: expected array or object')
  }

  return data
}

function convertField(
  currentKey: string,
  data: any,
  option: AccountNumberConversionDirective | AccountNumberConversionRecord | undefined,
  accountsCodeLength: readonly number[],
): any {
  if (!option) {
    return data
  }

  // Case: data is array
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = convertField(currentKey, data[i], option, accountsCodeLength)
    }
    return data
  }

  // Case: data is directive (leaf: rename + convert)
  if (isDirective(option)) {
    if (typeof data !== 'string') {
      throw new Error(
        `[convertAccountNumberFields] Expected string value for directive at key "${currentKey}", ` +
          `got ${typeof data}. This indicates a type mismatch or incorrect mapping config.`,
      )
    }

    const conversionFn = option.fn === 'rawToDisplay' ? rawToDisplay : displayToRaw
    const convertedValue = conversionFn(data, accountsCodeLength)
    return { value: convertedValue, targetField: option.targetField }
  }

  // Case: data is object, option is nested record
  if (isObject(data)) {
    if (!isObject(option)) {
      throw new Error(
        `[convertAccountNumberFields] Type mismatch at key "${currentKey}": ` +
          `data is object but option is not a nested record. This indicates an incorrect mapping config.`,
      )
    }

    for (const nestedKey in option) {
      const nestedResult = convertField(nestedKey, data[nestedKey], option[nestedKey], accountsCodeLength)

      // If the nested result is a directive application (field rename + convert), handle it
      if (isDirectiveResult(nestedResult)) {
        data[nestedResult.targetField] = nestedResult.value
        delete data[nestedKey]
      } else {
        data[nestedKey] = nestedResult
      }
    }
    return data
  }

  return data
}

function isDirective(obj: any): obj is AccountNumberConversionDirective {
  return obj && typeof obj === 'object' && 'fn' in obj && 'targetField' in obj
}

function isDirectiveResult(obj: any): obj is { value: string; targetField: string } {
  return obj && typeof obj === 'object' && 'value' in obj && 'targetField' in obj
}

function isObject(obj: any): boolean {
  return obj === Object(obj) && !Array.isArray(obj)
}
