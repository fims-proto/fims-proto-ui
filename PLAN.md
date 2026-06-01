# Frontend Plan: Report row indent + display order fix

## Context

The backend is adding an `indent: number` field to every `Row`. This replaces the frontend's computed `depth` for indentation. Separately, the traversal order in `rowsToEntries` must be fixed: `children_sum` rows (totals) should appear **after** their children; all other rows appear **before** their children.

## Changes

### 1. `src/services/report/types.ts`
- Add `indent: z.number().int()` to `RowSchema`
- Add `indent: z.number().int()` to `UpdateRowRequestSchema`
- Types are inferred — no manual type edits needed

### 2. `src/components/report/report-display-types.ts`
- Remove `depth: number` from `Entry` (no longer needed — use `row.indent` directly)

### 3. `src/components/report/report-display-helper.ts`
- Replace `rowsToEntries(rows, depth)` with traversal order based on expression kind:
  - `children_sum` → recurse into children first, then push parent (post-order)
  - all others → push parent first, then recurse into children (pre-order)
- Remove the `depth` parameter entirely

```ts
export function rowsToEntries(rows: Row[]): Entry[] {
  const entries: Entry[] = []
  for (const row of rows) {
    if (row.expression.kind === 'children_sum') {
      entries.push(...rowsToEntries(row.rows ?? []))
      entries.push({ ...row })
    } else {
      entries.push({ ...row })
      entries.push(...rowsToEntries(row.rows ?? []))
    }
  }
  return entries
}
```

### 4. `src/components/report/table/ReportEntryCell.vue`
- Change `entry.depth * 1.5rem` → `entry.indent * 1.5rem`

### 5. `src/components/report/report-transforms.ts`
- Add `indent: row.indent` to `transformRowToRequest`

## Verification

1. Open Balance Sheet: 存货 appears before 原材料/在产品/库存商品/周转材料; 流动资产合计 appears after all its children.
2. Rows with `indent: 0` (流动资产合计, 流动资产：, 资产总计, etc.) have no left margin.
3. Rows with `indent: 1` (货币资金, 存货, etc.) are indented one level.
4. Rows with `indent: 2` (原材料, etc.) are indented two levels.
5. Income Statement and Cash Flow Statement totals appear at the bottom of their sections.
6. Report editor still renders and saves rows correctly.
