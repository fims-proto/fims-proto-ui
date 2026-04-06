# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**FIMS (Financial Information Management System)** - A Vue 3 + TypeScript SPA for managing accounting data including accounts, journals, ledgers, and financial reports.

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

# Code Quality
npm run type-check  # Check TypeScript without emitting
npm run lint        # Run ESLint on src/**/*.{js,ts,vue}
npm run check-fmt   # Check code formatting (Prettier)
npm run fmt         # Auto-format code with Prettier

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
- `dimension` - Dimension categories and members
- `journals` - Journal entry journals (create, update, review, audit, post)
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
2. Use Zod schemas in `src/services/<domain>/types.ts` that match OpenAPI definitions
3. All service methods must return `Response<T>` and use `invokeWithErrorHandler()`
4. Convert backend string fields: `convertFieldsFromString(data, FIELD_CONVERSION_MAP)`

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
- ❌ Page-specific business data (journals, ledgers, reports)
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
- `src/components/<domain>/` - feature-specific (account, journal, report, etc.)
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
<domain>.*                  - domain-specific (account, sob, journal, report)
<domain>.<field>Enum.*      - enum translations (account.classEnum.1 = "资产")
```

**Placeholders:** `{0}`, `{1}` for positional args; `{key}` for named

### Environment Configuration

**Location:** `env/.env.development` and `env/.env.production` (configured in vite.config.ts)

**Required variables:**

- `VITE_KRATOS_PUBLIC_URL` - Ory Kratos public API endpoint (e.g., `/kratos/public` for dev proxying, full URL for production)
- `VITE_FIMS_API_URL` - FIMS backend API base path (e.g., `/fims` for dev proxying)

**Note:** During development with Vite, the API is proxied through the dev server. In production, these should be absolute URLs or relative paths depending on your deployment setup.

**Access:** `import.meta.env.VITE_*` (see `src/config.ts`)

## Domain-Specific Features

### Authentication (Ory Kratos)

- Service: `src/services/kratos/domain.ts`
- Guard: `verifyCurrentUser` checks for recovery login state
- Components: Login/Logout in `src/components/user/`

### SOB (Set of Books)

- **Concept:** All accounting data is scoped to a Set of Books
- **Working SOB:** `useSobStore().state.workingSob` (persisted to localStorage)
- **Route pattern:** Most routes include `:sobId` param
- **API endpoints:** See `swagger/swagger.yaml` under `sobs` tag

### Accounts

- Parent-child tree via `superiorAccountId`
- Tree helper: `src/components/account/treefy.ts`
- Selection: `AccountInput.vue` provides combobox + table dialog
- **API endpoints:** See `swagger/swagger.yaml` under `accounts` tag
- **Key operations:** List all, create, update, search with filters

### Dimension

- Custom classification dimensions for analysis (departments, projects, customers, etc.)
- Two-level structure: Categories contain Dimension Options (members)
- Categories: Independent entities (name only, no key field)
- Options (Members): Independent entities (name only, no key/description fields)
- **API endpoints:** See `swagger/swagger.yaml` under `dimension` tag
- **Key operations:**
  - `GET /sob/{sobId}/dimension/categories` - List all dimension categories
  - `POST /sob/{sobId}/dimension/categories` - Create new dimension category
  - `GET /sob/{sobId}/dimension/category/{categoryId}` - Get dimension category details
  - `PATCH /sob/{sobId}/dimension/category/{categoryId}` - Update dimension category
  - `DELETE /sob/{sobId}/dimension/category/{categoryId}` - Delete dimension category
  - `GET /sob/{sobId}/dimension/category/{categoryId}/options` - List dimension options
  - `POST /sob/{sobId}/dimension/category/{categoryId}/options` - Create new dimension option
  - `PATCH /sob/{sobId}/dimension/category/{categoryId}/option/{optionId}` - Update dimension option
  - `DELETE /sob/{sobId}/dimension/category/{categoryId}/option/{optionId}` - Delete dimension option

### Journals

- Journal entries with journal lines (debit/credit)
- Workflow: Create → Review → Audit → Post
- **API endpoints:** See `swagger/swagger.yaml` under `journals` tag
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

- Templates vs instances
- Hierarchical sections → items → formulas
- Amount calculation from General Ledger data
- **API endpoints:** See `swagger/swagger.yaml` under `reports` tag
- **Key operations:** Generate from template, regenerate amounts, update item formulas

## Code Style Guidelines

When asked to plan or implement changes, start with the simplest approach that follows existing patterns in the codebase. Do NOT over-engineer, create wrapper components, or introduce new abstractions unless explicitly requested. Look for existing patterns first and reuse them.

When asked for backend-only or frontend-only analysis, stay strictly within that boundary. Do not include suggestions or changes for the other side unless explicitly asked.

### Debugging & Bug Fixes

Before implementing a fix for a bug, create a brief plan and confirm the approach. Do not jump straight into coding a fix without understanding the root cause first. When debugging, avoid rapid-fire guessing — instead, methodically trace the data flow.

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

## Development Workflow

### Initial Setup

1. Install dependencies: `npm install`
2. Verify environment: Check that `env/.env.development` contains:
   - `VITE_KRATOS_PUBLIC_URL=/kratos/public` (public API endpoint)
   - `VITE_FIMS_API_URL=/fims` (backend API base path)
3. Start dev server: `npm run dev` (runs on http://localhost:5001)
4. Verify API connectivity: Check browser console for successful Kratos/API calls

### Before Committing

1. Format code: `npm run fmt`
2. Check types: `npm run type-check`
3. Lint: `npm run lint`
4. Verify build: `npm run build` (catches TypeScript errors early)

### Debugging Common Issues

**Kratos authentication not working:**
- Check `VITE_KRATOS_PUBLIC_URL` points to Kratos public API (not admin)
- Verify Kratos service is running on expected port
- Check browser Network tab for failed requests

**API calls returning 404:**
- Verify `VITE_FIMS_API_URL` matches backend base path
- Check `swagger/swagger.yaml` for exact endpoint paths
- Ensure SOB is loaded via route guards before making API calls

**TypeScript errors after API changes:**
- Regenerate Zod schemas in `src/services/<domain>/types.ts` to match `swagger/swagger.yaml`
- Run `npm run type-check` to identify all mismatches

## Field Conversion System (Two-Layer Approach)

### Layer 1: Type Coercion (`convertFieldsFromString`)

**Purpose:** Generic string→number/date conversion (applied immediately after API response)
**Config location:** `*-field-conversion-types.ts` files
**Config format:** `FieldConversionRecord = { fieldName: 'number' | 'date' | nested }`

```typescript
// Example: src/services/general-ledger/field-conversion-types.ts
export const ACCOUNT_FIELDS_CONVERSION: FieldConversionRecord = {
  level: 'number',
  createdAt: 'date',
  updatedAt: 'date',
}
```

### Layer 2: Semantic Field Mapping (`convertAccountNumberFields`)

**Purpose:** Domain-specific field renaming + value conversion (e.g., `rawAccountNumber` → `accountNumber`)
**Config location:** `src/services/field-conversion/account-number.ts` (Walker) + `*-field-conversion-types.ts` (configs)
**Config format:** `AccountNumberConversionRecord = { sourceField: { fn: 'rawToDisplay' | 'displayToRaw', targetField: 'newName' } }`

```typescript
// Example: Convert backend rawAccountNumber to display accountNumber
export const ACCOUNT_AN_CONVERSION: AccountNumberConversionRecord = {
  rawAccountNumber: { fn: 'rawToDisplay', targetField: 'accountNumber' },
}
```

**Key insight:** Type coercion (number, date) is generic and applies everywhere. Field mapping (account numbers) is domain-specific and only applies at certain boundaries.

### Account Number Conversion Details

**Background:**
- Backend stores in `rawAccountNumber` format: 6 chars per level (system max), e.g., `"003401000001"`
- Frontend displays in `accountNumber` format: SoB-configured chars per level, e.g., `"340101"` with `accountsCodeLength=[4,2,2]`

**Conversion functions** (`src/services/field-conversion/account-number-pure-logic.ts`):
- `rawToDisplay(rawNum, codeLengths)` - 6-char → SoB-format
- `displayToRaw(displayNum, codeLengths)` - SoB-format → 6-char

**Example with `accountsCodeLength=[4,2,2]`:**
- Raw: `"003401000001"` → Display: `"340101"` (Level 1: "003401"→"3401", Level 2: "000001"→"01")
- Display: `"340101"` → Raw: `"003401000001"` (reverse)

**Usage in services:**
```typescript
// Response processing
const codeLengths = useSobStore().state.workingSob?.accountsCodeLength ?? []
convertAccountNumberFields(result.data, ACCOUNT_AN_CONVERSION, codeLengths)

