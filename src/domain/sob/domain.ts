import axios from 'axios'
import { NewSob, Sob } from './types'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'
import { convertFieldsFromString } from '../dateTypeConverter'

const FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  startingPeriodYear: 'number',
  startingPeriodMonth: 'number',
  accountsCodeLength: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class SobService {
  public async getAllSods(): Promise<Sob[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async createSob(newSob: NewSob): Promise<Sob> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sobs/`, convertFieldsFromString(newSob, FIELDS_CONVERSION))
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async getSobById(sobId: string): Promise<Sob> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/${sobId}`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const SobServiceInstance = new SobService()
