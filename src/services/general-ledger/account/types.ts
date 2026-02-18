import z from 'zod'

export const AccountClassSchema = z.object({
  id: z.string().length(1),
  groups: z.array(z.string().length(3)).min(1),
})

export const AuxiliaryCategorySchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  key: z.string().min(1).max(20),
  title: z.string().min(1).max(50),
  isStandard: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const AccountSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  superiorAccountId: z.string().uuid().optional(),
  title: z.string().min(1).max(50),
  accountNumber: z.string().min(1).max(60),
  numberHierarchy: z.array(z.number().int().min(1).max(999999)).min(1).max(10),
  isLeaf: z.boolean(),
  level: z.number().int().min(1).max(10),
  class: z.string().length(1),
  group: z.string().length(3),
  balanceDirection: z.enum(['debit', 'credit']),
  auxiliaryCategories: z.array(AuxiliaryCategorySchema).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const AuxiliaryAccountSchema = z.object({
  id: z.string().uuid(),
  category: AuxiliaryCategorySchema,
  key: z.string().min(1).max(20),
  title: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const CreateAccountSchema = z.object({
  title: z.string().min(1).max(50),
  superiorAccountNumber: z.string().min(1).max(60).optional(),
  levelNumber: z.number().int(),
  balanceDirection: z.enum(['debit', 'credit']),
  class: z.string().length(1),
  group: z.string().length(3),
  categoryKeys: z.array(z.string().min(1).max(20)).optional(),
})

export const UpdateAccountSchema = z.object({
  title: z.string().min(1).max(50),
  levelNumber: z.number().int().min(1).max(10),
  balanceDirection: z.enum(['debit', 'credit']),
  group: z.string().length(3),
  categoryKeys: z.array(z.string().min(1).max(20)).optional(),
})

export const CreateAuxiliaryCategorySchema = z.object({
  key: z.string().min(1).max(20),
  title: z.string().min(1).max(50),
})

export const CreateAuxiliaryAccountSchema = z.object({
  key: z.string().min(1).max(20),
  title: z.string().min(1).max(50),
  description: z.string().max(500).optional(),
})

export type AccountClass = z.infer<typeof AccountClassSchema>
export type AuxiliaryCategory = z.infer<typeof AuxiliaryCategorySchema>
export type Account = z.infer<typeof AccountSchema>
export type AuxiliaryAccount = z.infer<typeof AuxiliaryAccountSchema>
export type CreateAccount = z.infer<typeof CreateAccountSchema>
export type UpdateAccount = z.infer<typeof UpdateAccountSchema>
export type CreateAuxiliaryCategory = z.infer<typeof CreateAuxiliaryCategorySchema>
export type CreateAuxiliaryAccount = z.infer<typeof CreateAuxiliaryAccountSchema>
