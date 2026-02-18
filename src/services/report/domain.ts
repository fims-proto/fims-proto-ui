import axios from 'axios'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import type { Page, Pageable } from '../types'
import type { GenerateReportRequest, Report, UpdateReportRequest, UpdateReportResponse } from './types'
import { convertFieldsFromString } from '../field-conversion'
import { REPORT_FIELDS_CONVERSION } from './field-conversion-types'
import type { Filter } from '@/services/filter'

class ReportService {
  public async getReports(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
    filterable?: Filter<Report>,
  ): Promise<Response<Page<Report>>> {
    const filterContent = filterable?.apiFilterString()
    const filterStr = filterContent && filterContent != 'true' ? `&$filter=${filterContent}` : ''
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/reports?$sort=updatedAt desc&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      convertFieldsFromString(result.data.content, REPORT_FIELDS_CONVERSION)
      return result.data
    })
  }

  public async getReportById(sobId: string, id: string): Promise<Response<Report>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/report/${id}`)
      return convertFieldsFromString(result.data, REPORT_FIELDS_CONVERSION)
    })
  }

  public async generateReport(
    sobId: string,
    templateId: string,
    request: GenerateReportRequest,
  ): Promise<Response<Report>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/report/${templateId}/generate`, request)
      return convertFieldsFromString(result.data, REPORT_FIELDS_CONVERSION)
    })
  }

  public async regenerateReport(sobId: string, reportId: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/report/${reportId}/regenerate`)
    })
  }

  public async updateReport(
    sobId: string,
    reportId: string,
    request: UpdateReportRequest,
  ): Promise<Response<UpdateReportResponse>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/report/${reportId}`, request)
      return result.data
    })
  }
}

export const ReportServiceInstance = new ReportService()
