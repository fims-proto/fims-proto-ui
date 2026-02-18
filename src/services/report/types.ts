import z from 'zod'
import { DATA_SOURCE, FORMULA_RULE, CLASS_OPTIONS, AMOUNT_TYPE } from './constants'

export const PeriodSchema = z.object({
  fiscalYear: z.number().int(),
  periodNumber: z.number().int().min(1).max(12),
})

export const AccountSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  superiorAccountId: z.string().uuid().optional(),
  title: z.string(),
  accountNumber: z.string(),
  level: z.number().int(),
  isLeaf: z.boolean(),
  class: z.string(),
  group: z.string(),
  balanceDirection: z.string(),
})

export const FormulaSchema = z.object({
  id: z.string().uuid(),
  account: AccountSchema,
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
  rule: z.enum(FORMULA_RULE),
  amounts: z.array(z.number()).min(1),
})

export const ItemSchema = z.object({
  id: z.string().uuid(),
  text: z.string().min(1).max(40),
  level: z.number().int().min(1),
  sumFactor: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
  itemType: z.string().optional(),
  displaySumFactor: z.boolean().optional(),
  dataSource: z.enum(DATA_SOURCE),
  formulas: z.array(FormulaSchema).optional(),
  amounts: z.array(z.number()).min(1).optional(),
  isEditable: z.boolean().optional(),
  isBreakdownItem: z.boolean().optional(),
  isAbleToAddChild: z.boolean().optional(),
  isAbleToAddLeaf: z.boolean().optional(),
})

export const SectionSchema: z.ZodType<{
  id: string
  title?: string
  amounts: number[]
  sections?: Section[]
  items?: Item[]
}> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(40).optional(),
    amounts: z.array(z.number()).min(1),
    sections: z.array(SectionSchema).optional(),
    items: z.array(ItemSchema).optional(),
  }),
)

export const ReportSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  period: PeriodSchema.optional(),
  title: z.string().min(1).max(40),
  template: z.boolean(),
  class: z.enum(CLASS_OPTIONS),
  amountTypes: z.array(z.enum(AMOUNT_TYPE)).min(1),
  sections: z.array(SectionSchema).min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type Report = z.infer<typeof ReportSchema>
export type Period = z.infer<typeof PeriodSchema>
export type Section = z.infer<typeof SectionSchema>
export type Item = z.infer<typeof ItemSchema>
export type Formula = z.infer<typeof FormulaSchema>
export type Account = z.infer<typeof AccountSchema>

export const GenerateReportRequestSchema = z.object({
  title: z.string().min(1).max(40).optional(),
  amountTypes: z.array(z.enum(AMOUNT_TYPE)).min(1).optional(),
  periodFiscalYear: z.number().int(),
  periodNumber: z.number().int().min(1).max(12),
})

export const UpdateReportRequestItemFormulaSchema = z.object({
  id: z.string().uuid().optional(),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
  accountNumber: z.string(),
  rule: z.enum(FORMULA_RULE),
})

export const UpdateItemRequestSchema = z.object({
  text: z.string().min(1).max(40).optional(),
  sumFactor: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
  dataSource: z.enum(DATA_SOURCE),
  formulas: z.array(UpdateReportRequestItemFormulaSchema).optional(),
})

export const UpdateReportRequestItemSchema = z.object({
  id: z.string().optional(),
  text: z.string().min(1).max(40).optional(),
  level: z.number().int().min(1),
  sumFactor: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
  dataSource: z.enum(DATA_SOURCE),
  displaySumFactor: z.boolean().optional(),
  isBreakdownItem: z.boolean().optional(),
  isAbleToAddChild: z.boolean().optional(),
  formulas: z.array(UpdateReportRequestItemFormulaSchema).optional(),
})

export const UpdateReportRequestSectionSchema: z.ZodType<{
  id: string
  title?: string
  sections?: UpdateReportRequestSection[]
  items: UpdateReportRequestItem[]
}> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    title: z.string().min(1).max(40).optional(),
    sections: z.array(UpdateReportRequestSectionSchema).optional(),
    items: z.array(UpdateReportRequestItemSchema),
  }),
)

export const UpdateReportRequestSchema = z.object({
  title: z.string().min(1).max(40).optional(),
  amountTypes: z.array(z.enum(AMOUNT_TYPE)).optional(),
  sections: z.array(UpdateReportRequestSectionSchema),
})

export const UpdateReportResponseSchema = z.object({
  createdItemIds: z.record(z.string(), z.string().uuid()),
})

export type GenerateReportRequest = z.infer<typeof GenerateReportRequestSchema>
export type UpdateReportRequestItemFormula = z.infer<typeof UpdateReportRequestItemFormulaSchema>
export type UpdateReportRequestItem = z.infer<typeof UpdateReportRequestItemSchema>
export type UpdateReportRequestSection = z.infer<typeof UpdateReportRequestSectionSchema>
export type UpdateReportRequest = z.infer<typeof UpdateReportRequestSchema>
export type UpdateReportResponse = z.infer<typeof UpdateReportResponseSchema>
