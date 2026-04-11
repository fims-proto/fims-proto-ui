import { z } from 'zod'

export const PeriodSchema = z.object({
  id: z.string(),
  sobId: z.string(),
  previousPeriodId: z.string().optional(),
  fiscalYear: z.number(),
  periodNumber: z.number(),
  isClosed: z.boolean(),
  isCurrent: z.boolean(),
  updatedAt: z.date(),
  createdAt: z.date(),
})

export type Period = z.infer<typeof PeriodSchema>

export const PreCloseCheckStatusSchema = z.enum(['PASSED', 'FAILED', 'UNDETERMINED'])
export type PreCloseCheckStatus = z.infer<typeof PreCloseCheckStatusSchema>

export const PreCloseCheckJournalSchema = z.object({
  id: z.string(),
  documentNumber: z.string(),
  headerText: z.string(),
  amount: z.number(),
  isAudited: z.boolean(),
  isReviewed: z.boolean(),
  transactionDate: z.string(),
})

export const PreCloseCheckPnLAccountSchema = z.object({
  accountNumber: z.string(),
  accountTitle: z.string(),
  endingAmount: z.number(),
})

export const PreCloseCheckCurrentYearProfitAccountSchema = z.object({
  accountNumber: z.string(),
  accountTitle: z.string(),
  endingAmount: z.number(),
  status: PreCloseCheckStatusSchema,
})

export const PreCloseCheckSchema = z.object({
  unpostedJournals: z.object({
    count: z.number(),
    journals: z.array(PreCloseCheckJournalSchema),
    status: PreCloseCheckStatusSchema,
  }),
  trialBalance: z.object({
    openingAmount: z.number(),
    periodAmount: z.number(),
    endingAmount: z.number(),
    status: PreCloseCheckStatusSchema,
  }),
  profitAndLossBalance: z.object({
    accounts: z.array(PreCloseCheckPnLAccountSchema),
    status: PreCloseCheckStatusSchema,
  }),
  currentYearProfitAccount: PreCloseCheckCurrentYearProfitAccountSchema,
})

export type PreCloseCheckJournal = z.infer<typeof PreCloseCheckJournalSchema>
export type PreCloseCheckPnLAccount = z.infer<typeof PreCloseCheckPnLAccountSchema>
export type PreCloseCheckCurrentYearProfitAccount = z.infer<typeof PreCloseCheckCurrentYearProfitAccountSchema>
export type PreCloseCheck = z.infer<typeof PreCloseCheckSchema>
