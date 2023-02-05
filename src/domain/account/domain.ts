import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler, Response } from '../errorHandler'
import { FieldConversionRecord, Page, Pageable } from '../types'
import { Account, Ledger, Period } from './types'

const ACCOUNT_FIELDS: FieldConversionRecord = {
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

const LEDGER_FIELDS: FieldConversionRecord = {
  openingBalance: 'number',
  endingBalance: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  acount: ACCOUNT_FIELDS,
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
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts/?$sort=accountNumber&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, ACCOUNT_FIELDS)
      return result.data
    })
  }

  public async getAccountByAccountNumber(sobId: string, accountNumber: string): Promise<Response<Account>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts/?$filter=accountNumber eq '${accountNumber}'`
      )
      convertFieldsFromString(result.data.content, ACCOUNT_FIELDS)

      if (result.data.numberOfElements !== 1) {
        throw 'result not unique'
      }

      return result.data.content[0]
    })
  }

  public async getAccountsStartsWithNumber(sobId: string, serachNumber: string): Promise<Response<Page<Account>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/accounts/?$filter=accountNumber startsWith ${serachNumber}&$sort=accountNumber`
      )
      return convertFieldsFromString(result.data, ACCOUNT_FIELDS)
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

  public async getOpenPeriod(sobId: string): Promise<Response<Period>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/open-period`)
      convertFieldsFromString(result.data, PERIOD_FIELDS)
      return result.data
    })
  }

  public async getLedgersInPeriod(
    sobId: string,
    periodId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Ledger>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers/?$sort=account.accountNumber&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, LEDGER_FIELDS)
      return result.data
    })
  }
}

export const AccountServiceInstance = new AccountService()
