# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FIMS (Financial Information Management System)** - A Vue 3 + TypeScript SPA for managing accounting data including accounts, vouchers, ledgers, and financial reports.

**Tech Stack:**

- Vue 3 (Composition API with `<script setup>`)
- TypeScript (strict mode)
- shadcn-vue UI components
- Tailwind CSS v4
- Vite build tool
- Ory Kratos authentication
- vue-i18n (primary locale: zh-CN)

## Essential Commands

```bash
# Development
npm run dev      # Start dev server on localhost:5001

# Build
npm run build    # TypeScript check + production build
npm run preview  # Preview production build

# shadcn-vue components
npx shadcn-vue@latest add <component-name>  # Add single component
./update-shadcn-components.sh               # Update all components
```

## API Reference

### OpenAPI Specification

The backend API contract is documented in **`swagger/swagger.yaml`** (OpenAPI 2.0 format).

**Key details:**

- **Base URL:** `http://127.0.0.1:4455/fims/api/v1`
- **Swagger UI:** `http://127.0.0.1:4455/fims/swagger/index.html`
- **Format:** OpenAPI 2.0 (Swagger)

**Main resource tags:**

- `accounts` - Chart of accounts management
- `auxiliary accounts` - Auxiliary account categories and items
- `vouchers` - Journal entry vouchers (create, update, review, audit, post)
- `ledgers` - General ledger balances and transactions
- `periods` - Accounting periods management
- `reports` - Financial statement reports (balance sheet, income statement)
- `sobs` - Set of Books management
- `users` - User management

**Common patterns in the API:**

- All SOB-scoped endpoints use path parameter `{sobId}`
- Paginated endpoints support query params: `$page`, `$size`, `$sort`, `$filter`
- Error responses include `slug` (error code) and `message` fields
- Numeric/date fields may be returned as strings - requires conversion in frontend

**When implementing new features:**

1. Check `swagger/swagger.yaml` for exact request/response schemas
2. Use Zod schemas in `src/services/<domain>/types.ts` that match the OpenAPI definitions
3. All service methods must return `Response<T>` and use `invokeWithErrorHandler()`

## Code Architecture

### Custom Store Pattern (NO Pinia/Vuex)

**Directory structure:** `src/store/<feature>/`

- `state.ts` - reactive state definition
- `action.ts` - action functions
- `index.ts` - store composition

**Store composition pattern:**

```typescript
// index.ts
const state = createState()
const action = createAction(state)
export const useFeatureStore = () => ({ get state(), get action() })
```

**CRITICAL:** Always access via `useFeatureStore().state` or `.action` - never import state/action directly.

**When to create stores (use sparingly):**

- ✅ Application-wide global state (user session, working SOB)
- ✅ Cached reference data shared across components (allAccounts)
- ✅ Cross-component UI coordination (toast, confirmation dialogs)
- ❌ Page-specific business data (vouchers, ledgers, reports)
- ❌ CRUD operation state (form data, loading states)
- ❌ Paginated list data (manage with local `ref()`)

**Default to local `ref()` and direct service calls** for page-specific data.

**Examples:** `src/store/account/`, `src/store/sob/`, `src/store/user/`

### Service Layer (Backend Integration)

**Directory structure:** `src/services/<domain>/`

- `domain.ts` - service class with axios calls
- `types.ts` - Zod schemas and TypeScript types
- `field-conversion-types.ts` - field type mappings (optional)

**Type definition pattern:**

```typescript
// Define Zod schema first
export const AccountSchema = z.object({ ... })
// Then export TypeScript type
export type Account = z.infer<typeof AccountSchema>
```

**Service method requirements:**

- Return `Response<T>` with `{ data?: T, exception?: SlugError }`
- Wrap all calls in `invokeWithErrorHandler(async () => {...})`
- Convert backend string fields: `convertFieldsFromString(data, FIELD_CONVERSION_MAP)`

**Backend API reference:** `swagger/swagger.yaml` or `http://127.0.0.1:4455/fims/swagger/index.html`

