import type { FieldConversionRecord } from '..'

export const ACCOUNT_FIELDS_CONVERSION: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const AUXILIARY_FIELDS_CONVERSION: FieldConversionRecord = {
  createdAt: 'date',
  updatedAt: 'date',
}

export const LEDGER_FIELDS_CONVERSION: FieldConversionRecord = {
  openingDebitBalance: 'number',
  openingCreditBalance: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  endingDebitBalance: 'number',
  endingCreditBalance: 'number',
  acount: ACCOUNT_FIELDS_CONVERSION,
  createdAt: 'date',
  updatedAt: 'date',
}

export const PERIOD_FIELDS_CONVERSION: FieldConversionRecord = {
  fiscalYear: 'number',
  number: 'number',
  openingTime: 'date',
  endingTime: 'date',
  createdAt: 'date',
  updatedAt: 'date',
}

export const ITEM_FIELDS: FieldConversionRecord = {
  account: ACCOUNT_FIELDS_CONVERSION,
  credit: 'number',
  debit: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const VOUCHER_FIELDS: FieldConversionRecord = {
  period: PERIOD_FIELDS_CONVERSION,
  attachmentQuantity: 'number',
  credit: 'number',
  debit: 'number',
  transactionTime: 'date',
  lineItems: ITEM_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}
