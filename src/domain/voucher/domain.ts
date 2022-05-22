import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler } from '../errorHandler'
import { NewVoucher, Voucher } from './types'

const FIELDS_CONVERSION: Record<string, 'number' | 'date'> = {
  attachmentQuantity: 'number',
  credit: 'number',
  debit: 'number',
  transactionTime: 'date',
  'lineItems.credit': 'number',
  'lineItems.debit': 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

class VoucherService {
  public async getAllVouchersBySod(sobId: string): Promise<Voucher[]> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers/`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async getVoucherById(sobId: string, voucherId: string): Promise<Voucher> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async createVoucher(sobId: string, voucher: NewVoucher): Promise<Voucher> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers/`, voucher)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }
}

export const VoucherServiceInstance = new VoucherService()
