import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import {
  type AccountClass,
  type AccountSlim,
  type AccountDetail,
  type UpdateAccount,
  type CreateAccount,
} from './types'
import { ACCOUNT_FIELDS_CONVERSION } from '../field-conversion-types'

class AccountService {
  public async getClasses(sobId: string): Promise<Response<AccountClass[]>> {
    return invokeWithErrorHandler(async () => {
      return (await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account-classes`)).data
    })
  }

  public async getAccounts(sobId: string): Promise<Response<AccountSlim[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts`)
      convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getAccountById(sobId: string, id: string): Promise<Response<AccountDetail>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account/${id}`)
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
    })
  }

  public async createAccount(sobId: string, account: CreateAccount): Promise<Response<AccountDetail>> {
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
}

export const AccountServiceInstance = new AccountService()
