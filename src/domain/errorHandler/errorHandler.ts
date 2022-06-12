import { AxiosError } from 'axios'
import { useNotificationStore } from '../../store/notification'
import { Response, SlugError } from './types'

export async function invokeWithErrorHandler<T>(invoker: () => Promise<T>): Promise<Response<T>> {
  try {
    return { data: await invoker() }
  } catch (error) {
    if ((error as AxiosError).response) {
      // server response
      const slugErr = (error as AxiosError).response?.data as SlugError
      generalErrorHandler(slugErr)
      return { exception: slugErr }
    }

    if ((error as AxiosError).request) {
      // request did not send out
      console.error('Unexpected client error', (error as AxiosError).toJSON())
      throw error
    }

    // unknown exception
    console.error('Unexpected unknown error', (error as Error).message)
    throw error
  }
}

function generalErrorHandler(exception: SlugError) {
  useNotificationStore().action.push({
    type: 'error',
    message: exception.message,
    duration: 0,
  })
}
