import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertAccountNumberFields, convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { useSobStore } from '../../../store/sob'
import { type Period, type PreCloseCheck, type BatchPreCloseCheck, type PeriodCloseWarning } from './types'
import {
  PERIOD_FIELDS_CONVERSION,
  PRE_CLOSE_CHECK_AN_CONVERSION,
  PRE_CLOSE_CHECK_FIELDS_CONVERSION,
  BATCH_PRE_CLOSE_CHECK_FIELDS_CONVERSION,
} from '../field-conversion-types'

class PeriodService {
  public async getPeriods(sobId: string): Promise<Response<Period[]>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods?$sort=fiscalYear desc,periodNumber desc`)
      convertFieldsFromString(result.data, PERIOD_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async closePeriod(sobId: string, periodId: string): Promise<Response<PeriodCloseWarning | null>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/close`)
      return result.data ? (result.data as PeriodCloseWarning) : null
    })
  }

  public async getPreCloseCheck(sobId: string, periodId: string): Promise<Response<PreCloseCheck>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/pre-close-check`)

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, PRE_CLOSE_CHECK_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, PRE_CLOSE_CHECK_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async getBatchPreCloseCheck(sobId: string, targetPeriod: string): Promise<Response<BatchPreCloseCheck>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/batch-pre-close-check`, {
        params: { targetPeriod },
      })
      convertFieldsFromString(result.data, BATCH_PRE_CLOSE_CHECK_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async batchClosePeriods(sobId: string, targetPeriod: string): Promise<Response<PeriodCloseWarning | null>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/periods/batch-close`, null, {
        params: { targetPeriod },
      })
      return result.data ? (result.data as PeriodCloseWarning) : null
    })
  }
}

export const PeriodServiceInstance = new PeriodService()
