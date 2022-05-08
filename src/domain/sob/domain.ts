import axios from 'axios'
import { NewSob, Sob } from './types'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'

class SobService {
  public async getAllSods(): Promise<Sob[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/`)
      return result.data
    })
  }

  public async createSob(newSob: NewSob): Promise<Sob> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sobs/`, newSob)
      return result.data
    })
  }

  public async getSobById(sobId: string): Promise<Sob> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/${sobId}`)
      return result.data
    })
  }
}

export const SobServiceInstance = new SobService()
