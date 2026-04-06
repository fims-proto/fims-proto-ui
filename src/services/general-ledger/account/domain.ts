import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertAccountNumberFields, convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { useSobStore } from '../../../store/sob'
import {
  type AccountClass,
  type AccountSlim,
  type AccountDetail,
  type UpdateAccount,
  type CreateAccount,
} from './types'
import {
  ACCOUNT_AN_CONVERSION,
  ACCOUNT_FIELDS_CONVERSION,
  CREATE_ACCOUNT_REQUEST_AN_CONVERSION,
} from '../field-conversion-types'

class AccountService {
  public async getClasses(sobId: string): Promise<Response<AccountClass[]>> {
    return invokeWithErrorHandler(async () => {
      return (await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account-classes`)).data
    })
  }

  public async getAccounts(sobId: string): Promise<Response<AccountSlim[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/accounts`)

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, ACCOUNT_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async getAccountById(sobId: string, id: string): Promise<Response<AccountDetail>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/account/${id}`)

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, ACCOUNT_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async createAccount(sobId: string, account: CreateAccount): Promise<Response<AccountDetail>> {
    return invokeWithErrorHandler(async () => {
      // Make a copy to avoid mutating the input
      const accountCopy = { ...account }
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertAccountNumberFields(accountCopy, CREATE_ACCOUNT_REQUEST_AN_CONVERSION, codeLengths)

      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/accounts`, accountCopy)

      convertFieldsFromString(result.data, ACCOUNT_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, ACCOUNT_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async updateAccount(sobId: string, accountId: string, account: UpdateAccount): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/account/${accountId}`, account)
    })
  }

  public async deleteAccount(sobId: string, accountId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.delete(`${FIMS_URL}/api/v1/sob/${sobId}/account/${accountId}`)
    })
  }
}

export const AccountServiceInstance = new AccountService()
