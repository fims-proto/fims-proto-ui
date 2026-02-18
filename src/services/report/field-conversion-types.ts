import type { FieldConversionRecord } from '@/services/types'

export const FORMULA_FIELDS_CONVERSION: FieldConversionRecord = {
  amounts: 'number',
}

export const ITEM_FIELDS_CONVERSION: FieldConversionRecord = {
  amounts: 'number',
  formulas: FORMULA_FIELDS_CONVERSION,
}

export const SECTION_FIELDS_CONVERSION: FieldConversionRecord = {
  amounts: 'number',
  items: ITEM_FIELDS_CONVERSION,
}

export const REPORT_FIELDS_CONVERSION: FieldConversionRecord = {
  sections: SECTION_FIELDS_CONVERSION,
  createdAt: 'date',
  updatedAt: 'date',
}
