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
