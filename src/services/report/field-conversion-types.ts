import type { AccountNumberConversionRecord, FieldConversionRecord } from '../field-conversion'

// ------------------------------------------
// ------ Data type field conversions -------
// ------------------------------------------

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

// -----------------------------------------------
// ------ Account number field conversions -------
// -----------------------------------------------

// Response configs:
// rawAccountNumber → accountNumber

export const REPORT_AN_CONVERSION: AccountNumberConversionRecord = {
  sections: {
    items: {
      formulas: {
        account: {
          rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
        },
      },
    },
  },
}

// Request configs:
// accountNumber → rawAccountNumber

export const REPORT_UPDATE_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  sections: {
    items: {
      formulas: {
        accountNumber: { fn: 'displayToRaw', targetField: 'rawAccountNumber' },
      },
    },
  },
}
