import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Ledger, type PeriodAndLedgers } from './types'
import { LEDGER_FIELDS_CONVERSION, PERIOD_FIELDS_CONVERSION } from '../field-conversion-types'

class LedgerService {
  public async getLedgersInPeriod(
    sobId: string,
    periodId: string,
    pageable: Pageable = { page: 1, size: 10 },
  ): Promise<Response<Page<Ledger>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers?$sort=account.accountNumber&$page=${pageable.page}&$size=${pageable.size}`,
      )
      convertFieldsFromString(result.data.content, LEDGER_FIELDS_CONVERSION)
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
}

export const LedgerServiceInstance = new LedgerService()
