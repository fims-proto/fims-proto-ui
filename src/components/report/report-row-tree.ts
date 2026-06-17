import type { Row, UpdateRowRequest } from '@/services/report'

export type InsertPosition = 'before' | 'after' | 'child'

export type RowLookup = {
  rowCode: string
  label: string
  lineNo?: number
}

type RowLike<T> = {
  id?: string
  rowCode: string
  text: string
  lineNo?: number
  showLineNo: boolean
  rows?: T[]
  expression?: { kind: string }
}

export function collectRowCodes(rows: RowLike<UpdateRowRequest>[]): Set<string> {
  const rowCodes = new Set<string>()
  walkRows(rows, (row) => rowCodes.add(row.rowCode))
  return rowCodes
}

export function createCustomRowCode(rows: RowLike<UpdateRowRequest>[]): string {
  const existing = collectRowCodes(rows)
  let rowCode: string

  do {
    rowCode = `CUSTOM_${crypto.randomUUID().slice(0, 8).toUpperCase()}`
  } while (existing.has(rowCode))

  return rowCode
}

export function insertRow(
  rows: UpdateRowRequest[],
  referenceId: string,
  row: UpdateRowRequest,
  position: InsertPosition,
) {
  for (let index = 0; index < rows.length; index++) {
    const current = rows[index]
    if (!current) continue

    if (current.id === referenceId) {
      if (position === 'child') {
        current.rows = [...(current.rows ?? []), row]
      } else {
        rows.splice(position === 'before' ? index : index + 1, 0, row)
      }
      return true
    }

    if (current.rows && insertRow(current.rows, referenceId, row, position)) {
      return true
    }
  }

  return false
}

export function updateRow(
  rows: UpdateRowRequest[],
  rowId: string,
  updateFn: (row: UpdateRowRequest) => UpdateRowRequest,
) {
  for (let index = 0; index < rows.length; index++) {
    const current = rows[index]
    if (!current) continue

    if (current.id === rowId) {
      rows[index] = updateFn(current)
      return true
    }

    if (current.rows && updateRow(current.rows, rowId, updateFn)) {
      return true
    }
  }

  return false
}

export function deleteRow(rows: UpdateRowRequest[], rowId: string) {
  for (let index = 0; index < rows.length; index++) {
    const current = rows[index]
    if (!current) continue

    if (current.id === rowId) {
      rows.splice(index, 1)
      return true
    }

    if (current.rows && deleteRow(current.rows, rowId)) {
      return true
    }
  }

  return false
}

export function findRow(rows: RowLike<UpdateRowRequest>[], rowId: string): UpdateRowRequest | undefined {
  for (const row of rows) {
    if (row.id === rowId) return row as UpdateRowRequest
    const childMatch = findRow(row.rows ?? [], rowId)
    if (childMatch) return childMatch
  }
  return undefined
}

export function rowToLookup(row: RowLike<UpdateRowRequest>): RowLookup {
  return {
    rowCode: row.rowCode,
    label: row.text,
    lineNo: row.showLineNo ? row.lineNo : undefined,
  }
}

export function getReferenceableRows(
  rows: UpdateRowRequest[],
  currentRowId: string | undefined,
  fallbackIndex?: number,
): RowLookup[] {
  const ordered = rowsInEvaluationOrder(rows)
  const currentIndex = currentRowId ? ordered.findIndex((row) => row.id === currentRowId) : -1
  const cutoff = currentIndex >= 0 ? currentIndex : (fallbackIndex ?? ordered.length)

  return ordered
    .slice(0, Math.max(0, cutoff))
    .filter((row) => row.rowCode)
    .map(rowToLookup)
}

export function getInsertionEvaluationIndex(
  rows: UpdateRowRequest[],
  referenceId: string | undefined,
  position: InsertPosition | null,
) {
  const ordered = rowsInEvaluationOrder(rows)
  const referenceIndex = referenceId ? ordered.findIndex((row) => row.id === referenceId) : -1

  if (referenceIndex < 0) return ordered.length
  if (position === 'after') return referenceIndex + 1
  return referenceIndex
}

export function renumberRows(reportClass: string, rows: UpdateRowRequest[]) {
  let lineNo = 1

  const groups = reportClass === 'balance_sheet' ? [rows[0] ? [rows[0]] : [], rows[1] ? [rows[1]] : []] : [rows]

  for (const group of groups) {
    for (const row of rowsInEvaluationOrder(group)) {
      if (row.showLineNo) {
        row.lineNo = lineNo++
      } else {
        delete row.lineNo
      }
    }
  }
}

export function cleanTemporaryRowIds<T extends { rows: UpdateRowRequest[] }>(request: T): T {
  function cleanRows(rows: UpdateRowRequest[]): UpdateRowRequest[] {
    return rows.map((row) => {
      const cleaned: UpdateRowRequest = {
        ...row,
        rows: row.rows ? cleanRows(row.rows) : undefined,
      }

      if (cleaned.id?.startsWith('new-')) {
        delete cleaned.id
      }

      if (!cleaned.rows?.length) {
        delete cleaned.rows
      }

      if (!cleaned.showLineNo) {
        delete cleaned.lineNo
      }

      return cleaned
    })
  }

  return {
    ...request,
    rows: cleanRows(request.rows),
  }
}

export function rowsInEvaluationOrder<T extends RowLike<T>>(rows: T[]): T[] {
  const ordered: T[] = []

  for (const row of rows) {
    const isChildrenSum = row.expression?.kind === 'children_sum'
    if (!isChildrenSum) ordered.push(row)
    ordered.push(...rowsInEvaluationOrder(row.rows ?? []))
    if (isChildrenSum) ordered.push(row)
  }

  return ordered
}

export function updateReportRowsFromForm(reportRows: Row[], formRows: UpdateRowRequest[]) {
  reportRows.splice(0, reportRows.length, ...formRows.map(formRowToReportRow))
}

function formRowToReportRow(row: UpdateRowRequest): Row {
  return {
    id: row.id ?? `new-${crypto.randomUUID()}`,
    rowCode: row.rowCode,
    text: row.text,
    indent: row.indent,
    lineNo: row.lineNo,
    showLineNo: row.showLineNo,
    sumFactor: row.sumFactor,
    displaySumFactor: row.displaySumFactor,
    canEdit: row.canEdit ?? true,
    canMove: row.canMove ?? true,
    canAddChild: row.canAddChild ?? false,
    expression: row.expression,
    rows: row.rows?.map(formRowToReportRow),
  }
}

function walkRows<T extends RowLike<T>>(rows: T[], visitor: (row: T) => void) {
  for (const row of rows) {
    visitor(row)
    walkRows(row.rows ?? [], visitor)
  }
}
