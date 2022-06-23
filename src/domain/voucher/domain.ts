import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler, Response } from '../errorHandler'
import { Page, Pageable } from '../types'
import { LineItem, NewVoucher, Voucher } from './types'

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
  public async getAllVouchers(sobId: string, pageable: Pageable = { page: 1 }): Promise<Response<Page<Voucher>>> {
    let url = `${FIMS_URL}/api/v1/sob/${sobId}/vouchers/?$sort=createdAt&$page=${pageable.page}`
    if (pageable.size) {
      url = `${url}&$size=${pageable.size}`
    }

    return invokeWithErrorHandler(async () => {
      const result = await axios.get(url)
      convertFieldsFromString(result.data.content, FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getVoucherById(sobId: string, voucherId: string): Promise<Response<Voucher>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}`)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async createVoucher(sobId: string, voucher: NewVoucher): Promise<Response<Voucher>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers/`, voucher)
      return convertFieldsFromString(result.data, FIELDS_CONVERSION)
    })
  }

  public async updateVoucher(
    sobId: string,
    voucherId: string,
    transactionTime: Date,
    lineItems: LineItem[]
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}`, {
        transactionTime: transactionTime,
        lineItems: lineItems,
      })
    })
  }

  public async auditVoucher(sobId: string, voucherId: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}/audit`, {
        auditor,
      })
    })
  }

  public async cancelAuditVoucher(sobId: string, voucherId: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}/cancel-audit`, {
        auditor,
      })
    })
  }

  public async reviewVoucher(sobId: string, voucherId: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}/review`, {
        reviewer,
      })
    })
  }

  public async cancelReviewVoucher(sobId: string, voucherId: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${voucherId}/cancel-review`, {
        reviewer,
      })
    })
  }
}

export const VoucherServiceInstance = new VoucherService()
