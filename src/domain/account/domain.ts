import axios, { AxiosError } from 'axios'
import { FIMS_URL } from '../../config'
import { SlugError } from '../../types'
import { Account } from './types'

class AccountService {
  public async getAllAccounts(sobId: string): Promise<[Account]> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts/`)
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
}

export const AccountServiceInstance = new AccountService()