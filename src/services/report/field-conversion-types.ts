import type { AccountNumberConversionRecord, FieldConversionRecord } from '../field-conversion'

// ------------------------------------------
// ------ Data type field conversions -------
// ------------------------------------------

export const ROW_FIELDS_CONVERSION: FieldConversionRecord = {
  amounts: 'number',
}

ROW_FIELDS_CONVERSION.rows = ROW_FIELDS_CONVERSION

export const REPORT_FIELDS_CONVERSION: FieldConversionRecord = {
  rows: ROW_FIELDS_CONVERSION,
  createdAt: 'date',
  updatedAt: 'date',
}

// -----------------------------------------------
// ------ Account number field conversions -------
// -----------------------------------------------

// Response configs:
// rawAccountNumber -> accountNumber

export const ROW_AN_CONVERSION: AccountNumberConversionRecord = {
  expression: {
    ledgerAccounts: {
      rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
    },
  },
}

ROW_AN_CONVERSION.rows = ROW_AN_CONVERSION

export const REPORT_AN_CONVERSION: AccountNumberConversionRecord = {
  rows: ROW_AN_CONVERSION,
}

// Request configs:
// accountNumber -> rawAccountNumber

export const ROW_UPDATE_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  expression: {
    ledgerAccounts: {
      accountNumber: { fn: 'displayToRaw', targetField: 'rawAccountNumber' },
    },
  },
}

ROW_UPDATE_REQUEST_AN_CONVERSION.rows = ROW_UPDATE_REQUEST_AN_CONVERSION

export const REPORT_UPDATE_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  rows: ROW_UPDATE_REQUEST_AN_CONVERSION,
}
