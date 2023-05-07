import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../date-type-converter'
import { invokeWithErrorHandler, Response } from '../../error-handler'
import { FieldConversionRecord, Page, Pageable } from '../../types'
import { LineItem, Voucher, NewVoucher } from './types'

const ITEM_FIELDS: FieldConversionRecord = {
  credit: 'number',
  debit: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

const VOUCHER_FIELDS: FieldConversionRecord = {
  attachmentQuantity: 'number',
  credit: 'number',
  debit: 'number',
  transactionTime: 'date',
  lineItems: ITEM_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}

class VoucherService {
  public async getVouchers(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<Voucher>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/vouchers?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, VOUCHER_FIELDS)
      return result.data
    })
  }

  public async getVoucherById(sobId: string, id: string): Promise<Response<Voucher>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}`)
      return convertFieldsFromString(result.data, VOUCHER_FIELDS)
    })
  }

  public async createVoucher(sobId: string, voucher: NewVoucher): Promise<Response<Voucher>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers`, voucher)
      return convertFieldsFromString(result.data, VOUCHER_FIELDS)
    })
  }

  public async updateVoucher(
    sobId: string,
    id: string,
    headerText: string,
    transactionTime: Date,
    lineItems: LineItem[],
    updater: string
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}`, {
        headerText: headerText,
        transactionTime: transactionTime,
        lineItems: lineItems,
        updater: updater,
      })
    })
  }

  public async auditVoucher(sobId: string, id: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}/audit`, {
        auditor,
      })
    })
  }

  public async cancelAuditVoucher(sobId: string, id: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}/cancel-audit`, {
        auditor,
      })
    })
  }

  public async reviewVoucher(sobId: string, id: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}/review`, {
        reviewer,
      })
    })
  }

  public async cancelReviewVoucher(sobId: string, id: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}/cancel-review`, {
        reviewer,
      })
    })
  }

  public async postVoucher(sobId: string, id: string, poster: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}/post`, {
        poster,
      })
    })
  }
}

export const VoucherServiceInstance = new VoucherService()
