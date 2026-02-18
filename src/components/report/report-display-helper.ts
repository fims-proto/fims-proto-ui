import type { Item, Report, Section } from '@/services/report'
import i18n from '@/i18n'
import type { BalanceSheetCell, BalanceSheetRow, Entry, Header, ReportDisplayData } from './report-display-types'

/**
 * Builds the display data structure for rendering a report.
 * Dispatches to appropriate builder based on report class.
 *
 * @throws Error if balance sheet structure is invalid (backend contract violation)
 */
export function buildReportDisplayData(report: Report): ReportDisplayData {
  switch (report.class) {
    case 'balance_sheet':
      return buildBalanceSheetDisplayData(report)
    case 'income_statement':
    default:
      // Default fallback for unknown report types - single column layout
      return buildSingleColumnDisplayData(report)
  }
}

/**
 * Builds display data for balance sheet (two-column layout).
 * Assets on left, Liabilities + Equity on right.
 *
 * @throws Error if report structure doesn't match expected balance sheet format
 */
function buildBalanceSheetDisplayData(report: Report): ReportDisplayData {
  // Validate and extract structure - backend contract
  const assetsSection = report.sections[0]
  const liabilitiesAndEquitySection = report.sections[1]

  if (!assetsSection || !liabilitiesAndEquitySection) {
    throw new Error(
      `Balance sheet must have exactly 2 main sections (assets, liabilities+equity), got ${report.sections.length}`,
    )
  }

  const liabilitiesSection = liabilitiesAndEquitySection.sections?.[0]
  const equitySection = liabilitiesAndEquitySection.sections?.[1]

  if (!liabilitiesSection || !equitySection) {
    throw new Error(
      `Liabilities and Equity section must have exactly 2 subsections (liabilities, equity), got ${liabilitiesAndEquitySection.sections?.length ?? 0}`,
    )
  }

  // Build headers for both columns
  const amountTypeTitles = report.amountTypes.map((t) => i18n.global.t(`report.amountTypeEnum.${t}`))
  const headers: Header[] = [
    {
      title: assetsSection.title ?? '',
      lineNumberLabel: i18n.global.t('report.chart.lineNumber'),
      amountTypes: amountTypeTitles,
    },
    {
      title: liabilitiesAndEquitySection.title ?? '',
      lineNumberLabel: i18n.global.t('report.chart.lineNumber'),
      amountTypes: amountTypeTitles,
    },
  ]

  // Flatten sections to entry arrays
  const assetEntries = getItemsFromSection(assetsSection)
  const liabilityEntries = getItemsFromSection(liabilitiesSection)
  const equityEntries = getItemsFromSection(equitySection)

  // Add total row for liabilities+equity section (items at section root level)
  if (liabilitiesAndEquitySection.items) {
    equityEntries.push(...liabilitiesAndEquitySection.items.map(itemToEntry))
  }

  // Calculate indentation for both sides (before adding blank rows)
  const processedAssets = calculateIndentation(assetEntries)
  const processedLiabilities = calculateIndentation(liabilityEntries)
  const processedEquity = calculateIndentation(equityEntries)

  // Insert blank rows between liability and equity if assets have more rows
  const rightColumnBeforeBlankFill = [...processedLiabilities, ...processedEquity]
  const blankRowsNeeded = processedAssets.length - rightColumnBeforeBlankFill.length

  let rightColumnEntries: Entry[]
  if (blankRowsNeeded > 0) {
    // Insert blank rows between liability and equity sections
    const blankRows = Array.from({ length: blankRowsNeeded }, () => createBlankEntry())
    rightColumnEntries = [...processedLiabilities, ...blankRows, ...processedEquity]
  } else {
    // No blank rows needed - right column has enough or more rows
    rightColumnEntries = rightColumnBeforeBlankFill
  }

  // Assign line numbers sequentially: assets first, then right column continues
  const numberedAssets = assignLineNumbers(processedAssets, 1)
  const assetMaxLineNumber = getMaxLineNumber(numberedAssets)
  const numberedRightColumn = assignLineNumbers(rightColumnEntries, assetMaxLineNumber + 1)

  // Zip into row-oriented structure
  const rows = zipToBalanceSheetRows(numberedAssets, numberedRightColumn)

  return {
    class: 'balance_sheet',
    headers,
    rows,
  }
}

/**
 * Builds display data for single-column reports (income statement, etc.)
 */
function buildSingleColumnDisplayData(report: Report): ReportDisplayData {
  const amountTypeTitles = report.amountTypes.map((t) => i18n.global.t(`report.amountTypeEnum.${t}`))

  // For single column, use first section's title or report title
  const sectionTitle = report.sections[0]?.title ?? report.title
  const headers: Header[] = [
    {
      title: sectionTitle,
      lineNumberLabel: i18n.global.t('report.chart.lineNumber'),
      amountTypes: amountTypeTitles,
    },
  ]

  // Flatten all sections into single entry list
  const allEntries: Entry[] = []
  for (const section of report.sections) {
    allEntries.push(...getItemsFromSection(section))
  }

  // Process entries
  const processedEntries = assignLineNumbers(calculateIndentation(allEntries))

  return {
    class: report.class,
    headers,
    entries: processedEntries,
  }
}

/**
 * Recursively extracts items from a section and its nested subsections.
 * Subsection items come before parent section items (depth-first).
 */
