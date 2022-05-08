import axios from 'axios'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'
import { Account } from './types'

class AccountService {
  public async getAllAccounts(sobId: string): Promise<[Account]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts/`)
      return result.data
    })
  }
}

export const AccountServiceInstance = new AccountService()
