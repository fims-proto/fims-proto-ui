import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../date-type-converter'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type FieldConversionRecord, type Page, type Pageable } from '../../types'
import { type Account, type AuxiliaryCategory } from './types'

const ACCOUNT_FIELDS_CONVERSION: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

const AUXILIARY_CATEGORY_FIELDS_CONVERSION: FieldConversionRecord = {
  createdAt: 'date',
  updatedAt: 'date',
}

class AccountService {
  public async getAccounts(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
  ): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$sort=accountNumber&$page=${pageable.page}&$size=${pageable.size}`,
      )
      convertFieldsFromString(result.data.content, ACCOUNT_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getAccountById(sobId: string, id: string): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account/${id}`)
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
    })
  }

  public async getAccountByAccountNumber(sobId: string, accountNumber: string): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$filter=accountNumber eq '${accountNumber}'`,
      )
      convertFieldsFromString(result.data.content, ACCOUNT_FIELDS_CONVERSION)

      if (result.data.numberOfElements !== 1) {
        throw 'result not unique'
      }

      return result.data.content[0]
    })
  }

  public async getAccountsStartsWithNumber(sobId: string, serachNumber: string): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$filter=accountNumber startsWith ${serachNumber}&$sort=accountNumber`,
      )
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
    })
  }

  public async getAuxiliaryCategories(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
  ): Promise<Response<Page<AuxiliaryCategory>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/auxiliaries?$page=${pageable.page}&$size=${pageable.size}`,
      )
      return convertFieldsFromString(result.data, AUXILIARY_CATEGORY_FIELDS_CONVERSION)
    })
  }
}

export const AccountServiceInstance = new AccountService()
