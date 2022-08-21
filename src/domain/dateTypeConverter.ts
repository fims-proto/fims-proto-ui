/* eslint-disable @typescript-eslint/no-explicit-any */

import { FieldConversionRecord } from './types'

export function convertFieldsFromString(data: any, options: FieldConversionRecord) {
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      convertObjectPropertiesFromString('', data[i], options)
    }
  } else {
    convertObjectPropertiesFromString('', data, options)
  }
  return data
}

function convertObjectPropertiesFromString(context: string, data: any, options: FieldConversionRecord) {
  for (const key in data) {
    const path = context ? `${context}.${key}` : key
    if (options[path] && typeof data[key] === 'string') {
      // need conversion
      if (options[path] === 'number') {
        data[key] = Number(data[key])
      }
      if (options[path] === 'date') {
        data[key] = new Date(data[key])
      }
    }

    if (Array.isArray(data[key])) {
      for (let i = 0; i < data[key].length; i++) {
        if (options[path] && typeof data[key][i] === 'string') {
          // need conversion
          if (options[path] === 'number') {
            data[key][i] = Number(data[key][i])
          }
          if (options[path] === 'date') {
            data[key][i] = new Date(data[key][i])
          }
        } else {
          convertObjectPropertiesFromString(path, data[key][i], options)
        }
      }
    }
  }
}
