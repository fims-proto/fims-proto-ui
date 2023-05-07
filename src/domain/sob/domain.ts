import axios from 'axios'
import { NewSob, Sob } from './types'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, Response } from '../error-handler'
import { convertFieldsFromString } from '../date-type-converter'
import { FieldConversionRecord, Page } from '../types'

const FIELDS_CONVERSION: FieldConversionRecord = {
  startingPeriodYear: 'number',
  startingPeriodMonth: 'number',
  accountsCodeLength: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class SobService {
  public async getAllSods(): Promise<Response<Page<Sob>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs`)
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async createSob(newSob: NewSob): Promise<Response<Sob>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sobs`, newSob)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async getSobById(sobId: string): Promise<Response<Sob>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/${sobId}`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const SobServiceInstance = new SobService()
