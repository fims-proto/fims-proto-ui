import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler, Response } from '../errorHandler'
import { FieldConversionRecord, Page, Pageable } from '../types'
import { Account, AccountConfiguration, Period } from './types'

const CONFIGURATION_FIELDS: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

const PERIOD_FIELDS: FieldConversionRecord = {
  financialYear: 'number',
  number: 'number',
  openingTime: 'date',
  endingTime: 'date',
  createdAt: 'date',
  updatedAt: 'date',
}

const ACCOUNT_FIELDS: FieldConversionRecord = {
  openingBalance: 'number',
  endingBalance: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  configuration: CONFIGURATION_FIELDS,
  period: PERIOD_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}

class AccountService {
  public async getAccountConfigurations(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<AccountConfiguration>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/account-configurations/?$sort=accountNumber&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, CONFIGURATION_FIELDS)
      return result.data
    })
  }

  public async getAccountConfigurationByAccountNumber(
    sobId: string,
    accountNumber: string
  ): Promise<Response<AccountConfiguration>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/account-configurations/?$filter=accountNumber eq '${accountNumber}'`
      )
      convertFieldsFromString(result.data.content, CONFIGURATION_FIELDS)

      if (result.data.numberOfElements !== 1) {
        throw 'result not unique'
      }

      return result.data.content[0]
    })
  }

  public async getAccountConfigurationsStartsWithNumber(
    sobId: string,
    serachNumber: string
  ): Promise<Response<Page<AccountConfiguration>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/account-configurations/?$filter=accountNumber startsWith ${serachNumber}&$sort=accountNumber`
      )
      return convertFieldsFromString(result.data, CONFIGURATION_FIELDS)
    })
  }

  public async getPeriods(sobId: string, pageable: Pageable = { page: 1, size: 10 }): Promise<Response<Page<Period>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/periods/?$sort=openingTime desc&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, PERIOD_FIELDS)
      return result.data
    })
  }

  public async getOpenPeriod(sobId: string, pageable: Pageable = { page: 1, size: 1 }): Promise<Response<Period>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/periods/?$filter=isClosed eq false&$page=${pageable.page}&$size=${pageable.size}`
      )
      if (result.data.numberOfElements === 1) {
        convertFieldsFromString(result.data.content[0], PERIOD_FIELDS)
        return result.data.content[0]
      }

      throw `${result.data.numberOfElements} period found`
    })
  }

  public async getAccountsInPeriod(
    sobId: string,
    periodId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/accounts/?$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, ACCOUNT_FIELDS)
      return result.data
    })
  }
}

export const AccountServiceInstance = new AccountService()
