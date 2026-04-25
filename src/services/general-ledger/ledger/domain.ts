import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertAccountNumberFields, convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { useSobStore } from '../../../store/sob'
import type { Page, Pageable } from '../../types'
import {
  type InitializeLedgersRequest,
  type Ledger,
  type PeriodAndLedgers,
  type LedgerSummary,
  type LedgerEntry,
  type LedgerDimensionSummaryItem,
} from './types'
import {
  LEDGER_FIELDS_CONVERSION,
  PERIOD_FIELDS_CONVERSION,
  LEDGER_ENTRY_FIELDS_CONVERSION,
  INITIALIZE_LEDGER_REQUEST_AN_CONVERSION,
  LEDGER_AN_CONVERSION,
} from '../field-conversion-types'

class LedgerService {
  public async getLedgers(sobId: string, fromPeriod: string, toPeriod: string): Promise<Response<Ledger[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledgers?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}`,
      )

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, LEDGER_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, LEDGER_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async getFirstPeriodLedgers(sobId: string): Promise<Response<PeriodAndLedgers>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/first-period/ledgers`)

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data['period'], PERIOD_FIELDS_CONVERSION)
      convertFieldsFromString(result.data['ledgers'], LEDGER_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data['ledgers'], LEDGER_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async initializeLedgers(sobId: string, request: InitializeLedgersRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // Make a copy to avoid mutating the input
      const requestCopy = JSON.parse(JSON.stringify(request))
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertAccountNumberFields(requestCopy, INITIALIZE_LEDGER_REQUEST_AN_CONVERSION, codeLengths)

      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/ledgers/initialize`, requestCopy)
    })
  }

  public async getLedgerSummary(
    sobId: string,
    accountId: string,
    fromPeriod: string,
    toPeriod: string,
  ): Promise<Response<LedgerSummary>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledger/${accountId}?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}`,
      )
      convertFieldsFromString(result.data, LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getLedgerEntries(
    sobId: string,
    accountId: string,
    fromPeriod: string,
    toPeriod: string,
    pageable: Pageable = { page: 1, size: 40 },
    dimensionOptionId?: string,
  ): Promise<Response<Page<LedgerEntry>>> {
    return invokeWithErrorHandler(async () => {
      const dimParam = dimensionOptionId ? `&dimensionOptionId=${dimensionOptionId}` : ''
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledger/${accountId}/entries?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&$page=${pageable.page}&$size=${pageable.size}${dimParam}`,
      )
      convertFieldsFromString(result.data.content, LEDGER_ENTRY_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getDimensionSummary(
    sobId: string,
    accountId: string,
    dimensionCategoryId: string,
    fromPeriod: string,
    toPeriod: string,
  ): Promise<Response<Page<LedgerDimensionSummaryItem>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledgers/${accountId}/dimension/${dimensionCategoryId}?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}`,
      )
      convertFieldsFromString(result.data.content, LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getLedgersPage(
    sobId: string,
    fromPeriod: string,
    toPeriod: string,
    dimensionOptionId?: string,
    pageable: Pageable = { page: 1, size: 40 },
  ): Promise<Response<Page<Ledger>>> {
    return invokeWithErrorHandler(async () => {
      const dimParam = dimensionOptionId ? `&dimensionOptionId=${dimensionOptionId}` : ''
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledgers?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&$page=${pageable.page}&$size=${pageable.size}${dimParam}`,
      )
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data.content, LEDGER_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data.content, LEDGER_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async getTransactions(
    sobId: string,
    fromPeriod: string,
    toPeriod: string,
    accountId?: string,
    dimensionOptionId?: string,
    pageable: Pageable = { page: 1, size: 40 },
  ): Promise<Response<Page<LedgerEntry>>> {
    return invokeWithErrorHandler(async () => {
      const params = new URLSearchParams({
        fromPeriod,
        toPeriod,
        $page: String(pageable.page),
        $size: String(pageable.size),
      })
      if (accountId) params.set('accountId', accountId)
      if (dimensionOptionId) params.set('dimensionOptionId', dimensionOptionId)
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/ledgers/transactions?${params}`)
      convertFieldsFromString(result.data.content, LEDGER_ENTRY_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getDimensionOptions(
    sobId: string,
    dimensionCategoryId: string,
    fromPeriod: string,
    toPeriod: string,
    accountId?: string,
    pageable: Pageable = { page: 1, size: 40 },
  ): Promise<Response<Page<LedgerDimensionSummaryItem>>> {
    return invokeWithErrorHandler(async () => {
      const params = new URLSearchParams({
        fromPeriod,
        toPeriod,
        $page: String(pageable.page),
        $size: String(pageable.size),
      })
      if (accountId) params.set('accountId', accountId)
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledgers/dimension-category/${dimensionCategoryId}/options?${params}`,
      )
      convertFieldsFromString(result.data.content, LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }
}

export const LedgerServiceInstance = new LedgerService()
