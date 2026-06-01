import type {
  Row,
  UpdateCashFlowItemReferenceRequest,
  UpdateExpressionRequest,
  UpdateLedgerAccountReferenceRequest,
  UpdateRowReferenceRequest,
  UpdateRowRequest,
} from '@/services/report'

export function transformRowToRequest(row: Row): UpdateRowRequest {
  return {
    id: row.id,
    rowCode: row.rowCode,
    text: row.text,
    indent: row.indent,
    lineNo: row.showLineNo ? row.lineNo : undefined,
    showLineNo: row.showLineNo,
    sumFactor: row.sumFactor,
    displaySumFactor: row.displaySumFactor,
    canEdit: row.canEdit,
    canMove: row.canMove,
    canAddChild: row.canAddChild,
    expression: transformExpressionToRequest(row.expression),
    rows: row.rows?.map(transformRowToRequest),
  }
}

export function normalizeExpressionForKind(expression: UpdateExpressionRequest): UpdateExpressionRequest {
  switch (expression.kind) {
    case 'ledger_accounts':
      return {
        kind: expression.kind,
        ledgerAccounts: expression.ledgerAccounts ?? [],
      }
    case 'cash_flow_items':
      return {
        kind: expression.kind,
        cashFlowItems: expression.cashFlowItems ?? [],
      }
    case 'rows_explicit':
      return {
        kind: expression.kind,
        rowReferences: expression.rowReferences ?? [],
      }
    case 'children_sum':
    case 'none':
      return {
        kind: expression.kind,
      }
  }
}

function transformExpressionToRequest(expression: Row['expression']): UpdateExpressionRequest {
  return normalizeExpressionForKind({
    kind: expression.kind,
    ledgerAccounts: expression.ledgerAccounts?.map(transformLedgerAccountReference),
    cashFlowItems: expression.cashFlowItems?.map(transformCashFlowItemReference),
    rowReferences: expression.rowReferences?.map(transformRowReference),
  })
}

function transformLedgerAccountReference(ref: NonNullable<Row['expression']['ledgerAccounts']>[number]) {
  return {
    accountNumber: ref.accountNumber ?? '',
    accountId: ref.accountId,
    sumFactor: ref.sumFactor,
    measure: ref.measure,
  } satisfies UpdateLedgerAccountReferenceRequest
}

function transformCashFlowItemReference(ref: NonNullable<Row['expression']['cashFlowItems']>[number]) {
  return {
    code: ref.code,
    itemId: ref.itemId,
    sumFactor: ref.sumFactor,
  } satisfies UpdateCashFlowItemReferenceRequest
}

function transformRowReference(ref: NonNullable<Row['expression']['rowReferences']>[number]) {
  return {
    rowCode: ref.rowCode,
    sumFactor: ref.sumFactor,
  } satisfies UpdateRowReferenceRequest
}
