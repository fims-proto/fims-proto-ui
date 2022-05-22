import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler } from '../errorHandler'
import { Account } from './types'

const FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class AccountService {
  public async getAllAccounts(sobId: string): Promise<Account[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts/`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const AccountServiceInstance = new AccountService()
