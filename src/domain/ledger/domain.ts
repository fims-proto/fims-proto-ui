import axios, { AxiosError } from 'axios'
import { Ledger, NewPeriod, Period } from './types'
import { FIMS_URL } from '../../config'
import { SlugError } from '../../types'

class LedgerService {
  public async getCurrentPeriod(sobId: string): Promise<Period> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/current`)
      return result.data
    })
  }

  public async getAllPeriods(sobId: string): Promise<[Period]> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/`)
      return result.data
    })
  }

  public async getAllLedgersInPeriod(sobId: string, periodId: string): Promise<[Ledger]> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers/`)
      return result.data
    })
  }

  public async createPeriod(newPeriod: NewPeriod): Promise<Period> {
    if (!newPeriod.openingTime) {
      newPeriod.openingTime = this.getStartTimeOfMonth(newPeriod.financialYear, newPeriod.number)
    }
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${newPeriod.sobId}/periods/`, newPeriod)
      return result.data
    })
  }

  private async invokeWithErrorHandler(invoker: { (): Promise<any>; (): any }) {
    try {
      return await invoker()
    } catch (error) {
      console.error(error)
      throw new Error(((error as AxiosError).response?.data as SlugError).slug)
    }
  }

  private getStartTimeOfMonth(year: number, month: number): Date {
    const result = new Date()
    result.setUTCFullYear(year, month - 1, 1)
    result.setUTCHours(0, 0, 0, 0)

    return result
  }
}

export const LedgerServiceInstance = new LedgerService()