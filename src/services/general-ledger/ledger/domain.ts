import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import type { Page, Pageable } from '../../types'
import {
  type InitializeLedgersRequest,
  type Ledger,
  type PeriodAndLedgers,
  type LedgerSummary,
  type LedgerEntry,
  type AuxiliaryLedgerSummary,
} from './types'
import {
  LEDGER_FIELDS_CONVERSION,
  PERIOD_FIELDS_CONVERSION,
  LEDGER_ENTRY_FIELDS_CONVERSION,
  AUXILIARY_LEDGER_FIELDS_CONVERSION,
} from '../field-conversion-types'

class LedgerService {
  public async getLedgers(sobId: string, fromPeriod: string, toPeriod: string): Promise<Response<Ledger[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledgers?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}`,
      )
      convertFieldsFromString(result.data, LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getFirstPeriodLedgers(sobId: string): Promise<Response<PeriodAndLedgers>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/first-period/ledgers`)
      convertFieldsFromString(result.data['period'], PERIOD_FIELDS_CONVERSION)
      convertFieldsFromString(result.data['ledgers'], LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async initializeLedgers(sobId: string, request: InitializeLedgersRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/ledgers/initialize`, request)
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
    auxiliaryAccountId?: string,
  ): Promise<Response<Page<LedgerEntry>>> {
    return invokeWithErrorHandler(async () => {
      const auxiliaryParam = auxiliaryAccountId ? `&auxiliaryAccountId=${auxiliaryAccountId}` : ''
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledger/${accountId}/entries?fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&$page=${pageable.page}&$size=${pageable.size}${auxiliaryParam}`,
      )
      convertFieldsFromString(result.data.content, LEDGER_ENTRY_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getAuxiliaryLedgerSummary(
    sobId: string,
    accountId: string,
    categoryKey: string,
    fromPeriod: string,
    toPeriod: string,
    pageable: Pageable = { page: 1, size: 40 },
  ): Promise<Response<Page<AuxiliaryLedgerSummary>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/ledger/${accountId}/auxiliary?categoryKey=${categoryKey}&fromPeriod=${fromPeriod}&toPeriod=${toPeriod}&$page=${pageable.page}&$size=${pageable.size}`,
      )
      convertFieldsFromString(result.data.content, AUXILIARY_LEDGER_FIELDS_CONVERSION)
      return result.data
    })
  }
}

export const LedgerServiceInstance = new LedgerService()
