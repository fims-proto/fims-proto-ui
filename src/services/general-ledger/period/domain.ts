import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Period } from './types'
import { PERIOD_FIELDS_CONVERSION } from '../field-conversion-types'

class PeriodService {
  public async getPeriods(sobId: string): Promise<Response<Period[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods?$sort=fiscalYear desc,periodNumber desc`)
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
