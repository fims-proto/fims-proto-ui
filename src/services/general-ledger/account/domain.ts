import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { FilterFactory } from '../../filter'
import {
  type AccountClass,
  type Account,
  type AuxiliaryAccount,
  type AuxiliaryCategory,
  type CreateAuxiliaryAccount,
  type CreateAuxiliaryCategory,
  type UpdateAccount,
  type CreateAccount,
} from './types'
import { ACCOUNT_FIELDS_CONVERSION, AUXILIARY_FIELDS_CONVERSION } from '../field-conversion-types'

class AccountService {
  public async getClasses(sobId: string): Promise<Response<AccountClass[]>> {
    return invokeWithErrorHandler(async () => {
      return (await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account-classes`)).data
    })
  }

  public async getAccounts(sobId: string): Promise<Response<Account[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts`)
      convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getAccountById(sobId: string, id: string): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account/${id}`)
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
    })
  }

  public async createAccount(sobId: string, account: CreateAccount): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/accounts`, account)
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
    })
  }

  public async updateAccount(sobId: string, accountId: string, account: UpdateAccount): Promise<Response<void>> {
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
        `${FIMS_URL}/api/v1/sob/${sobId}/auxiliaries?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}`,
      )
      return convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)
    })
  }

  public async getAuxiliaryCategoryByKey(sobId: string, categoryKey: string): Promise<Response<AuxiliaryCategory>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}`)
      return convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)
    })
  }

  public async getAuxiliaryAccounts(
    sobId: string,
    categoryKey: string,
    pageable: Pageable = { page: 1, size: 10 },
    searchQuery?: string,
  ): Promise<Response<Page<AuxiliaryAccount>>> {
    return invokeWithErrorHandler(async () => {
      const factory = new FilterFactory<AuxiliaryAccount>()
      const filter = searchQuery
        ? factory.or(factory.ctn('key', searchQuery), factory.ctn('title', searchQuery))
        : undefined
      const filterStr = filter ? `&$filter=${filter.apiFilterString()}` : ''
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}/accounts?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      return convertFieldsFromString(result.data, AUXILIARY_FIELDS_CONVERSION)
    })
  }

  public async createAuxiliaryCategory(sobId: string, category: CreateAuxiliaryCategory): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/auxiliaries`, category)
    })
  }

  public async createAuxiliaryAccount(
    sobId: string,
    categoryKey: string,
    account: CreateAuxiliaryAccount,
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/auxiliary/${categoryKey}/accounts`, account)
    })
  }
}

export const AccountServiceInstance = new AccountService()
