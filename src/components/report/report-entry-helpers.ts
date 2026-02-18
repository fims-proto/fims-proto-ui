import type { Entry } from './report-display-types'

/**
 * Prefix information for rendering entry text with sum factor and breakdown indicators.
 */
export type EntryPrefixInfo = {
  /** Sum factor prefix text (e.g., "加：" or "减：") - always present for alignment */
  sumFactorText: string | null
  /** Whether sum factor prefix should be visible (only first in group) */
  sumFactorVisible: boolean
  /** Breakdown prefix text (e.g., "其中：") - always present for alignment */
  breakdownText: string | null
  /** Whether breakdown prefix should be visible (only first in breakdown) */
  breakdownVisible: boolean
}

/**
 * Get prefix information for rendering an entry.
 *
 * This function handles the logic for displaying sum factor (加：/减：) and breakdown (其中：)
 * prefixes. Prefixes are always rendered for alignment purposes but conditionally hidden
 * based on whether this entry is the first in its group.
 *
 * @param entry - The current entry to get prefix info for
 * @param prevEntry - The previous entry in the list (for continuation detection)
 * @param t - i18n translate function
 * @returns Prefix information with text and visibility flags
 */
export function getEntryPrefixInfo(
  entry: Entry,
  prevEntry: Entry | null,
  t: (key: string) => string
): EntryPrefixInfo {
  // Sum factor prefix logic
  let sumFactorText: string | null = null
  let sumFactorVisible = false

  if ((entry.displaySumFactor || entry.isSumFactorContinuation) && entry.sumFactor !== 0) {
    sumFactorText = t(`report.chart.sumFactorEnum.${entry.sumFactor}`)
    // Only visible on the first item in the sum factor group
    sumFactorVisible = entry.displaySumFactor === true
  }

  // Breakdown prefix logic
  let breakdownText: string | null = null
  let breakdownVisible = false

  if (entry.isBreakdownItem) {
    breakdownText = t('report.chart.breakdown')
    // Only visible on the first item in breakdown group (when prev is not a breakdown item)
    breakdownVisible = prevEntry?.isBreakdownItem !== true
  }

  return {
    sumFactorText,
    sumFactorVisible,
    breakdownText,
    breakdownVisible,
  }
}
