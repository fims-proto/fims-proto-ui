import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Period } from './types'
import { PERIOD_FIELDS_CONVERSION } from '../field-conversion-types'

class PeriodService {
  public async getPeriods(sobId: string, pageable: Pageable = { page: 1, size: 10 }): Promise<Response<Page<Period>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/periods?$sort=fiscalYear desc,periodNumber desc&$page=${pageable.page}&$size=${pageable.size}`,
      )
      convertFieldsFromString(result.data.content, PERIOD_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getOpenPeriod(sobId: string): Promise<Response<Period>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/current`)
      convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async closePeriod(sobId: string, periodId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(
      async () => await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/close`),
    )
  }
}

export const PeriodServiceInstance = new PeriodService()
