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

export const AUXILIARY_LEDGER_FIELDS_CONVERSION: FieldConversionRecord = {
  openingAmount: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  periodAmount: 'number',
  endingAmount: 'number',
}

export const JOURNAL_FIELDS: FieldConversionRecord = {
  period: PERIOD_FIELDS_CONVERSION,
  attachmentQuantity: 'number',
  amount: 'number',
  journalLines: JOURNAL_LINE_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}
