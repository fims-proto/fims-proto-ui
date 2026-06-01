import z from 'zod'

export const CashFlowItemSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  code: z.string().min(1),
  name: z.string().min(1),
  category: z.string().min(1),
  direction: z.string().min(1),
  sequence: z.number().int(),
})

export type CashFlowItem = z.infer<typeof CashFlowItemSchema>
