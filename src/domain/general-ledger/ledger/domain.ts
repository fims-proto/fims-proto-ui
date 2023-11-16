import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Ledger } from './types'
import { LEDGER_FIELDS_CONVERSION } from '../field-conversion-types'

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
}

export const LedgerServiceInstance = new LedgerService()
