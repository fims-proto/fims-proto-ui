import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertAccountNumberFields, convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { useSobStore } from '../../../store/sob'
import { type Page, type Pageable } from '../../types'
import { type JournalSlim, type JournalDetail, type CreateJournalRequest, type UpdateJournalRequest } from './types'
import {
  JOURNAL_FIELDS,
  JOURNAL_LINE_REQUEST_AN_CONVERSION,
  JOURNAL_RESPONSE_AN_CONVERSION,
  JOURNAL_SLIM_FIELDS,
} from '../field-conversion-types'
import type { Filter } from '@/services/filter'

class JournalService {
  public async getJournals(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
    filterable?: Filter<JournalSlim>,
  ): Promise<Response<Page<JournalSlim>>> {
    const filterContent = filterable?.apiFilterString()
    const filterStr = filterContent && filterContent != 'true' ? `&$filter=${filterContent}` : ''
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/journals?$sort=createdAt desc&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      convertFieldsFromString(result.data.content, JOURNAL_SLIM_FIELDS)
      return result.data
    })
  }

  public async getJournalById(sobId: string, id: string): Promise<Response<JournalDetail>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}`)

      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertFieldsFromString(result.data, JOURNAL_FIELDS)
      convertAccountNumberFields(result.data, JOURNAL_RESPONSE_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async createJournal(sobId: string, journal: CreateJournalRequest): Promise<Response<JournalDetail>> {
    return invokeWithErrorHandler(async () => {
      // Make a copy to avoid mutating the input
      const journalCopy = JSON.parse(JSON.stringify(journal))
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertAccountNumberFields(journalCopy, JOURNAL_LINE_REQUEST_AN_CONVERSION, codeLengths)

      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journals`, journalCopy)

      convertFieldsFromString(result.data, JOURNAL_FIELDS)
      convertAccountNumberFields(result.data, JOURNAL_RESPONSE_AN_CONVERSION, codeLengths)
      return result.data
    })
  }

  public async updateJournal(sobId: string, id: string, journal: UpdateJournalRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // Make a copy to avoid mutating the input
      const journalCopy = JSON.parse(JSON.stringify(journal))
      const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
      convertAccountNumberFields(journalCopy, JOURNAL_LINE_REQUEST_AN_CONVERSION, codeLengths)

      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}`, journalCopy)
    })
  }

  public async auditJournal(sobId: string, id: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}/audit`, {
        auditor,
      })
    })
  }

  public async cancelAuditJournal(sobId: string, id: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}/cancel-audit`, {
        auditor,
      })
    })
  }

  public async reviewJournal(sobId: string, id: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}/review`, {
        reviewer,
      })
    })
  }

  public async cancelReviewJournal(sobId: string, id: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}/cancel-review`, {
        reviewer,
      })
    })
  }

  public async postJournal(sobId: string, id: string, poster: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}/post`, {
        poster,
      })
    })
  }
}

export const JournalServiceInstance = new JournalService()