// Request processing (before axios.post)
const requestCopy = JSON.parse(JSON.stringify(request))  // Deep copy
convertAccountNumberFields(requestCopy, REQUEST_CONVERSION, codeLengths)
await axios.post(endpoint, requestCopy)
```

**Important:** Store returns `readonly number[]` (Vue reactivity), so conversion functions accept `readonly number[]` not `number[]`.

## Common Patterns & Solutions

### Backend Data Conversion

**Problem:** Backend returns dates/numbers as strings, or field names don't match frontend types
**Solution:** 
1. Use `convertFieldsFromString(data, FIELD_CONVERSION_MAP)` for type coercion (string→number/date)
2. Use `convertAccountNumberFields(data, CONFIG, codeLengths)` for field mapping + value conversion (rawAccountNumber→accountNumber)
3. Apply conversions in service layer before returning to components

### Store Reactivity

**Problem:** Store not reactive
**Solution:** Access via `useFeatureStore().state` or `.action` - never import directly

### Route Guard Order

**Problem:** Route guards fail
**Solution:** Ensure order: `verifyCurrentUser` → `loadWorkingSob` → `updateWorkingSob`

### Enum Translation

**Problem:** Enum values not translated
**Solution:** Use `i18n.global.t(\\`domain.fieldEnum.\\${value}\\`)` pattern

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

**Stores:**

- `src/store/account/` - Account cache (complete example)
- `src/store/sob/` - Working SOB state
- `src/store/user/` - User session
- `src/store/toast/` - Toast notifications
- `src/store/confirmation/` - Confirmation dialogs
- `src/store/unsaved-changes/` - Unsaved changes tracking

**Services:**

- `src/services/general-ledger/account/` - Account CRUD
- `src/services/general-ledger/journal/` - Journal CRUD
- `src/services/general-ledger/ledger/` - Ledger queries
- `src/services/general-ledger/period/` - Period management
- `src/services/report/` - Report generation
- `src/services/sob/` - SOB management
- `src/services/dimension/` - Dimension categories and members management
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
- Tree helper: `src/components/account/treefy.ts`
- Leaf accounts (`isLeaf=true`) can have transactions
- Parent accounts aggregate child balances
- `numberHierarchy` array shows full path from root

### Journal Entry

- Must belong to a specific period (fiscalYear + periodNumber)
- Debits must equal credits
- Period must be open for posting
- Workflow: Draft → Reviewed → Audited → Posted

### Ledger Balances

- Opening balance initialized only for first period
- Subsequent periods inherit from previous period's ending balance
- Period debit/credit accumulate from posted journal journal lines
- Ending balance = Opening ± Period activity

### Reports

- Templates (`template=true`) have no period
- Instances are generated from templates for specific periods
- Amount types must match report class:
  - Balance Sheet: `year_opening_balance`, `period_ending_balance`
  - Income Statement: `year_to_date_amount`, `period_amount`, `last_year_amount`
- Formula rules: `net`, `debit`, `credit`, `transaction`

### Pagination & Filtering

- Most list endpoints support `$page`, `$size`, `$sort`, `$filter`
- Filter syntax: OData-style (e.g., `title eq 'something' and amount lt 10`)
- Default page size: 40

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

To add support for dimension management:

1. **Check spec:** All dimension endpoints use UUID IDs instead of string keys
2. **Service location:** `src/services/dimension/` (independent bounded context)
3. **Types:**
   ```typescript
   // Categories
   interface DimensionCategory {
     id: string
     name: string
     sobId: string
     createdAt: Date
     updatedAt: Date
   }
   interface DimensionOption {
     id: string
     name: string
     categoryId: string
     createdAt: Date
     updatedAt: Date
   }
   ```
4. **Component pattern:** Similar to accounts, but with update/delete support
5. **API usage:** Categories use route `:categoryId` (UUID), Options route `:categoryId/:optionId` (UUID)

## Development Gotchas & Lessons Learned

### ESLint Empty Interface Warning

**Gotcha:** `@typescript-eslint/no-empty-object-type` flags empty interfaces (e.g., extending Record types)
**Solution:** Add `// eslint-disable-next-line @typescript-eslint/no-empty-object-type` above the interface definition when intentional

