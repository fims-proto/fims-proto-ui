import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Period, type PreCloseCheck } from './types'
import { PERIOD_FIELDS_CONVERSION, PRE_CLOSE_CHECK_FIELDS_CONVERSION } from '../field-conversion-types'

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

  public async getPreCloseCheck(sobId: string, periodId: string): Promise<Response<PreCloseCheck>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/pre-close-check`)
      convertFieldsFromString(result.data, PRE_CLOSE_CHECK_FIELDS_CONVERSION)
      return result.data
    })
  }
}

export const PeriodServiceInstance = new PeriodService()
