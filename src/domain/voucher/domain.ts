import axios, { AxiosError } from 'axios'
import { FIMS_URL } from '../../config'
import { SlugError } from '../../types'
import { Voucher } from './types'

class VoucherService {
  public async getAllVouchersBySod(sobId: string): Promise<Voucher[]> {
    return this.invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers/`)
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

export const VoucherServiceInstance = new VoucherService()