import { AxiosError } from 'axios'
import { type SlugError, type Response } from './types'
import { useToastStore } from '@/store/toast'
import i18n from '@/i18n'

export async function invokeWithErrorHandler<T>(
  invoker: () => Promise<T>,
  errorExtractor: (e: AxiosError) => SlugError = generalErrorExtractor,
): Promise<Response<T>> {
  try {
    return { data: await invoker() }
  } catch (error) {
    if ((error as AxiosError).response) {
      // server response
      const slugError = errorExtractor(error as AxiosError)
      notify(slugError)
      return { exception: slugError }
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

function generalErrorExtractor(error: AxiosError): SlugError {
  return error.response?.data as SlugError
}

function notify(slugError: SlugError) {
  useToastStore().action.error(i18n.global.t('common.requestFailed'), {
    description: slugError.message,
  })
}
