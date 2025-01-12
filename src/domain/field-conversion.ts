/* eslint-disable @typescript-eslint/no-explicit-any */

import { type FieldConversionRecord } from './types'

export function convertFieldsFromString(data: any, options: FieldConversionRecord) {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = convert('_root_', data[i], options)
    }
  } else if (isObject(data)) {
    for (const key in data) {
      data[key] = convert(key, data[key], options[key])
    }
  } else {
    throw 'unexpected data conversion type'
  }
  return data
}

function convert(currentKey: string, data: any, option: 'number' | 'date' | FieldConversionRecord | undefined) {
  if (!option) {
    // no need conversion
    return data
  }

  // case: data is array, iterate it
  // case: data is string, option is number/date
  // case: data is string, option is object. [INVALID]
  // case: data is object, option is number/date. [INVALID]
  // case: data is object, option is object

  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = convert(currentKey, data[i], option)
    }
  } else if (typeof data === 'string') {
    switch (option) {
      case 'number':
        data = Number(data)
        break
      case 'date':
        data = new Date(data)
        break
      default:
        throw 'unexpected data conversion type'
    }
  } else if (isObject(data)) {
    if (!isObject(option)) {
      throw 'unexpected data conversion type'
    }

    for (const key in data) {
      const newOption = key === currentKey ? option : (option as FieldConversionRecord)[key]
      data[key] = convert(key, data[key], newOption)
    }
  }

  return data
}

function isObject(obj: any): boolean {
  return obj === Object(obj)
}
