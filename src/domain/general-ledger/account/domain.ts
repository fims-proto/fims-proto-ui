import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Filter } from '../../filter-factory'
import {
  type AccountClass,
  type Account,
  type AuxiliaryAccount,
  type AuxiliaryCategory,
  type CreateAuxiliaryAccountRequest,
  type CreateAuxiliaryCategoryRequest,
  type UpdateAccountRequest,
} from './types'
import { ACCOUNT_FIELDS_CONVERSION, AUXILIARY_FIELDS_CONVERSION } from '../field-conversion-types'

class AccountService {
  public async getClasses(sobId: string): Promise<Response<AccountClass[]>> {
    return invokeWithErrorHandler(async () => {
      return (await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account-classes`)).data
    })
  }

  public async getAccounts(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
    filterable?: Filter<Account>,
  ): Promise<Response<Page<Account>>> {
    const filterContent = filterable?.apiFilterString()
    const filterStr = filterContent && filterContent != 'true' ? `&$filter=${filterContent}` : ''
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts?$sort=accountNumber&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
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

  public async updateAccount(sobId: string, accountId: string, account: UpdateAccountRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/account/${accountId}`, account)
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
      return convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)
    })
  }

  public async getAuxiliaryAccounts(
    sobId: string,
    categoryKey: string,
    pageable: Pageable = { page: 1, size: 10 },
  ): Promise<Response<Page<AuxiliaryAccount>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}/accounts?$page=${pageable.page}&$size=${pageable.size}`,
      )
      return convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)
    })
  }

  public async getAuxiliaryAccountByKey(
    sobId: string,
    categoryKey: string,
    accountKey: string,
  ): Promise<Response<AuxiliaryAccount>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}/accounts?$filter=key eq '${accountKey}'`,
      )
      convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)

      if (result.data.numberOfElements !== 1) {
        throw 'result not unique'
      }

      return result.data.content[0]
    })
  }

  public async createAuxiliaryCategory(
    sobId: string,
    category: CreateAuxiliaryCategoryRequest,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/auxiliaries`, category)
    })
  }

  public async createAuxiliaryAccount(
    sobId: string,
    categoryKey: string,
    account: CreateAuxiliaryAccountRequest,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}/accounts`, account)
    })
  }
}

export const AccountServiceInstance = new AccountService()
