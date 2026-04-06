import type { AccountNumberConversionRecord, FieldConversionRecord } from '../field-conversion'

// ------------------------------------------
// ------ Data type field conversions -------
// ------------------------------------------

export const ACCOUNT_FIELDS_CONVERSION: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const LEDGER_FIELDS_CONVERSION: FieldConversionRecord = {
  openingAmount: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  periodAmount: 'number',
  endingAmount: 'number',
}

export const PERIOD_FIELDS_CONVERSION: FieldConversionRecord = {
  fiscalYear: 'number',
  number: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const JOURNAL_LINE_FIELDS: FieldConversionRecord = {
  account: ACCOUNT_FIELDS_CONVERSION,
  amount: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const LEDGER_ENTRY_FIELDS_CONVERSION: FieldConversionRecord = {
  amount: 'number',
}

export const JOURNAL_SLIM_FIELDS: FieldConversionRecord = {
  period: PERIOD_FIELDS_CONVERSION,
  attachmentQuantity: 'number',
  amount: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const JOURNAL_FIELDS: FieldConversionRecord = {
  ...JOURNAL_SLIM_FIELDS,
  journalLines: JOURNAL_LINE_FIELDS,
}

export const PRE_CLOSE_CHECK_FIELDS_CONVERSION: FieldConversionRecord = {
  unpostedJournals: {
    count: 'number',
    journals: {
      amount: 'number',
    },
  },
  trialBalance: {
    openingAmount: 'number',
    periodAmount: 'number',
    endingAmount: 'number',
  },
  profitAndLossBalance: {
    accounts: {
      endingAmount: 'number',
    },
  },
  currentYearProfitAccount: {
    endingAmount: 'number',
  },
}

// -----------------------------------------------
// ------ Account number field conversions -------
// -----------------------------------------------

// Response configs:
// rawAccountNumber → accountNumber

export const ACCOUNT_AN_CONVERSION: AccountNumberConversionRecord = {
  rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
}

export const LEDGER_AN_CONVERSION: AccountNumberConversionRecord = {
  rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
}

export const JOURNAL_RESPONSE_AN_CONVERSION: AccountNumberConversionRecord = {
  journalLines: {
    account: {
      rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
    },
  },
}

export const PRE_CLOSE_CHECK_AN_CONVERSION: AccountNumberConversionRecord = {
  profitAndLossBalance: {
    accounts: {
      rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
    },
  },
  currentYearProfitAccount: {
    rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
  },
}

// Request configs:
// accountNumber → rawAccountNumber

export const CREATE_ACCOUNT_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  superiorAccountNumber: { fn: 'displayToRaw', targetField: 'superiorRawAccountNumber' },
}

export const INITIALIZE_LEDGER_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  ledgers: {
    accountNumber: { fn: 'displayToRaw', targetField: 'rawAccountNumber' },
  },
}

export const JOURNAL_LINE_REQUEST_AN_CONVERSION: AccountNumberConversionRecord = {
  journalLines: {
    accountNumber: { fn: 'displayToRaw', targetField: 'rawAccountNumber' },
  },
}
