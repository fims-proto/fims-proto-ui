import axios, { AxiosError } from 'axios'
import { NewSob, Sob } from './types'
import { FIMS_URL } from '../../config'
import { SlugError } from '../../types'

class SobService {
  public async getAllSods(): Promise<Sob[]> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/`)
      return result.data
    })
  }

  public async createSob(newSob: NewSob): Promise<Sob> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sobs/`, newSob)
      return result.data
    })
  }

  public async getSobById(sobId: string): Promise<Sob> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sobs/${sobId}`)
      return result.data
    })
  }

  private invokeWithErrorHandler(invoker: { (): Promise<any>; (): any }) {
    try {
      return invoker()
    } catch (error) {
      console.error(error)
      throw new Error(((error as AxiosError).response?.data as SlugError).slug)
    }
  }
}

export const SobServiceInstance = new SobService()