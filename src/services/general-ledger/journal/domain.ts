import axios from 'axios'
import { FIMS_URL } from '../../../config'
import { convertFieldsFromString } from '../../field-conversion'
import { invokeWithErrorHandler, type Response } from '../../error-handler'
import { type Page, type Pageable } from '../../types'
import { type Journal, type CreateJournalRequest, type UpdateJournalRequest } from './types'
import { JOURNAL_FIELDS } from '../field-conversion-types'
import type { Filter } from '@/services/filter'

class JournalService {
  public async getJournals(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 },
    filterable?: Filter<Journal>,
  ): Promise<Response<Page<Journal>>> {
    const filterContent = filterable?.apiFilterString()
    const filterStr = filterContent && filterContent != 'true' ? `&$filter=${filterContent}` : ''
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/journals?$sort=createdAt desc&$page=${pageable.page}&$size=${pageable.size}${filterStr}`,
      )
      convertFieldsFromString(result.data.content, JOURNAL_FIELDS)
      return result.data
    })
  }

  public async getJournalById(sobId: string, id: string): Promise<Response<Journal>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}`)
      return convertFieldsFromString(result.data, JOURNAL_FIELDS)
    })
  }

  public async createJournal(sobId: string, journal: CreateJournalRequest): Promise<Response<Journal>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journals`, journal)
      return convertFieldsFromString(result.data, JOURNAL_FIELDS)
    })
  }

  public async updateJournal(sobId: string, id: string, journal: UpdateJournalRequest): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/journal/${id}`, journal)
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
