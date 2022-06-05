import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler } from '../errorHandler'
import { Page } from '../types'
import { Account } from './types'

const FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class AccountService {
  public async getAllAccounts(sobId: string): Promise<Page<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts/`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async getAccountByNumber(sobId: string, accountNumber: string): Promise<Account | undefined> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts/?$filter=accountNumber eq ${accountNumber}`
      )

      return result.data.numberOfElements === 1
        ? convertFieldsFromString(result.data.content[0], FIELDS_CONVERSION)
        : undefined
    })
  }

  public async getAccountsStartsWithNumber(sobId: string, serachNumber: string): Promise<Page<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts/?$filter=accountNumber startsWith ${serachNumber}&$sort=accountNumber`
      )
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const AccountServiceInstance = new AccountService()
