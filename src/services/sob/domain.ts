import axios from 'axios'
import { type NewSob, type Sob, type UpdateSob } from './types'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../field-conversion'
import type { FieldConversionRecord, Page, Pageable } from '@/services/types'
import { invokeWithErrorHandler, type Response } from '@/services/error-handler'
import type { Filter } from '../filter'

const FIELDS_CONVERSION: FieldConversionRecord = {
  startingPeriodYear: 'number',
  startingPeriodMonth: 'number',
  accountsCodeLength: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class SobService {
  public async searchSobs(
    pageable: Pageable = { page: 1, size: 10 },
    filterable?: Filter<Sob>,
  ): Promise<Response<Page<Sob>>> {
    const filterContent = filterable?.apiFilterString()
    const filterStr = filterContent && filterContent != 'true' ? `&$filter=${filterContent}` : ''
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sobs?$sort=createdAt desc&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getSobById(sobId: string): Promise<Response<Sob>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/${sobId}`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async createSob(newSob: NewSob): Promise<Response<Sob>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sobs`, newSob)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async updateSob(sobId: string, sob: UpdateSob): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.patch(`${FIMS_URL}/api/v1/sobs/${sobId}`, sob)
    })
  }
}

export const SobServiceInstance = new SobService()
