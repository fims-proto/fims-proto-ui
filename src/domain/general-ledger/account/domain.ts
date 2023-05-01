import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../date-type-converter'
import { invokeWithErrorHandler, Response } from '../../error-handler'
import { FieldConversionRecord, Page, Pageable } from '../../types'
import { Account } from './types'

const FIELDS_CONVERSION: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class AccountService {
  public async getAccounts(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$sort=accountNumber&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getAccountByAccountNumber(sobId: string, accountNumber: string): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$filter=accountNumber eq '${accountNumber}'`
      )
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)

      if (result.data.numberOfElements !== 1) {
        throw 'result not unique'
      }

      return result.data.content[0]
    })
  }

  public async getAccountsStartsWithNumber(sobId: string, serachNumber: string): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$filter=accountNumber startsWith ${serachNumber}&$sort=accountNumber`
      )
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const AccountServiceInstance = new AccountService()
