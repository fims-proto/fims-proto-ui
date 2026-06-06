const RAW_LEVEL_WIDTH = 6

/**
 * Convert a backend rawAccountNumber to a frontend display accountNumber.
 *
 * rawAccountNumber: each level is exactly 6 chars wide (zero-padded).
 * accountsCodeLength: SoB-configured display width per level.
 *
 * @example
 * rawToDisplay("003401000001", [4, 2, 2]) → "340101"
 * // Level 1: "003401" (6 chars) → 3401 → re-padded to 4 chars → "3401"
 * // Level 2: "000001" (6 chars) → 1 → re-padded to 2 chars → "01"
 * // Result: "3401" + "01" = "340101"
 *
 * @throws if raw length is not divisible by 6 (data corruption)
 * @throws if parseInt produces NaN (data corruption)
 * @throws if accountsCodeLength is too short for the number of levels
 */
export function rawToDisplay(rawAccountNumber: string, accountsCodeLength: readonly number[]): string {
  if (!rawAccountNumber) return ''

  const rawLength = rawAccountNumber.length
  if (rawLength % RAW_LEVEL_WIDTH !== 0) {
    throw new Error(
      `[rawToDisplay] rawAccountNumber "${rawAccountNumber}" has length ${rawLength}, ` +
        `which is not divisible by ${RAW_LEVEL_WIDTH}. This indicates corrupted data.`,
    )
  }

  const levelCount = rawLength / RAW_LEVEL_WIDTH
  const segments: string[] = []

  for (let i = 0; i < levelCount; i++) {
    const chunk = rawAccountNumber.slice(i * RAW_LEVEL_WIDTH, (i + 1) * RAW_LEVEL_WIDTH)
    const numeric = parseInt(chunk, 10)

    if (isNaN(numeric)) {
      throw new Error(
        `[rawToDisplay] Level ${i + 1} chunk "${chunk}" could not be parsed as integer. ` +
          `This indicates corrupted data.`,
      )
    }

    const padLen = accountsCodeLength[i]
    if (padLen === undefined) {
      throw new Error(
        `[rawToDisplay] Level ${i + 1} is out of bounds for accountsCodeLength ` +
          `[${accountsCodeLength}]. This indicates a configuration mismatch.`,
      )
    }

    segments.push(numeric.toString().padStart(padLen, '0'))
  }

  return segments.join('')
}

/**
 * Convert a frontend display accountNumber to a backend rawAccountNumber.
 *
 * accountNumber: each level is padded per SoB's accountsCodeLength.
 * accountsCodeLength: SoB-configured display width per level.
 *
 * @example
 * displayToRaw("340101", [4, 2, 2]) → "003401000001"
 * // Level 1: "3401" (from position 0..4) → 3401 → re-padded to 6 chars → "003401"
 * // Level 2: "01" (from position 4..6) → 1 → re-padded to 6 chars → "000001"
 * // Result: "003401" + "000001" = "003401000001"
 *
 * @throws if accountNumber length doesn't match any cumulative sum of accountsCodeLength
 * @throws if parseInt produces NaN (data corruption)
 */
export function displayToRaw(accountNumber: string, accountsCodeLength: readonly number[]): string {
  if (!accountNumber) return ''

  // Build cumulative lengths: [4, 2, 2] → [4, 6, 8]
  const cumulativeLengths: number[] = []
  let sum = 0
  for (const len of accountsCodeLength) {
    sum += len
    cumulativeLengths.push(sum)
  }

  // Determine level by matching accountNumber.length to a cumulative sum
  const levelCount = cumulativeLengths.findIndex((cumLen) => cumLen === accountNumber.length) + 1

  if (levelCount === 0 || levelCount < 1) {
    throw new Error(
      `[displayToRaw] accountNumber "${accountNumber}" has length ${accountNumber.length}, ` +
        `which doesn't match any level boundary in accountsCodeLength [${accountsCodeLength}] ` +
        `(cumulative: [${cumulativeLengths}]). This indicates a configuration mismatch or corrupted data.`,
    )
  }

  const chunks: string[] = []
  let cursor = 0

  for (let i = 0; i < levelCount; i++) {
    const segLen = accountsCodeLength[i]
    if (segLen === undefined) {
      throw new Error(
        `[displayToRaw] Level ${i + 1} is out of bounds for accountsCodeLength ` +
          `[${accountsCodeLength}]. This indicates a configuration mismatch.`,
      )
    }

    const segment = accountNumber.slice(cursor, cursor + segLen)
    cursor += segLen

    const numeric = parseInt(segment, 10)

    if (isNaN(numeric)) {
      throw new Error(
        `[displayToRaw] Level ${i + 1} segment "${segment}" could not be parsed as integer. ` +
          `This indicates corrupted data.`,
      )
    }

    chunks.push(numeric.toString().padStart(RAW_LEVEL_WIDTH, '0'))
  }

  return chunks.join('')
}
