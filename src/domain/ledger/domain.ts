import axios from 'axios'
import { Ledger, NewPeriod, Period } from './types'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, Response } from '../errorHandler'
import { convertFieldsFromString } from '../dateTypeConverter'
import { Page, Pageable } from '../types'

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
  public async getCurrentPeriod(sobId: string): Promise<Response<Period>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/current`)
      return convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
    })
  }

  public async getAllPeriods(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Period>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/periods/?$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, PERIOD_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async createPeriod(newPeriod: NewPeriod): Promise<Response<Period>> {
    if (!newPeriod.openingTime) {
      newPeriod.openingTime = this.getStartTimeOfMonth(newPeriod.financialYear, newPeriod.number)
    }
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${newPeriod.sobId}/periods/`, newPeriod)
      return convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
    })
  }

  public async getAllLedgersInPeriod(
    sobId: string,
    periodId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Ledger>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers/?$page=${pageable.page}&$size=${pageable.size}&$sort=accountNumber`
      )
      convertFieldsFromString(result.data.content, LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async calculateLedgersBalanceInPeriod(sobId: string, periodId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers/calculate`)
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
