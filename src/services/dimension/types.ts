import z from 'zod'

export const DimensionCategorySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  sobId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const DimensionOptionSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(50),
  categoryId: z.string().uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UpsertDimensionCategorySchema = z.object({
  name: z.string().min(1).max(50),
})

export const UpsertDimensionOptionSchema = z.object({
  name: z.string().min(1).max(50),
})

export type DimensionCategory = z.infer<typeof DimensionCategorySchema>
export type DimensionOption = z.infer<typeof DimensionOptionSchema>
export type UpsertDimensionCategory = z.infer<typeof UpsertDimensionCategorySchema>
export type UpsertDimensionOption = z.infer<typeof UpsertDimensionOptionSchema>
