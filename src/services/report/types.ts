import z from 'zod'
import { CLASS_OPTIONS, COLUMN_VALUE_TYPE, EXPRESSION_KIND, LEDGER_MEASURE } from './constants'

export const PeriodSchema = z.object({
  fiscalYear: z.number().int(),
  periodNumber: z.number().int().min(1).max(12),
})

export const ColumnSchema = z.object({
  id: z.string().uuid(),
  label: z.string().min(1),
  valueType: z.enum(COLUMN_VALUE_TYPE),
  sequence: z.number().int().optional(),
})

export const LedgerAccountReferenceSchema = z.object({
  accountId: z.string().uuid().optional(),
  accountNumber: z.string().min(1).optional(),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
  measure: z.enum(LEDGER_MEASURE),
})

export const CashFlowItemReferenceSchema = z.object({
  code: z.string().min(1),
  itemId: z.string().uuid().optional(),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
})

export const RowReferenceSchema = z.object({
  rowCode: z.string().min(1),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
})

export const ExpressionSchema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(EXPRESSION_KIND),
  ledgerAccounts: z.array(LedgerAccountReferenceSchema).optional(),
  cashFlowItems: z.array(CashFlowItemReferenceSchema).optional(),
  rowReferences: z.array(RowReferenceSchema).optional(),
})

export const RowSchema: z.ZodType<{
  id: string
  rowCode: string
  text: string
  indent: number
  sequence?: number
  lineNo?: number
  showLineNo: boolean
  sumFactor: 1 | 0 | -1
  displaySumFactor: boolean
  canEdit: boolean
  canMove: boolean
  canAddChild: boolean
  expression: Expression
  rows?: Row[]
  amounts?: number[]
}> = z.lazy(() =>
  z.object({
    id: z.string().uuid(),
    rowCode: z.string().min(1),
    text: z.string().min(1),
    indent: z.number().int(),
    sequence: z.number().int().optional(),
    lineNo: z.number().int().optional(),
    showLineNo: z.boolean(),
    sumFactor: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
    displaySumFactor: z.boolean(),
    canEdit: z.boolean(),
    canMove: z.boolean(),
    canAddChild: z.boolean(),
    expression: ExpressionSchema,
    rows: z.array(RowSchema).optional(),
    amounts: z.array(z.number()).optional(),
  }),
)

export const ReportSchema = z.object({
  id: z.string().uuid(),
  sobId: z.string().uuid(),
  period: PeriodSchema.optional(),
  title: z.string().min(1),
  template: z.boolean(),
  class: z.enum(CLASS_OPTIONS),
  columns: z.array(ColumnSchema).min(1),
  rows: z.array(RowSchema).min(1),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const UpdateLedgerAccountReferenceRequestSchema = z.object({
  accountNumber: z.string().min(1),
  accountId: z.string().uuid().optional(),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
  measure: z.enum(LEDGER_MEASURE),
})

export const UpdateCashFlowItemReferenceRequestSchema = z.object({
  code: z.string().min(1),
  itemId: z.string().uuid().optional(),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
})

export const UpdateRowReferenceRequestSchema = z.object({
  rowCode: z.string().min(1),
  sumFactor: z.union([z.literal(1), z.literal(-1)]),
})

export const UpdateExpressionRequestSchema = z.object({
  kind: z.enum(EXPRESSION_KIND),
  ledgerAccounts: z.array(UpdateLedgerAccountReferenceRequestSchema).optional(),
  cashFlowItems: z.array(UpdateCashFlowItemReferenceRequestSchema).optional(),
  rowReferences: z.array(UpdateRowReferenceRequestSchema).optional(),
})

export const UpdateRowRequestSchema: z.ZodType<{
  id?: string
  rowCode: string
  text: string
  indent: number
  lineNo?: number
  showLineNo: boolean
  sumFactor: 1 | 0 | -1
  displaySumFactor: boolean
  canEdit?: boolean
  canMove?: boolean
  canAddChild?: boolean
  expression: UpdateExpressionRequest
  rows?: UpdateRowRequest[]
}> = z.lazy(() =>
  z.object({
    id: z.string().optional(),
    rowCode: z.string().min(1),
    text: z.string().min(1),
    indent: z.number().int(),
    lineNo: z.number().int().optional(),
    showLineNo: z.boolean(),
    sumFactor: z.union([z.literal(1), z.literal(0), z.literal(-1)]),
    displaySumFactor: z.boolean(),
    canEdit: z.boolean().optional(),
    canMove: z.boolean().optional(),
    canAddChild: z.boolean().optional(),
    expression: UpdateExpressionRequestSchema,
    rows: z.array(UpdateRowRequestSchema).optional(),
  }),
)

export const UpdateReportRequestSchema = z.object({
  title: z.string().min(1).optional(),
  rows: z.array(UpdateRowRequestSchema),
})

export type Report = z.infer<typeof ReportSchema>
export type Period = z.infer<typeof PeriodSchema>
export type Column = z.infer<typeof ColumnSchema>
export type Row = z.infer<typeof RowSchema>
export type Expression = z.infer<typeof ExpressionSchema>
export type LedgerAccountReference = z.infer<typeof LedgerAccountReferenceSchema>
export type CashFlowItemReference = z.infer<typeof CashFlowItemReferenceSchema>
export type RowReference = z.infer<typeof RowReferenceSchema>

export type UpdateReportRequest = z.infer<typeof UpdateReportRequestSchema>
export type UpdateRowRequest = z.infer<typeof UpdateRowRequestSchema>
export type UpdateExpressionRequest = z.infer<typeof UpdateExpressionRequestSchema>
export type UpdateLedgerAccountReferenceRequest = z.infer<typeof UpdateLedgerAccountReferenceRequestSchema>
export type UpdateCashFlowItemReferenceRequest = z.infer<typeof UpdateCashFlowItemReferenceRequestSchema>
export type UpdateRowReferenceRequest = z.infer<typeof UpdateRowReferenceRequestSchema>
