# ADR-0001: Report Instances Addressed by Class+Period in the UI

**Date:** 2026-05-17  
**Status:** Accepted

## Context

The report module previously allowed unlimited Report Instances per template (identified by UUID in the URL). The backend domain model changed to enforce at most one Report Instance per SOB per Report Class per Period. The frontend needed to align with this constraint.

## Decision

Report Instances are addressed in the UI by `class+period` (query params in the route: `/sobs/:sobId/report?class=balance_sheet&period=2024-03`) rather than by UUID. Template mode uses `?mode=template`.

The old paginated list of reports is replaced by a single page where the user selects class via dropdown and period via the period selector.

## Alternatives Considered

**Keep UUID routing with a class+period lookup:** The page would fetch reports by UUID, requiring an extra lookup step (class+period → UUID) on page load from URL. This hides the uniqueness constraint from users and adds complexity.

## Consequences

- Old report URLs (`/sobs/:sobId/reports/:reportId`) are broken — no migration path needed since this is a prototype.
- The `GET /sob/{sobId}/report/{reportId}` endpoint is no longer called; fetching is now by `class+period` or `template` query params.
- The uniqueness constraint (1 instance per class+period) is surfaced naturally in the UI — navigating to a class+period either shows the existing report or shows an empty state with a "Generate" button.
