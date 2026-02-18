import z from 'zod'

export const SobSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  baseCurrency: z.string(),
  startingPeriodYear: z.number().int().min(2000).max(3000),
  startingPeriodMonth: z.number().int().min(1).max(12),
  accountsCodeLength: z.array(z.number().int().min(1).max(6)).min(2).max(10),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const NewSobSchema = SobSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
})

export const UpdateSobSchema = SobSchema.omit({
  id: true,
  baseCurrency: true,
  startingPeriodYear: true,
  startingPeriodMonth: true,
  createdAt: true,
  updatedAt: true,
})

export type Sob = z.infer<typeof SobSchema>
export type NewSob = z.infer<typeof NewSobSchema>
export type UpdateSob = z.infer<typeof UpdateSobSchema>
