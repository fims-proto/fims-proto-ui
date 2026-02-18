/**
 * Generic tree mutation utilities for hierarchical section/item structures.
 *
 * These utilities work with any tree structure that follows the pattern:
 * { sections?: TSection[], items: TItem[] }
 *
 * This allows for type-safe, reusable tree operations across different data structures.
 */

/**
 * Base interface for tree nodes that contain sections and items.
 * TSection must extend TreeNode to support recursive nesting.
 * Items can be optional (for Section type) or required (for UpdateReportRequestSection type).
 */
export interface TreeNode<TSection, TItem> {
  sections?: TSection[]
  items?: TItem[]
}

/**
 * Options for inserting an item into a tree.
 * TItem is the input item type, TOutput is the type after transformation (defaults to TItem).
 */
export interface TreeInsertionOptions<TItem, TOutput = TItem> {
  /** Predicate function to identify the reference item */
  findReference: (item: TOutput) => boolean
  /** Optional transform function to apply to the item before insertion */
  transformItem?: (item: TItem) => TOutput
  /** Position relative to the reference item */
  position: 'before' | 'after' | 'child'
}

/**
 * Recursively finds an item in a tree and inserts a new item relative to it.
 *
 * @param sections - Array of sections to search through
 * @param itemToInsert - The item to insert
 * @param options - Insertion options including reference finder, transform, and position
 * @returns true if insertion succeeded, false if reference item not found
 *
 * @example
 * ```typescript
 * // Insert after a specific item with transformation
 * insertItemInTree(report.sections, newItem, {
 *   findReference: (item) => item.id === refId,
 *   transformItem: (item) => ({ ...item, formulas: transformFormulas(item.formulas) }),
 *   position: 'after'
 * })
 * ```
 */
export function insertItemInTree<
  TSection extends TreeNode<TSection, TStoredItem>,
  TInputItem extends { level: number },
  TStoredItem extends { level: number } = TInputItem
>(
  sections: TSection[],
  itemToInsert: TInputItem,
  options: TreeInsertionOptions<TInputItem, TStoredItem>
): boolean {
  const { findReference, transformItem, position } = options

  for (const section of sections) {
    // Skip sections without items
    if (!section.items) {
      if (section.sections && insertItemInTree(section.sections, itemToInsert, options)) {
        return true
      }
      continue
    }

    const refIndex = section.items.findIndex(findReference)

    if (refIndex !== -1) {
      // Found the reference item - calculate insertion index
      let insertIndex: number

      if (position === 'before') {
        insertIndex = refIndex
      } else {
        // Both 'after' and 'child' need to account for descendants
        insertIndex = findIndexAfterDescendants(section.items, refIndex)
      }

      // Apply transformation if provided
      const processedItem = transformItem ? transformItem(itemToInsert) : (itemToInsert as unknown as TStoredItem)

      // Insert the item
      section.items.splice(insertIndex, 0, processedItem)
      return true
    }

    // Recurse into subsections
    if (section.sections && insertItemInTree(section.sections, itemToInsert, options)) {
      return true
    }
  }

  return false
}

/**
 * Recursively finds and updates an item in a tree.
 *
 * @param sections - Array of sections to search through
 * @param findItem - Predicate function to identify the item to update
 * @param updateFn - Function that takes the old item and returns the updated item
 * @returns true if update succeeded, false if item not found
 *
 * @example
 * ```typescript
 * updateItemInTree(
 *   report.sections,
 *   (item) => item.id === itemId,
 *   (oldItem) => ({ ...oldItem, text: 'Updated text' })
 * )
 * ```
 */
export function updateItemInTree<
  TSection extends TreeNode<TSection, TItem>,
  TItem
>(
  sections: TSection[],
  findItem: (item: TItem) => boolean,
  updateFn: (item: TItem) => TItem
): boolean {
  for (const section of sections) {
    // Skip sections without items
    if (!section.items) {
      if (section.sections && updateItemInTree(section.sections, findItem, updateFn)) {
        return true
      }
      continue
    }

    const itemIndex = section.items.findIndex(findItem)

    if (itemIndex !== -1) {
      const item = section.items[itemIndex]
      if (item !== undefined) {
        section.items[itemIndex] = updateFn(item)
      }
      return true
    }

    // Recurse into subsections
    if (section.sections && updateItemInTree(section.sections, findItem, updateFn)) {
      return true
    }
  }

  return false
}

/**
 * Recursively finds and deletes an item from a tree.
 *
 * @param sections - Array of sections to search through
 * @param findItem - Predicate function to identify the item to delete
 * @returns true if deletion succeeded, false if item not found
 *
 * @example
 * ```typescript
 * deleteItemFromTree(
 *   report.sections,
 *   (item) => item.id === itemIdToDelete
 * )
 * ```
 */
export function deleteItemFromTree<
  TSection extends TreeNode<TSection, TItem>,
  TItem
>(
  sections: TSection[],
  findItem: (item: TItem) => boolean
): boolean {
  for (const section of sections) {
    // Skip sections without items
    if (!section.items) {
      if (section.sections && deleteItemFromTree(section.sections, findItem)) {
        return true
      }
      continue
    }

    const itemIndex = section.items.findIndex(findItem)

    if (itemIndex !== -1) {
      section.items.splice(itemIndex, 1)
      return true
    }

    // Recurse into subsections
    if (section.sections && deleteItemFromTree(section.sections, findItem)) {
      return true
    }
  }

  return false
}

/**
 * Finds the index position after all descendants of a reference item.
 * This is used to determine where to insert items when using 'after' or 'child' positions.
 *
 * Descendants are items with a higher level (more nested) than the reference item.
 * This function scans forward from the reference item until it finds an item at the
 * same or lower level, or reaches the end of the array.
 *
 * @param items - Array of items with level properties
 * @param refIndex - Index of the reference item
 * @returns The index after all descendants (insertion point)
 *
 * @example
 * ```typescript
 * // Items with levels: [0, 1, 2, 2, 1, 0]
 * // If refIndex = 1 (level 1), this returns 4
 * // (after items at levels 2, 2, which are descendants)
 * ```
 */
function findIndexAfterDescendants<T extends { level: number }>(
  items: T[],
  refIndex: number
): number {
  const refItem = items[refIndex]
  if (!refItem) return refIndex + 1

  const refLevel = refItem.level
  let currentIndex = refIndex + 1

  // Scan forward while items have a higher level (are descendants)
  while (currentIndex < items.length) {
    const currentItem = items[currentIndex]
    if (currentItem && currentItem.level <= refLevel) {
      break
    }
    currentIndex++
  }

  return currentIndex
}
