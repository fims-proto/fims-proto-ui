import type { Report, Row } from '@/services/report'
import i18n from '@/i18n'
import type { Entry, Header, ReportDisplayData } from './report-display-types'

export function buildReportDisplayData(report: Report): ReportDisplayData {
  if (report.class === 'balance_sheet') {
    const leftHeader = createHeader(report, i18n.global.t('report.chart.rowTextLabel.balanceSheetLeft'))
    const rightHeader = createHeader(report, i18n.global.t('report.chart.rowTextLabel.balanceSheetRight'))
    const leftEntries = report.rows[0] ? rowsToEntries([report.rows[0]]) : []
    const rightEntries = report.rows[1] ? rowsToEntries([report.rows[1]]) : []
    return {
      class: report.class,
      headers: [leftHeader, rightHeader],
      balanceSheetEntries: [leftEntries, padBalanceSheetEntries(leftEntries, rightEntries)],
    }
  }

  const header = createHeader(report, i18n.global.t('report.chart.rowTextLabel.default'))
  return {
    class: report.class,
    headers: [header],
    entries: rowsToEntries(report.rows),
  }
}

function padBalanceSheetEntries(left: Entry[], right: Entry[]): Entry[] {
  const padCount = left.length - right.length
  if (padCount <= 0) return right

  // Insert padding before the equity section header (rowCode 'BS_052')
  const insertIdx = right.findIndex((e) => e.rowCode === 'BS_052')
  if (insertIdx < 0) return right

  const padding: Entry[] = Array.from({ length: padCount }, (_, i) => ({
    id: `padding-${i}`,
    rowCode: `PADDING_${i}`,
    text: '',
    indent: 0,
    showLineNo: false,
    sumFactor: 0 as const,
    displaySumFactor: false,
    canEdit: false,
    canMove: false,
    canAddChild: false,
    expression: { kind: 'none' as const },
    hasBreakDownPrefix: false,
    showBreakDownPrefix: false,
    hasSumFactorPrefix: false,
    showSumFactorPrefix: false,
    padding: true as const,
  }))

  return [...right.slice(0, insertIdx), ...padding, ...right.slice(insertIdx)]
}

export function rowsToEntries(rows: Row[], parentExpressionKind?: string): Entry[] {
  const entries: Entry[] = []

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i]!
    const previousSibling = rows[i - 1]
    const hasBreakDownPrefix = !!parentExpressionKind && parentExpressionKind !== 'children_sum'
    const showBreakDownPrefix = hasBreakDownPrefix && i === 0
    const hasSumFactorPrefix = row.displaySumFactor && row.sumFactor !== 0
    const showSumFactorPrefix =
      hasSumFactorPrefix && (!previousSibling?.displaySumFactor || previousSibling.sumFactor !== row.sumFactor)
    const entry = {
      ...row,
      hasBreakDownPrefix,
      showBreakDownPrefix,
      hasSumFactorPrefix,
      showSumFactorPrefix,
    }

    if (row.expression.kind === 'children_sum') {
      entries.push(...rowsToEntries(row.rows ?? [], row.expression.kind))
      entries.push(entry)
    } else {
      entries.push(entry)
      entries.push(...rowsToEntries(row.rows ?? [], row.expression.kind))
    }
  }

  return entries
}

function createHeader(report: Report, rowTextLabel: string): Header {
  return {
    rowTextLabel,
    lineNumberLabel: i18n.global.t('report.chart.lineNumber'),
    columns: report.columns,
  }
}
