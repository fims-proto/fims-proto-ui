import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../date-type-converter'
import { invokeWithErrorHandler, Response } from '../../error-handler'
import { FieldConversionRecord, Page, Pageable } from '../../types'
import { Ledger } from './types'

const FIELDS_CONVERSION: FieldConversionRecord = {
  openingBalance: 'number',
  endingBalance: 'number',
  periodDebit: 'number',
  periodCredit: 'number',
  acount: {
    level: 'number',
    createdAt: 'date',
    updatedAt: 'date',
  },
  createdAt: 'date',
  updatedAt: 'date',
}

class LedgerService {
  public async getLedgersInPeriod(
    sobId: string,
    periodId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Ledger>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/ledgers?$sort=account.accountNumber&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }
}

export const LedgerServiceInstance = new LedgerService()