**Example:** `src/services/general-ledger/account/domain.ts`

### Multi-Panel Layout & Routing

**Named views pattern:**

- Routes use `list` and `main` views (see `AppLayout.vue`)
- Both rendered side-by-side in `ResizablePanel`
- Specify which view renders component in route config

**Navigation guards (always in this order):**

1. Before Enter: `verifyCurrentUser` → `loadWorkingSob` → `updateWorkingSob`
2. Before Leave: `protectUnsavedChanges` (checks `useUnsavedChangesStore().state.isDirty`)

**SOB context:** Most routes include `:sobId` param - working SOB is loaded/validated by guards.

### Component Organization

- `src/components/ui/` - shadcn-vue (CLI-managed, DO NOT edit manually)
- `src/components/common/` - reusable patterns (data-table, confirmation, page, list, form)
- `src/components/<domain>/` - feature-specific (account, voucher, report, etc.)
- `src/components/sidebar/` - sidebar navigation components
- `src/components/pages/` - page-level components

**Path alias:** Use `@/` for `src/` (configured in vite.config.ts and components.json)

### Data Tables (@tanstack/vue-table)

**Pattern:**

- Define columns in separate `columns.ts` using `i18n.global.t()` for labels
- Use generic `DataTable.vue` from common components
- Tree data: pass `getSubRows` prop for hierarchical display
- Column headers: Use `DataTableColumnHeader` for sortable columns

**Example:** `src/components/account/columns.ts`

### Internationalization (i18n)

**CRITICAL RULE:** ALL user-facing text MUST use i18n - NO hardcoded strings.

**Usage:**

- Templates: `$t('key.path')` or `$t('key.path', [arg1, arg2])`
- Scripts/columns: `i18n.global.t('key.path')`

**Key structure in `src/i18n/zhCN.json`:**

```
common.*                    - shared terms (yes, no, save, cancel, noData)
action.*                    - action buttons (create, save, edit, remove)
table.*                     - data table UI (search, filter, sort)
<domain>.*                  - domain-specific (account, sob, voucher, report)
<domain>.<field>Enum.*      - enum translations (account.classEnum.1 = "资产")
```

**Placeholders:** `{0}`, `{1}` for positional args; `{key}` for named

### Environment Configuration

**Location:** `env/` directory (configured in vite.config.ts)

**Required variables:**

- `VITE_KRATOS_PUBLIC_URL` - Ory Kratos public API endpoint
- `VITE_FIMS_API_URL` - FIMS backend API endpoint

**Access:** `import.meta.env.VITE_*` (see `src/config.ts`)

## Domain-Specific Features

### Authentication (Ory Kratos)

- Service: `src/services/kratos/domain.ts`
- Guard: `verifyCurrentUser` checks for recovery login state
- Components: Login/Logout in `src/components/user/`

### SOB (Set of Books)

- **Concept:** All accounting data scoped to a Set of Books
- **Working SOB:** `useSobStore().state.workingSob` (persisted to localStorage)
- **Route pattern:** Most routes include `:sobId` param
- **API endpoints:** See `swagger/swagger.yaml` under `sobs` tag

### Accounts

- Parent-child tree via `superiorAccountId`
- Tree helper: `src/components/account/treefy.ts`
- Selection: `AccountInput.vue` provides combobox + table dialog
- **API endpoints:** See `swagger/swagger.yaml` under `accounts` tag
- **Key operations:** List all, create, update, search with filters

### Auxiliary Accounts

- Custom classification dimensions (e.g., departments, projects, customers)
- Two-level structure: Categories contain Accounts
- **API endpoints:** See `swagger/swagger.yaml` under `auxiliary accounts` tag

### Vouchers

- Journal entries with line items (debit/credit)
- Workflow: Create → Review → Audit → Post
- **API endpoints:** See `swagger/swagger.yaml` under `vouchers` tag
- **Lifecycle operations:** `review`, `cancel-review`, `audit`, `cancel-audit`, `post`

### Ledgers