```typescript
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AccountNumberConversionRecord extends Record<string, ...> {}
```

### Vue Store Readonly Arrays

**Gotcha:** Store returns `readonly number[]` (Vue reactivity) but functions expect `number[]`
**Solution:** Update function signatures to accept `readonly number[]` for covariance

```typescript
// ✗ Wrong - causes type error
export function rawToDisplay(raw: string, lengths: number[]): string

// ✓ Correct - accepts both mutable and readonly
export function rawToDisplay(raw: string, lengths: readonly number[]): string
```

### Deep Copying Before Mutation

**Gotcha:** Field conversion mutates data in-place; passing original request object modifies component data
**Solution:** Always deep copy before calling `convertAccountNumberFields()` on request bodies

```typescript
const requestCopy = JSON.parse(JSON.stringify(request))  // Deep copy
convertAccountNumberFields(requestCopy, CONFIG, codeLengths)
await axios.post(endpoint, requestCopy)
```

### Field Conversion Order

**Gotcha:** Calling conversions in wrong order loses data or causes type errors
**Solution:** Always apply in this order:
1. `convertFieldsFromString()` - type coercion (string→number/date)
2. `convertAccountNumberFields()` - field mapping (rename + value conversion)

```typescript
convertFieldsFromString(result.data, FIELDS_CONVERSION)
convertAccountNumberFields(result.data, ACCOUNT_NUMBER_CONVERSION, codeLengths)
```

## Notes

- **No test framework configured** - tests not part of current setup
- **Primary language:** Simplified Chinese (zh-CN)
- **Backend repo:** This is a UI-only repository; backend is separate
- **API contract:** Always reference `swagger/swagger.yaml` as source of truth for API schemas
