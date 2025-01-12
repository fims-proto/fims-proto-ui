import type { Report, Section } from '@domain/report'
import i18n from '@i18n'
import type { Entry, Header } from './types'

export function buildReportHeaders(report: Report): Header[] {
  const amountTypeTitles = report.amountTypes.map((t) => i18n.global.t(`report.amountTypeEnum.${t}`))
  return report.sections.map((section) => ({
    title: section.title ?? '',
    lineNumber: i18n.global.t('report.chart.lineNumber'),
    amountTypes: amountTypeTitles,
  }))
}

export function buildReportEntries(report: Report): Entry[][] {
  let result: Entry[][] = []
  if (report.class === 'balance_sheet') {
    result = buildBalanceSheetReportEntries(report)
  } else {
    result = buildNormalReportEntries(report)
  }
  calculateIndentation(result.flat())

  // assign line numbers
  let count = 1
  result
    .flat()
    .filter((e) => e.dataSource === 'formulas' || e.dataSource === 'sum')
    .forEach((e) => (e.lineNumber = count++))

  return result
}

function buildNormalReportEntries(report: Report): Entry[][] {
  // the title of root section is the column title.
  // the title of the sub section will be the row text.

  const entries: Entry[][] = []

  report.sections.forEach((section) => {
    entries.push(getItemsFromSection(section))
  })

  return entries
}

function buildBalanceSheetReportEntries(report: Report): Entry[][] {
  if (report.sections.length !== 2) {
    throw new Error('Balance sheet must have exactly 2 main sections')
  }
  const [assets, liabilitiesAndEquity] = report.sections

  if (!liabilitiesAndEquity.sections?.length || liabilitiesAndEquity.sections.length !== 2) {
    throw new Error('Liabilities and Equity section must have exactly 2 subsections')
  }
  const [liabilities, equity] = liabilitiesAndEquity.sections

  const t = i18n.global.t
  // flatten sections and then concat items
  const assetEntries = getItemsFromSection(assets)
  const liabilityEntries = getItemsFromSection(liabilities)
  const equityEntries = getItemsFromSection(equity)
  // total for liabilities and equity
  equityEntries.push(...(liabilitiesAndEquity.items ?? []))

  // fill empty lines
  const newLineNumbers = liabilityEntries.length + equityEntries.length - assetEntries.length
  const pusher = newLineNumbers > 0 ? (l: Entry) => assetEntries.push(l) : (l: Entry) => liabilityEntries.push(l)
  for (let i = 0; i < Math.abs(newLineNumbers); i++) {
    pusher(newEntry({ text: '' }))
  }

  return [assetEntries, liabilityEntries.concat(equityEntries)]
}

function getItemsFromSection(section: Section): Entry[] {
  const entries: Entry[] = []
  section.sections
    ?.map((s) => getItemsFromSection(s))
    .flat()
    .forEach((e) => entries.push(e))
  entries.push(...(section.items ?? []))
  return entries
}

const uniqueKey = { index: 0 }

function newEntry(params: Omit<Entry, 'id' | 'level' | 'sumFactor' | 'dataSource'>): Entry {
  return {
    id: `text-line-${++uniqueKey.index}`,
    level: 0,
    sumFactor: 0,
    dataSource: 'none',
    ...params,
  }
}

function calculateIndentation(entries: Entry[]) {
  const STARTS_FROM = 1
  let preservedSumFactor = Number.MIN_SAFE_INTEGER
  let baseLevel = STARTS_FROM
  let baseIndentation = 0

  entries.forEach((e) => {
    const levelIndentation = Math.max(0, (e.level ?? 0) - STARTS_FROM)

    // reset base indentation when we're at root level (relative to STARTS_FROM)
    if ((e.level ?? 0) === STARTS_FROM) {
      baseIndentation = 0
      baseLevel = STARTS_FROM
    }

    // add baseIndentation only for deeper level
    e.indentation = ((e.level ?? 0) > baseLevel ? baseIndentation : 0) + levelIndentation

    // breakdown item indentation
    e.indentation += e.isBreakdownItem ? 3 : 0

    // sumFactor indentation
    if (e.displaySumFactor || e.sumFactor === preservedSumFactor) {
      e.indentation += 2
      baseIndentation = e.indentation
      baseLevel = e.level ?? 0
      if (e.displaySumFactor) {
        preservedSumFactor = e.sumFactor!
      }
    }
  })
}
