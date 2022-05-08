import axios from 'axios'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler } from '../errorHandler'
import { Voucher } from './types'

class VoucherService {
  public async getAllVouchersBySod(sobId: string): Promise<Voucher[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers/`)
      return result.data
    })
  }
}

export const VoucherServiceInstance = new VoucherService()
