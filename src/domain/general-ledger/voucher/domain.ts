import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Voucher, type CreateVoucherRequest, type UpdateVoucherRequest } from './types'
import { VOUCHER_FIELDS } from '../field-conversion-types'

class VoucherService {
  public async getVouchers(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
  ): Promise<Response<Page<Voucher>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/vouchers?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}`,
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

  public async createVoucher(sobId: string, voucher: CreateVoucherRequest): Promise<Response<Voucher>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/vouchers`, voucher)
      return convertFieldsFromString(result.data, VOUCHER_FIELDS)
    })
  }

  public async updateVoucher(sobId: string, id: string, voucher: UpdateVoucherRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/voucher/${id}`, voucher)
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
