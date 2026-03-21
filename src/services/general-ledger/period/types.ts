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

export const PreCloseCheckSchema = z.object({
  unpostedJournals: z.object({
    count: z.number(),
    journals: z.array(PreCloseCheckJournalSchema),
    passed: z.boolean(),
  }),
  trialBalance: z.object({
    openingAmount: z.number(),
    periodAmount: z.number(),
    endingAmount: z.number(),
    passed: z.boolean(),
  }),
  profitAndLossBalance: z.object({
    accounts: z.array(PreCloseCheckPnLAccountSchema),
    passed: z.boolean(),
  }),
})

export type PreCloseCheckJournal = z.infer<typeof PreCloseCheckJournalSchema>
export type PreCloseCheckPnLAccount = z.infer<typeof PreCloseCheckPnLAccountSchema>
export type PreCloseCheck = z.infer<typeof PreCloseCheckSchema>
