# FIMS Domain Context

## Report Module

### Report Template

One per SOB per Report Class. Defines the structural blueprint as Report Columns and a Report Row tree, without period-specific amounts. Never has a period.

### Report Instance

One per SOB per Report Class per Period. Generated from the corresponding Report Template with amounts computed from ledger data or cash-flow classifications.

### Report Class

The financial statement type: Balance Sheet, Income Statement, or Cash Flow Statement. Determines the valid columns, row structure, expressions, and display layout.

### Report Column

A configured amount column on a Report. Each column has a label and a value type such as period amount, year-to-date amount, year opening balance, or period ending balance.

### Report Row

A line in a Report's row tree. A row has display text, optional child rows, an optional visible line number, a sum factor for parent aggregation, an optional sum-factor display prefix, and exactly one Report Expression.

### Report Expression

The calculation rule owned by a Report Row. Expressions can reference ledger accounts, cash-flow items, earlier rows, child rows, or no data.

### Row Reference

A reference from one Report Expression to another Report Row by row code. Row references are used when a report total is calculated from specific previously evaluated rows rather than from direct children.

### Cash Flow Statement

The third mandatory financial report alongside the Balance Sheet and Income Statement. It reports cash movement using Cash Flow Items and includes a reconciliation from opening cash to ending cash.

### Cash Equivalent Account

An account counted as cash or cash equivalent in Cash Flow Statement reconciliation. Journal lines posted to a Cash Equivalent Account do not need a Cash Flow Item.

### Cash Flow Item

A cash-flow classification assigned to non-cash journal lines when a journal moves value between Cash Equivalent Accounts and non-cash accounts.

### Generate (Report)

Creating a missing Report Instance from the corresponding Report Template. Idempotent: if the instance already exists, generation returns the existing instance unchanged.

### Regenerate (Report)

Rebuilding an existing Report Instance from the latest Report Template and recalculating amounts. Regeneration may replace instance-level structural edits.

### Recalculate (Report)

Recomputing amounts for an existing Report Instance while preserving that instance's current row and expression structure.

## Period Module

### Close Warning

A non-fatal outcome returned when a Period Close or Batch Close succeeds but one or more Report Instances fail to auto-generate. Delivered as `{ warnings: string[] }` with HTTP 200 (vs HTTP 204 for a clean, warning-free close). The period is fully closed; the user must manually generate the failed reports afterward.