- Account balances per period (opening, period activity, ending)
- Initialize opening balances via `/ledgers/initialize`
- **API endpoints:** See `swagger/swagger.yaml` under `ledgers` tag

### Periods

- Monthly accounting periods with open/closed status
- One current period per SOB
- **API endpoints:** See `swagger/swagger.yaml` under `periods` tag
- **Key operations:** List periods, get current, close period

### Reports (Financial Statements)

- Templates vs instances (see FRONTEND_DESIGN.md)
- Hierarchical sections → items → formulas
- Amount calculation from General Ledger data
- **API endpoints:** See `swagger/swagger.yaml` under `reports` tag
- **Key operations:** Generate from template, regenerate amounts, update item formulas

## Code Style Guidelines

### Code Style & Readability

- **Inline trivial functions**
  - If a function is a single line and used only once, inline it at the call site (especially in Vue views).
  - Avoid creating functions that add indirection without reuse.

- **Comments**
  - Use `//` for all comments by default.
  - Use `/** */` only for complex, non-obvious logic that requires multi-line explanation.
  - Do not comment obvious code; comment intent or edge cases only.

- **Minimal commenting**
  - Do not comment every function or variable.
  - If code needs many comments to be understood, refactor the code instead.

- **Guard clauses**
  - Prefer early return / fail-fast / break via guard clauses.
  - Avoid deep `if / else` nesting unless it improves clarity.

### TypeScript

- Strict mode enabled - no implicit any - do not use `as any` in anytime!
- Use `import type { ... }` for type-only imports
- Get types from `src/services/<domain>/types.ts`

### Vue Best Practices

- Always use `<script setup lang="ts">`
- Use `reactive()` for objects, `ref()` for primitives
- Prefer `computed()` over `watch()` for derived state
- Props: Type-safe `defineProps<{}>()` (no runtime validators)

### Styling

- **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- **Theme:** "new-york" style, neutral colors, CSS variables
- **Icons:** lucide-vue-next (e.g., `import { ChevronRight } from 'lucide-vue-next'`)

### Code Formatting

- **Prettier** with Tailwind plugin
- Single quotes, no semicolons, 2-space indent, 120 char line width
- Auto-formats Tailwind classes and Vue transition classes

### Linting

- ESLint with TypeScript and Vue plugins
- Check: Files are linted automatically via IDE integration
- Config: `eslint.config.js` (flat config format)

## Common Patterns & Solutions

### Backend Data Conversion

**Problem:** Backend returns dates/numbers as strings
**Solution:** Always use `convertFieldsFromString(data, FIELD_CONVERSION_MAP)` in services

### Store Reactivity

**Problem:** Store not reactive
**Solution:** Access via `useFeatureStore().state` or `.action` - never import directly

### Route Guard Order

**Problem:** Route guards fail
**Solution:** Ensure order: `verifyCurrentUser` → `loadWorkingSob` → `updateWorkingSob`

### Enum Translation

**Problem:** Enum values not translated
**Solution:** Use `i18n.global.t(\`domain.fieldEnum.\${value}\`)` pattern

### Named Views Not Rendering

**Problem:** Component not showing in layout
**Solution:** Specify which view (`list` or `main`) in route components config

### API Response Type Mismatch

**Problem:** TypeScript errors when consuming API responses
**Solution:** Check `swagger/swagger.yaml` for exact field types and create matching Zod schemas

## Key Files Reference

**Configuration:**

- `vite.config.ts` - Build config, aliases, dev server (port 5001)
- `components.json` - shadcn-vue configuration
- `tsconfig.json` - TypeScript config (strict mode)
- `.prettierrc` - Code formatting rules

**API Contract:**

- `swagger/swagger.yaml` - OpenAPI 2.0 specification for FIMS backend API

**Architecture:**

- `src/router/index.ts` - Route definitions with guards
- `src/components/AppLayout.vue` - Multi-panel layout with named views
- `src/i18n/zhCN.json` - All translation keys
- `src/services/*/types.ts` - Zod schemas and TypeScript types

**Stores:**

