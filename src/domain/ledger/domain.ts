import axios from 'axios'
import { Ledger, NewPeriod, Period } from './types'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'
import { convertFieldsFromString } from '../dateTypeConverter'

const PERIOD_FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  financialYear: 'number',
  number: 'number',
  openingTime: 'date',
  endingTime: 'date',
  createdAt: 'date',
  updatedAt: 'date',
}

const LEDGER_FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  'account.level': 'number',
  credit: 'number',
  debit: 'number',
  openingBalance: 'number',
  endingBalance: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class LedgerService {
  public async getCurrentPeriod(sobId: string): Promise<Period> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/current`)
      return convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
    })
  }

  public async getAllPeriods(sobId: string): Promise<Period[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/`)
      return convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
    })
  }

  public async createPeriod(newPeriod: NewPeriod): Promise<Period> {
    if (!newPeriod.openingTime) {
      newPeriod.openingTime = this.getStartTimeOfMonth(newPeriod.financialYear, newPeriod.number)
    }
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${newPeriod.sobId}/periods/`, newPeriod)
      return convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
    })
  }

  public async getAllLedgersInPeriod(sobId: string, periodId: string): Promise<Ledger[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers/`)
      return convertFieldsFromString(result.data, LEDGER_FIELDS_CONVERSION)
    })
  }

  private getStartTimeOfMonth(year: number, month: number): Date {
    const result = new Date()
    result.setUTCFullYear(year, month - 1, 1)
    result.setUTCHours(0, 0, 0, 0)

    return result
  }
}

export const LedgerServiceInstance = new LedgerService()
