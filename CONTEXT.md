# FIMS Domain Context

## Report Module

### Report Template

One per SOB per Report Class. Defines the structural blueprint (sections, items, formulas) without period-specific amounts. Fetched via `GET /sob/{sobId}/report/template?class=...`. Updated via `PATCH /sob/{sobId}/report/{reportId}`. Never has a period.

### Report Instance

One per SOB per Report Class per Period — enforced at the backend. Generated from the corresponding template with amounts computed from ledger data. Fetched via `GET /sob/{sobId}/report?class=...&period=...`. Returns 404 if not yet generated.

### Report Class

Enum: `balance_sheet` | `income_statement`. Determines the type of financial report, valid amount types, and display layout (two-column for balance sheet, single-column for income statement).

### Generate (Report)

Creating a new Report Instance (or re-creating an existing one) via `POST /sob/{sobId}/report/generate?class=...&period=...`. No request body. Idempotent — regenerates amounts if an instance already exists. Used only for the initial "Generate" action when no instance exists yet.

### Regenerate (Report)

Recalculating amounts for an **existing** Report Instance after structural edits, via `POST /sob/{sobId}/report/{reportId}/regenerate`. Called automatically after updating an instance's structure, and available as a manual "重新生成" header button (always shown for non-template reports).

## Period Module

### Close Warning

A non-fatal outcome returned when a Period Close or Batch Close succeeds but one or more Report Instances fail to auto-generate. Delivered as `{ warnings: string[] }` with HTTP 200 (vs HTTP 204 for a clean, warning-free close). The period is fully closed; the user must manually generate the failed reports afterward.