- `src/store/account/` - Account cache (complete example)
- `src/store/sob/` - Working SOB state
- `src/store/user/` - User session
- `src/store/toast/` - Toast notifications
- `src/store/confirmation/` - Confirmation dialogs
- `src/store/unsaved-changes/` - Unsaved changes tracking

**Services:**

- `src/services/general-ledger/account/` - Account CRUD
- `src/services/general-ledger/voucher/` - Voucher CRUD
- `src/services/general-ledger/ledger/` - Ledger queries
- `src/services/general-ledger/period/` - Period management
- `src/services/report/` - Report generation
- `src/services/sob/` - SOB management
- `src/services/kratos/` - Authentication
- `src/services/error-handler/` - Error handling utilities

## shadcn-vue Component Management

**IMPORTANT:** Components in `src/components/ui/` are CLI-managed. DO NOT edit manually.

**Adding components:**

```bash
npx shadcn-vue@latest add button dialog table
```

**Updating all components:**

```bash
./update-shadcn-components.sh
```

**Configuration:** See `components.json` for aliases and styling

## Important Business Rules

### SOB (Set of Books)

- All accounting data is scoped to a SOB
- Working SOB must be set before accessing accounting routes
- SOB is validated by route guards

### Account Hierarchy

- Accounts form parent-child trees via `superiorAccountId`
- Leaf accounts (`isLeaf=true`) can have transactions
- Parent accounts aggregate child balances
- `numberHierarchy` array shows full path from root

### Voucher Entry

- Must belong to a specific period (fiscalYear + periodNumber)
- Debits must equal credits
- Period must be open for posting
- Workflow: Draft → Reviewed → Audited → Posted

### Ledger Balances

- Opening balance initialized only for first period
- Subsequent periods inherit from previous period's ending balance
- Period debit/credit accumulate from posted voucher line items
- Ending balance = Opening ± Period activity

### Reports

- Templates (`template=true`) have no period
- Instances are generated from templates for specific periods
- Amount types must match report class:
  - Balance Sheet: `year_opening_balance`, `period_ending_balance`
  - Income Statement: `year_to_date_amount`, `period_amount`, `last_year_amount`
- Formula rules: `net`, `debit`, `credit`, `transaction` (see FRONTEND_DESIGN.md)

### Pagination & Filtering

- Most list endpoints support `$page`, `$size`, `$sort`, `$filter`
- Filter syntax: OData-style (e.g., `title eq 'something' and amount lt 10`)
- Default page size: 40

## Design Documentation

For detailed report module design, see `FRONTEND_DESIGN.md` which covers:

- Report API endpoints and data models
- UI component recommendations
- Formula calculation logic
- User workflows
- Localization keys

## Working with the API

### Reading the OpenAPI Spec

When implementing a new feature:

1. **Find the endpoint** in `swagger/swagger.yaml` under the relevant tag
2. **Check request schema** - Look at the `$ref` in the request body
3. **Check response schema** - Look at the `$ref` in the 200/201 response
4. **Review error responses** - Note the slug/message pattern for error handling
5. **Create Zod schemas** in `src/services/<domain>/types.ts` matching the definitions
6. **Implement service method** using the exact endpoint path and HTTP method

### Example: Implementing a new feature

To add support for posting a voucher:

1. **Check spec:** `POST /sob/{sobId}/voucher/{voucherId}/post`
2. **Request body:** `PostVoucherRequest` with `poster` field
3. **Response:** 204 No Content on success
4. **Service implementation:**

```typescript
async post(sobId: string, voucherId: string, poster: string): Promise<Response<void>> {
  return invokeWithErrorHandler(async () => {
    await axios.post(`/sob/${sobId}/voucher/${voucherId}/post`, { poster })
  })
}
```

## Notes

- **No test framework configured** - tests not part of current setup
- **Primary language:** Simplified Chinese (zh-CN)
- **Backend repo:** This is the UI-only repository; backend is separate
- **API contract:** Always reference `swagger/swagger.yaml` as source of truth for API schemas