function getItemsFromSection(section: Section): Entry[] {
  const entries: Entry[] = []

  // Process nested sections first (depth-first)
  if (section.sections) {
    for (const subsection of section.sections) {
      entries.push(...getItemsFromSection(subsection))
    }
  }

  // Then add items at current section level
  if (section.items) {
    entries.push(...section.items.map(itemToEntry))
  }

  return entries
}

/**
 * Converts Item to Entry with default values.
 */
function itemToEntry(item: Item): Entry {
  return {
    ...item,
    indentation: 0,
  }
}

/**
 * Creates a blank entry for padding rows.
 */
function createBlankEntry(): Entry {
  return {
    id: crypto.randomUUID(),
    text: '',
    level: 0,
    sumFactor: 0,
    dataSource: 'none',
    indentation: 0,
  }
}

/**
 * Calculates indentation for each entry based on nesting level and parent context.
 *
 * Indentation rules:
 * - Base indentation from `level` property (each level = 1 rem from STARTS_FROM)
 * - Breakdown items inherit parent's indentation (ignore own level)
 * - If parent has sum factor prefix (加：/减：), breakdown items get +1 rem to align with text
 * - Sum factor items (加：/减：) are identified by prefixes without extra indentation
 *
 * @returns New array with indentation calculated (pure function)
 */
function calculateIndentation(entries: Entry[]): Entry[] {
  const LEVEL_STARTS_FROM = 1

  // Track state for sum factor continuation detection (for prefix display logic)
  let preservedSumFactor = Number.MIN_SAFE_INTEGER

  // Track last non-breakdown item at each level to find parent
  const lastNonBreakdownByLevel: Map<number, { indentation: number; hasSumFactor: boolean }> = new Map()

  return entries.map((entry) => {
    const entryLevel = entry.level ?? 0

    // Track if this is a sum factor continuation (not the first item in group)
    let isSumFactorContinuation = false

    // Track sum factor state for prefix display logic
    const hasSumFactor = entry.displaySumFactor || (entry.sumFactor === preservedSumFactor && entry.sumFactor !== 0)

    if (entry.displaySumFactor) {
      // First item in sum factor group - update preserved sum factor
      preservedSumFactor = entry.sumFactor
    } else if (entry.sumFactor === preservedSumFactor && entry.sumFactor !== 0) {
      // Continuation item in same sum factor group
      isSumFactorContinuation = true
    }

    // Calculate indentation
    let indentation: number

    if (entry.isBreakdownItem && entryLevel > LEVEL_STARTS_FROM) {
      // Breakdown items inherit parent's indentation
      const parentLevel = entryLevel - 1
      const parent = lastNonBreakdownByLevel.get(parentLevel)

      if (parent) {
        // Use parent's indentation
        indentation = parent.indentation
        // If parent has sum factor prefix, add +1 rem to align with parent's text
        if (parent.hasSumFactor) {
          indentation += 1
        }
      } else {
        // Fallback: use level-based indentation if no parent found
        indentation = Math.max(0, entryLevel - LEVEL_STARTS_FROM)
      }
    } else {
      // Non-breakdown items use level-based indentation
      indentation = Math.max(0, entryLevel - LEVEL_STARTS_FROM)

      // Update tracking for non-breakdown items
      lastNonBreakdownByLevel.set(entryLevel, { indentation, hasSumFactor })
    }

    return {
      ...entry,
      indentation: indentation * 2,
      isSumFactorContinuation,
    }
  })
}

/**
 * Assigns sequential line numbers to entries with dataSource 'formulas' or 'sum'.
 * Other entries remain without line numbers.
 *
 * @param entries - The entries to process
 * @param startFrom - The starting line number (default 1)
 * @returns New array with line numbers assigned (pure function)
 */
function assignLineNumbers(entries: Entry[], startFrom: number = 1): Entry[] {
  let lineNumber = startFrom

  return entries.map((entry) => {
    if (entry.dataSource === 'formulas' || entry.dataSource === 'sum') {
      return {
        ...entry,
        lineNumber: lineNumber++,
      }
    }
    return entry
  })
}

/**
 * Gets the maximum line number from an array of entries.
 * Returns 0 if no entries have line numbers.
 */
function getMaxLineNumber(entries: Entry[]): number {
  return entries.reduce((max, entry) => {
    return entry.lineNumber != null ? Math.max(max, entry.lineNumber) : max
  }, 0)
}

/**
 * Zips two entry arrays into row-oriented balance sheet structure.
 * Shorter column gets blank cells to align with longer column.
 *
 * @returns Array of rows where each row has asset and liability cells
 */
function zipToBalanceSheetRows(assetEntries: Entry[], liabilityEntries: Entry[]): BalanceSheetRow[] {
  const maxLength = Math.max(assetEntries.length, liabilityEntries.length)
  const rows: BalanceSheetRow[] = []

  for (let i = 0; i < maxLength; i++) {
    const assetEntry = assetEntries[i] ?? null
    const liabilityEntry = liabilityEntries[i] ?? null

    rows.push({
      asset: createCell(assetEntry),
      liability: createCell(liabilityEntry),
    })
  }

  return rows
}

/**
 * Creates a BalanceSheetCell from an entry (or null for blank cell).
 */
function createCell(entry: Entry | null): BalanceSheetCell {
  return {
    entry,
    isBlank: entry === null,
  }
}
