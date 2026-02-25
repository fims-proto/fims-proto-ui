import type { FieldConversionRecord } from '@/services/types'

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
  openingAmount: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  endingAmount: 'number',
  account: ACCOUNT_FIELDS_CONVERSION,
  createdAt: 'date',
  updatedAt: 'date',
}

export const PERIOD_FIELDS_CONVERSION: FieldConversionRecord = {
  fiscalYear: 'number',
  number: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const ITEM_FIELDS: FieldConversionRecord = {
  account: ACCOUNT_FIELDS_CONVERSION,
  amount: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

export const VOUCHER_FIELDS: FieldConversionRecord = {
  period: PERIOD_FIELDS_CONVERSION,
  attachmentQuantity: 'number',
  amount: 'number',
  lineItems: ITEM_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}
