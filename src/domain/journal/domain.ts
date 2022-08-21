import axios from 'axios'
import { FIMS_URL } from '../../config'
import { convertFieldsFromString } from '../dateTypeConverter'
import { invokeWithErrorHandler, Response } from '../errorHandler'
import { FieldConversionRecord, Page, Pageable } from '../types'
import { LineItem, JournalEntry, NewJournalEntry } from './types'

const ITEM_FIELDS: FieldConversionRecord = {
  credit: 'number',
  debit: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}

const ENTRY_FIELDS: FieldConversionRecord = {
  attachmentQuantity: 'number',
  credit: 'number',
  debit: 'number',
  transactionTime: 'date',
  lineItems: ITEM_FIELDS,
  createdAt: 'date',
  updatedAt: 'date',
}

class JournalService {
  public async getJournalEntries(
    sobId: string,
    pageable: Pageable = { page: 1, size: 10 }
  ): Promise<Response<Page<JournalEntry>>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(
        `${FIMS_URL}/api/v1/sob/${sobId}/journal-entries/?$sort=createdAt&$page=${pageable.page}&$size=${pageable.size}`
      )
      convertFieldsFromString(result.data.content, ENTRY_FIELDS)
      return result.data
    })
  }

  public async getJournalEntryById(sobId: string, entryId: string): Promise<Response<JournalEntry>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.get(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}`)
      return convertFieldsFromString(result.data, ENTRY_FIELDS)
    })
  }

  public async createJournalEntry(sobId: string, entry: NewJournalEntry): Promise<Response<JournalEntry>> {
    return invokeWithErrorHandler(async () => {
      const result = await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entries/`, entry)
      return convertFieldsFromString(result.data, ENTRY_FIELDS)
    })
  }

  public async updateJournalEntry(
    sobId: string,
    entryId: string,
    transactionTime: Date,
    lineItems: LineItem[]
  ): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      // patch
      await axios.patch(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}`, {
        transactionTime: transactionTime,
        lineItems: lineItems,
      })
    })
  }

  public async auditJournalEntry(sobId: string, entryId: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}/audit`, {
        auditor,
      })
    })
  }

  public async cancelAuditJournalEntry(sobId: string, entryId: string, auditor: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}/cancel-audit`, {
        auditor,
      })
    })
  }

  public async reviewJournalEntry(sobId: string, entryId: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}/review`, {
        reviewer,
      })
    })
  }

  public async cancelReviewJournalEntry(sobId: string, entryId: string, reviewer: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}/cancel-review`, {
        reviewer,
      })
    })
  }

  public async postJournalEntry(sobId: string, entryId: string, poster: string): Promise<Response<void>> {
    return invokeWithErrorHandler(async () => {
      await axios.post(`${FIMS_URL}/api/v1/sob/${sobId}/journal-entry/${entryId}/post`, {
        poster,
      })
    })
  }
}

export const JournalServiceInstance = new JournalService()
