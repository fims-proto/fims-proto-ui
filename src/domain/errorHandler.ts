import { AxiosError } from 'axios'
import { SlugError } from './types'

export async function invokeWithErrorHandler<T>(invoker: () => Promise<T>): Promise<T> {
  try {
    return await invoker()
  } catch (error) {
    console.error(error)
    throw new Error(((error as AxiosError).response?.data as SlugError).slug)
  }
}
