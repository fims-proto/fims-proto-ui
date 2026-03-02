import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type InitializeLedgersRequest, type Ledger, type PeriodAndLedgers } from './types'
import { LEDGER_FIELDS_CONVERSION, PERIOD_FIELDS_CONVERSION } from '../field-conversion-types'

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
}

export const LedgerServiceInstance = new LedgerService()
