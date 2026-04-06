import z from 'zod'

export const AccountClassSchema = z.object({
  id: z.string().length(1),
  groups: z.array(z.string().length(3)).min(1),
})

// Lightweight dimension refs embedded in GL responses (defined here as they belong to GL module)
export const DimensionCategoryRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
})

export const DimensionOptionRefSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  category: DimensionCategoryRefSchema,
})

export const AccountSlimSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  superiorAccountId: z.string().uuid().optional(),
  title: z.string().min(1).max(50),
  accountNumber: z.string().min(1).max(60),
  isLeaf: z.boolean(),
  level: z.number().int().min(1).max(10),
  class: z.string().length(1),
  group: z.string().length(3),
  balanceDirection: z.enum(['debit', 'credit']),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const AccountDetailSchema = AccountSlimSchema.extend({
  dimensionCategories: z.array(DimensionCategoryRefSchema).optional(),
})

export const CreateAccountSchema = z.object({
  title: z.string().min(1).max(50),
  superiorAccountNumber: z.string().min(1).max(60).optional(),
  levelNumber: z.number().int(),
  balanceDirection: z.enum(['debit', 'credit']),
  class: z.string().length(1),
  group: z.string().length(3),
  dimensionCategoryIds: z.array(z.string().uuid()).optional(),
})

export const UpdateAccountSchema = z.object({
  title: z.string().min(1).max(50),
  levelNumber: z.number().int().min(1).max(10),
  balanceDirection: z.enum(['debit', 'credit']),
  group: z.string().length(3),
  dimensionCategoryIds: z.array(z.string().uuid()).optional(),
})

export type AccountClass = z.infer<typeof AccountClassSchema>
export type DimensionCategoryRef = z.infer<typeof DimensionCategoryRefSchema>
export type DimensionOptionRef = z.infer<typeof DimensionOptionRefSchema>
export type AccountSlim = z.infer<typeof AccountSlimSchema>
export type AccountDetail = z.infer<typeof AccountDetailSchema>
export type CreateAccount = z.infer<typeof CreateAccountSchema>
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>
