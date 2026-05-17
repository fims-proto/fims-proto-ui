import axios from 'axios'
import { FIMS_URL } from '../../config'
import { invokeWithErrorHandler, type Response } from '../error-handler'
import { useSobStore } from '../../store/sob'
import type { Report, UpdateReportRequest, UpdateReportResponse } from './types'
import { convertAccountNumberFields, convertFieldsFromString } from '../field-conversion'
import {
  REPORT_AN_CONVERSION,
  REPORT_FIELDS_CONVERSION,
  REPORT_UPDATE_REQUEST_AN_CONVERSION,
} from './field-conversion-types'

class ReportService {
  public async getReportByClassAndPeriod(
    sobId: string,
    reportClass: string,
    period: string,
  ): Promise<Response<Report>> {
    return invokeWithErrorHandler(
      async () => {
        const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/report`, {
          params: { class: reportClass, period },
        })

        const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
        convertFieldsFromString(result.data, REPORT_FIELDS_CONVERSION)
        convertAccountNumberFields(result.data, REPORT_AN_CONVERSION, codeLengths)
        return result.data
      },
      { suppress404: true },
    )
  }

  public async getTemplate(sobId: string, reportClass: string): Promise<Response<Report>> {
    return invokeWithErrorHandler(
      async () => {
        const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/report/template`, {
          params: { class: reportClass },
        })

        const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
        convertFieldsFromString(result.data, REPORT_FIELDS_CONVERSION)
        convertAccountNumberFields(result.data, REPORT_AN_CONVERSION, codeLengths)
        return result.data
      },
      { suppress404: true },
    )
  }

  public async generateOrRegenerate(sobId: string, reportClass: string, period: string): Promise<Response<Report>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/report/generate`, null, {
        params: { class: reportClass, period },
      })

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, REPORT_FIELDS_CONVERSION)
      convertAccountNumberFields(result.data, REPORT_AN_CONVERSION, codeLengths)
      return result.data
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
      const requestCopy = JSON.parse(JSON.stringify(request))
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertAccountNumberFields(requestCopy, REPORT_UPDATE_REQUEST_AN_CONVERSION, codeLengths)

      const result = await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/report/${reportId}`, requestCopy)
      return result.data
    })
  }
}

export const ReportServiceInstance = new ReportService()
