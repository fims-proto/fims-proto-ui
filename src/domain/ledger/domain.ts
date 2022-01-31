import axios, { AxiosError } from 'axios'
import { Period } from './type'
import { FIMS_URL } from '../../config'
import { SlugError } from '../../types'

class LedgerService {
  public async getCurrentPeriod(sobId: string): Promise<Period> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/periods/${sobId}/current`)
      return result.data
    })
  }

  private async invokeWithErrorHandler(invoker: { (): Promise<any>; (): any }) {
    try {
      return await invoker()
    } catch (error) {
      console.error(error);
      throw new Error(((error as AxiosError).response?.data as SlugError).slug)
    }
  }
}

export const LedgerServiceInstance = new LedgerService()