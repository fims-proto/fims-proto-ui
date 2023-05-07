import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../date-type-converter'
import { invokeWithErrorHandler, Response } from '../../error-handler'
import { FieldConversionRecord, Page, Pageable } from '../../types'
import { Period } from './types'

const FIELDS_CONVERSION: FieldConversionRecord = {
  fiscalYear: 'number',
  number: 'number',
  openingTime: 'date',
  endingTime: 'date',
  createdAt: 'date',
  updatedAt: 'date',
}

class PeriodService {
  public async getPeriods(sobId: string, pageable: Pageable = { page: 1, size: 10 }): Promise<Response<Page<Period>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/periods?$sort=openingTime desc&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getOpenPeriod(sobId: string): Promise<Response<Period>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/periods/current`)
      convertFieldsFromString(result.data, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async closePeriod(sobId: string, periodId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(
      async () => await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/period/${periodId}/close`)
    )
  }
}

export const PeriodServiceInstance = new PeriodService()
