/**
 * Transformation helpers for converting between Report domain types
 * and UpdateReportRequest API types.
 *
 * These helpers centralize the logic for transforming formulas and items,
 * which was previously duplicated in multiple places.
 */

import type { Formula, Item } from '@/services/report/types'
import type {
  UpdateReportRequestItemFormula,
  UpdateReportRequestItem,
  UpdateReportRequest,
  UpdateReportRequestSection,
} from '@/services/report/types'

/**
 * Transforms Formula objects (with full Account objects) to UpdateReportRequestItemFormula
 * format (with just accountNumber strings).
 *
 * This is used when preparing data for API submission, as the backend only needs
 * the account number, not the full account details.
 *
 * @param formulas - Array of Formula objects with full Account data
 * @returns Array of simplified formulas with just accountNumber, or undefined if input is undefined
 *
 * @example
 * ```typescript
 * const formulas = [
 *   { id: '...', account: { accountNumber: '1000', ... }, sumFactor: 1, rule: 'debit' }
 * ]
 * const apiFormulas = transformFormulasToRequest(formulas)
 * // Result: [{ accountNumber: '1000', sumFactor: 1, rule: 'debit' }]
 * ```
 */
export function transformFormulasToRequest(formulas?: Formula[]): UpdateReportRequestItemFormula[] | undefined {
  return formulas?.map((formula) => ({
    id: formula.id,
    accountNumber: formula.account.accountNumber,
    sumFactor: formula.sumFactor,
    rule: formula.rule,
  }))
}

/**
 * Transforms an Item (domain model) to UpdateReportRequestItem (API DTO).
 *
 * This performs a shallow copy of all item properties and transforms the formulas
 * from the rich domain format to the lean API format.
 *
 * @param item - Item object with full Formula data
 * @returns UpdateReportRequestItem with simplified formula format
 *
 * @example
 * ```typescript
 * const item = {
 *   id: '123',
 *   text: 'Revenue',
 *   level: 1,
 *   formulas: [{ account: { accountNumber: '4000', ... }, sumFactor: 1, rule: 'credit' }],
 *   ...
 * }
 * const apiItem = transformItemToRequest(item)
 * // Result: { ...item, formulas: [{ accountNumber: '4000', sumFactor: 1, rule: 'credit' }] }
 * ```
 */
export function transformItemToRequest(item: Item): UpdateReportRequestItem {
  return {
    ...item,
    formulas: transformFormulasToRequest(item.formulas),
  }
}

/**
 * Removes temporary IDs (starting with 'new-') from items in an UpdateReportRequest.
 *
 * When new items are created on the frontend, they're assigned temporary IDs with the
 * prefix 'new-' for tracking purposes. The backend doesn't accept these temporary IDs
 * and expects items without IDs to be treated as new items that need UUID generation.
 *
 * This function recursively processes all sections and their items, removing the 'id'
 * field from any item where the ID starts with 'new-'.
 *
 * @param request - The UpdateReportRequest object to clean
 * @returns A new UpdateReportRequest object with temporary IDs removed
 *
 * @example
 * ```typescript
 * const request = {
 *   sections: [{
 *     id: 'section-uuid',
 *     items: [
 *       { id: 'existing-uuid', text: 'Item 1', ... },
 *       { id: 'new-123-456', text: 'Item 2', ... }
 *     ]
 *   }]
 * }
 * const cleaned = cleanTemporaryIds(request)
 * // Result: items[1] will have no 'id' field, items[0] keeps its ID
 * ```
 */
export function cleanTemporaryIds(request: UpdateReportRequest): UpdateReportRequest {
  function cleanSection(section: UpdateReportRequestSection): UpdateReportRequestSection {
    return {
      ...section,
      sections: section.sections?.map(cleanSection),
      items: section.items.map(cleanItem),
    }
  }

  function cleanItem(item: UpdateReportRequestItem): UpdateReportRequestItem {
    // If the item has a temporary ID (starts with 'new-'), remove it
    if (item.id?.startsWith('new-')) {
      const { id, ...itemWithoutId } = item
      return itemWithoutId as UpdateReportRequestItem
    }
    // Keep existing valid IDs
    return item
  }

  return {
    ...request,
    sections: request.sections.map(cleanSection),
  }
}
