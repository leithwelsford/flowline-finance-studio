# Epic Technical Specification: Account & Data Management

Date: 2025-11-30
Author: Leith
Epic ID: 2
Status: Draft

---

## Overview

Epic 2 delivers the complete data entry and management functionality for Flowline Finance Studio, enabling users to input their full financial picture: debt accounts, flexi facility, income sources, and expenses. This is the data foundation upon which all strategy calculations and comparisons will be built.

The epic implements **FR1-FR8** from the PRD, covering Account & Data Management requirements. It builds directly on Epic 1's foundation (Dexie database schema, TypeScript types, Zustand UI store, and application shell) to deliver user-facing CRUD operations with local persistence.

**Core Value Proposition:** After this epic, users can enter their complete South African financial situation - including SA-specific flexi facilities (FNB Flexi Option, Standard Bank Access Bond) - and see it persisted across sessions, ready for strategy calculations.

## Objectives and Scope

### In-Scope

- **FR1:** Debt account CRUD (home loan, vehicle finance, personal loan, credit card)
- **FR2:** Flexi facility management (single facility limit, FNB/Standard Bank types)
- **FR3:** Monthly income entry with source and payment date
- **FR4:** Expense tracking by predefined categories
- **FR5:** Manual balance updates (weekly/monthly)
- **FR6:** Financial snapshot view with totals and surplus calculation
- **FR7:** Data persistence via Dexie/IndexedDB (established in Epic 1)
- **FR8:** Edit/delete operations for all financial data

### Out-of-Scope

- Strategy calculations (Epic 4)
- Financial health dashboard visualizations (Epic 3)
- Progress tracking and validation (Epic 6)
- Balance snapshots for historical tracking (Epic 6)
- Bank API integration (Post-MVP)
- Multi-user support (Post-MVP)

## System Architecture Alignment

Epic 2 follows the architecture established in [architecture.md](../architecture.md):

**Component Hierarchy:**
```
src/
├── components/accounts/          # NEW: All account management UI
│   ├── AccountForm.tsx           # Story 2.1: Debt account form
│   ├── AccountList.tsx           # Story 2.1: Account list display
│   ├── AccountCard.tsx           # Story 2.1: Individual account card
│   ├── FlexiFacilityForm.tsx     # Story 2.2: Flexi facility form
│   ├── FlexiFacilityCard.tsx     # Story 2.2: Flexi facility display
│   ├── IncomeForm.tsx            # Story 2.3: Income entry form
│   ├── IncomeList.tsx            # Story 2.3: Income list
│   ├── ExpenseForm.tsx           # Story 2.4: Expense entry form
│   ├── ExpenseList.tsx           # Story 2.4: Expense list
│   ├── FinancialSnapshot.tsx     # Story 2.5: Summary panel
│   ├── QuickBalanceUpdate.tsx    # Story 2.6: Inline balance editing
│   └── index.ts                  # Barrel exports
├── hooks/                        # NEW: Data access hooks
│   ├── useAccounts.ts            # Story 2.1: Account queries
│   ├── useFlexiFacility.ts       # Story 2.2: Flexi facility queries
│   ├── useIncome.ts              # Story 2.3: Income queries
│   ├── useExpenses.ts            # Story 2.4: Expense queries
│   └── useFinancialSnapshot.ts   # Story 2.5: Aggregated calculations
├── lib/validation/               # NEW: Zod schemas
│   ├── account.ts                # Account form validation
│   ├── flexi-facility.ts         # Flexi facility validation
│   ├── income.ts                 # Income validation
│   ├── expense.ts                # Expense validation
│   └── index.ts                  # Barrel exports
└── lib/format/                   # NEW: Formatting utilities
    ├── currency.ts               # ZAR formatting
    ├── date.ts                   # SA date formatting
    └── index.ts                  # Barrel exports
```

**Architectural Decisions Applied:**
- **ADR-002 (Dexie.js):** All data persisted to IndexedDB via Dexie
- **ADR-003 (big.js):** All monetary calculations use big.js for precision
- **ADR-005 (Zustand):** UI state managed via existing uiStore
- **ADR-006 (React Hook Form + Zod):** All forms use RHF with Zod validation

## Detailed Design

### Services and Modules

| Module | Responsibility | Input | Output |
|--------|---------------|-------|--------|
| `AccountForm` | Create/edit debt accounts | User form data | Validated account to Dexie |
| `AccountList` | Display accounts with CRUD | Dexie query results | Rendered account cards |
| `FlexiFacilityForm` | Create/edit flexi facility | User form data | Validated facility to Dexie |
| `IncomeForm` | Create/edit income sources | User form data | Validated income to Dexie |
| `ExpenseForm` | Create/edit expenses | User form data | Validated expense to Dexie |
| `FinancialSnapshot` | Aggregate and display totals | All financial data | Calculated summary |
| `QuickBalanceUpdate` | Inline balance editing | Account list | Updated balances |
| `useAccounts` | Query/mutate accounts | None | Reactive account array |
| `useFlexiFacility` | Query/mutate flexi | None | Reactive facility or null |
| `useIncome` | Query/mutate income | None | Reactive income array + total |
| `useExpenses` | Query/mutate expenses | None | Reactive expense array + total |
| `useFinancialSnapshot` | Aggregate calculations | All hooks | Snapshot summary object |

### Data Models and Contracts

**Existing Types (from Epic 1 - src/types/):**

```typescript
// DebtAccount - already defined in src/types/account.ts
interface DebtAccount {
  id?: number;
  name: string;
  type: AccountType;        // 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card'
  balance: string;          // big.js compatible
  interestRate: string;     // decimal (0.115 = 11.5%)
  minimumPayment: string;   // big.js compatible
  lender: string;
  interestType: InterestType; // 'monthly' | 'daily'
  createdAt: string;
  updatedAt: string;
}

// FlexiFacility - already defined in src/types/flexi-facility.ts
interface FlexiFacility {
  id?: number;
  name: string;
  type: FlexiFacilityType;  // 'fnb_flexi' | 'standard_bank_access'
  creditLimit: string;
  currentBalance: string;
  interestRate: string;
  createdAt: string;
  updatedAt: string;
}

// IncomeEntry - already defined in src/types/income.ts
interface IncomeEntry {
  id?: number;
  source: string;
  amount: string;
  paymentDate?: number;     // Day of month (1-31)
  createdAt: string;
}

// ExpenseEntry - already defined in src/types/expense.ts
interface ExpenseEntry {
  id?: number;
  category: ExpenseCategory;
  amount: string;
  description?: string;
  createdAt: string;
}
```

**New Type: Financial Snapshot (add to src/types/)**

```typescript
// src/types/financial-snapshot.ts
interface FinancialSnapshot {
  totalDebt: string;            // Sum of all account balances
  totalMonthlyIncome: string;   // Sum of all income
  totalMonthlyExpenses: string; // Sum of all expenses
  minimumDebtPayments: string;  // Sum of all minimum payments
  availableSurplus: string;     // Income - Expenses - MinPayments
  accountCount: number;
  hasFlexi: boolean;
}
```

**Expense Categories (add to src/types/expense.ts)**

```typescript
export type ExpenseCategory =
  | 'housing'
  | 'transport'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'entertainment'
  | 'other';

export const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'housing', label: 'Housing' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];
```

### APIs and Interfaces

**No external APIs.** All operations are local via Dexie.

**Internal Hook Interfaces:**

```typescript
// src/hooks/useAccounts.ts
interface UseAccountsReturn {
  accounts: DebtAccount[];
  isLoading: boolean;
  addAccount: (account: Omit<DebtAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<number>>;
  updateAccount: (id: number, updates: Partial<DebtAccount>) => Promise<Result<void>>;
  deleteAccount: (id: number) => Promise<Result<void>>;
  totalDebt: string;          // big.js sum
  totalMinPayments: string;   // big.js sum
}

// src/hooks/useFlexiFacility.ts
interface UseFlexiFacilityReturn {
  facility: FlexiFacility | null;
  isLoading: boolean;
  saveFacility: (facility: Omit<FlexiFacility, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<number>>;
  updateFacility: (updates: Partial<FlexiFacility>) => Promise<Result<void>>;
  deleteFacility: () => Promise<Result<void>>;
  availableCredit: string;    // creditLimit - currentBalance
}

// src/hooks/useIncome.ts
interface UseIncomeReturn {
  incomeEntries: IncomeEntry[];
  isLoading: boolean;
  addIncome: (income: Omit<IncomeEntry, 'id' | 'createdAt'>) => Promise<Result<number>>;
  updateIncome: (id: number, updates: Partial<IncomeEntry>) => Promise<Result<void>>;
  deleteIncome: (id: number) => Promise<Result<void>>;
  totalMonthlyIncome: string; // big.js sum
}

// src/hooks/useExpenses.ts
interface UseExpensesReturn {
  expenses: ExpenseEntry[];
  isLoading: boolean;
  addExpense: (expense: Omit<ExpenseEntry, 'id' | 'createdAt'>) => Promise<Result<number>>;
  updateExpense: (id: number, updates: Partial<ExpenseEntry>) => Promise<Result<void>>;
  deleteExpense: (id: number) => Promise<Result<void>>;
  totalMonthlyExpenses: string;       // big.js sum
  expensesByCategory: Map<ExpenseCategory, string>; // grouped totals
}

// src/hooks/useFinancialSnapshot.ts
interface UseFinancialSnapshotReturn {
  snapshot: FinancialSnapshot;
  isLoading: boolean;
  isHealthy: boolean;         // availableSurplus > 0
}
```

### Workflows and Sequencing

**Story 2.1: Debt Account Management Flow**
```
User clicks "Add Debt Account"
  → AccountForm renders (empty state)
  → User fills form fields
  → Zod validation on change/blur
  → User clicks "Save Account"
  → useAccounts.addAccount() called
  → Dexie db.accounts.add() executes
  → Toast shows "Account saved"
  → AccountList re-renders via useLiveQuery
```

**Story 2.6: Quick Balance Update Flow**
```
User clicks "Update Balances"
  → QuickBalanceUpdate renders account list
  → Each row shows account name + inline balance input
  → User edits balance value
  → On blur/Enter: debounced save triggers
  → useAccounts.updateAccount() called
  → "Saved" indicator appears briefly
  → updatedAt timestamp refreshed
```

## Non-Functional Requirements

### Performance

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| NFR-P2: Form input response | < 100ms | React Hook Form uncontrolled inputs |
| NFR-P2: Auto-save | Background, non-blocking | Debounced Dexie writes |
| Account list render | < 500ms for 10 accounts | useLiveQuery with indexed queries |
| Total calculations | < 100ms | big.js operations, memoized in hooks |

**Source:** PRD NFR-P2 (Data Entry Responsiveness)

### Security

| Requirement | Implementation |
|-------------|----------------|
| NFR-S1: Data stored locally | Dexie/IndexedDB, no server transmission |
| NFR-S3: Input validation | Zod schemas validate all fields |
| NFR-S3: Numeric validation | Zod validates balance >= 0, rate 0-1 |

**Source:** PRD NFR-S1, NFR-S3

### Reliability

| Requirement | Implementation |
|-------------|----------------|
| NFR-R2: Auto-save | Debounced saves prevent data loss |
| NFR-R2: Validation before save | Zod validation prevents corrupt data |
| NFR-R3: Consistent behavior | Same inputs → same calculations |

**Source:** PRD NFR-R2, NFR-R3

### Observability

| Requirement | Implementation |
|-------------|----------------|
| Error logging | Console logger with [ERROR] prefix |
| Operation tracking | Console logger with [INFO] prefix for CRUD operations |
| Calculation logging | Console logger with [CALC] prefix for totals |

**Implementation:** Use existing `src/lib/utils/logger.ts` pattern (to be created if not exists).

## Dependencies and Integrations

### Package Dependencies (from package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| `dexie` | ^4.2.1 | IndexedDB database operations |
| `dexie-react-hooks` | ^4.2.0 | useLiveQuery for reactive queries |
| `react-hook-form` | ^7.66.1 | Form state management |
| `@hookform/resolvers` | ^5.2.2 | Zod resolver for RHF |
| `zod` | ^4.1.13 | Schema validation |
| `big.js` | ^7.0.1 | Precision decimal arithmetic |
| `lucide-react` | ^0.555.0 | Icons for account types |
| `sonner` | ^2.0.7 | Toast notifications |

### Internal Dependencies

| Dependency | Source | Used By |
|------------|--------|---------|
| `db` instance | `src/lib/db/index.ts` | All hooks |
| Type definitions | `src/types/` | All components, hooks |
| Result type | `src/lib/utils/result.ts` | All hooks |
| Toast utility | `src/lib/utils/toast.ts` | All components |
| UI components | `src/components/ui/` | All form/display components |
| Zustand store | `src/store/uiStore.ts` | Page navigation state |

### shadcn/ui Components Required

| Component | Status | Used In |
|-----------|--------|---------|
| Card | ✅ Installed | AccountCard, all list displays |
| Form | ✅ Installed | All forms |
| Input | ✅ Installed | All forms |
| Button | ✅ Installed | All forms, actions |
| Label | ✅ Installed | All forms |
| Toast | ✅ Installed | Feedback notifications |
| Table | ✅ Installed | QuickBalanceUpdate, lists |
| Tabs | ✅ Installed | Data entry page sections |
| Select | ⚠️ Need to add | Account type, expense category dropdowns |
| AlertDialog | ⚠️ Need to add | Delete confirmation dialogs |
| Badge | ⚠️ Need to add | Status indicators |

**Action:** Install missing shadcn/ui components before Story 2.1:
```bash
npx shadcn@latest add select alert-dialog badge
```

## Acceptance Criteria (Authoritative)

### Story 2.1: Debt Account Management

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.1.1 | Add Debt Account form displays with all required fields | ✓ |
| 2.1.2 | Form validates: name required, type required, balance >= 0, rate 0-100%, minPayment >= 0 | ✓ |
| 2.1.3 | Save creates account in Dexie with createdAt/updatedAt timestamps | ✓ |
| 2.1.4 | Success toast "Account saved" appears after save | ✓ |
| 2.1.5 | Account list displays card with name, type icon, balance (ZAR), rate, minimum payment | ✓ |
| 2.1.6 | Edit populates form with existing data, Save updates record | ✓ |
| 2.1.7 | Delete shows confirmation dialog, confirmed delete removes from database | ✓ |
| 2.1.8 | Success toasts appear for update and delete operations | ✓ |

### Story 2.2: Flexi Facility Management

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.2.1 | Add Flexi Facility form displays with all required fields | ✓ |
| 2.2.2 | Form validates: name required, type required, creditLimit >= 0, rate 0-100% | ✓ |
| 2.2.3 | Only ONE flexi facility allowed; form disabled if one exists | ✓ |
| 2.2.4 | Facility card displays: name, type, credit limit, current balance, available credit (calculated), rate | ✓ |
| 2.2.5 | Edit/delete operations work correctly with appropriate toasts | ✓ |

### Story 2.3: Income Entry

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.3.1 | Add Income form displays with source (required), amount (required), payment date (optional) | ✓ |
| 2.3.2 | Multiple income sources can be added | ✓ |
| 2.3.3 | Income list displays all sources with amounts | ✓ |
| 2.3.4 | Total monthly income calculated and displayed | ✓ |
| 2.3.5 | Edit/delete operations work correctly | ✓ |

### Story 2.4: Expense Tracking

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.4.1 | Add Expense form displays with category dropdown, amount (required), description (optional) | ✓ |
| 2.4.2 | Predefined categories: Housing, Transport, Food, Utilities, Insurance, Entertainment, Other | ✓ |
| 2.4.3 | Multiple expenses can be added | ✓ |
| 2.4.4 | Expenses grouped by category in list view | ✓ |
| 2.4.5 | Total monthly expenses calculated and displayed | ✓ |
| 2.4.6 | Edit/delete operations work correctly | ✓ |

### Story 2.5: Financial Snapshot

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.5.1 | Snapshot panel displays: Total Debt, Total Monthly Income, Total Monthly Expenses, Minimum Debt Payments, Available Surplus, Account Count | ✓ |
| 2.5.2 | Negative surplus shows in red with warning icon | ✓ |
| 2.5.3 | Positive surplus shows in green | ✓ |
| 2.5.4 | All totals update reactively when data changes (via useLiveQuery) | ✓ |

### Story 2.6: Quick Balance Update

| AC ID | Acceptance Criterion | Testable |
|-------|---------------------|----------|
| 2.6.1 | Update Balances view shows all accounts with inline editable balance fields | ✓ |
| 2.6.2 | Current balance pre-filled in each field | ✓ |
| 2.6.3 | Auto-save on blur or Enter key press | ✓ |
| 2.6.4 | "Saved" indicator appears briefly after successful save | ✓ |
| 2.6.5 | Last updated timestamp displays for each account | ✓ |
| 2.6.6 | Total debt reflects updated balances immediately | ✓ |

## Traceability Mapping

| AC ID | Spec Section | Component(s) | Hook(s) | Test Idea |
|-------|--------------|--------------|---------|-----------|
| 2.1.1-2.1.8 | Story 2.1 | AccountForm, AccountList, AccountCard | useAccounts | Unit: Zod validation; Integration: CRUD operations; E2E: Full flow |
| 2.2.1-2.2.5 | Story 2.2 | FlexiFacilityForm, FlexiFacilityCard | useFlexiFacility | Unit: Single facility constraint; Integration: CRUD |
| 2.3.1-2.3.5 | Story 2.3 | IncomeForm, IncomeList | useIncome | Unit: Total calculation; Integration: CRUD |
| 2.4.1-2.4.6 | Story 2.4 | ExpenseForm, ExpenseList | useExpenses | Unit: Category grouping; Integration: CRUD |
| 2.5.1-2.5.4 | Story 2.5 | FinancialSnapshot | useFinancialSnapshot | Unit: Surplus calculation; Integration: Reactive updates |
| 2.6.1-2.6.6 | Story 2.6 | QuickBalanceUpdate | useAccounts | Integration: Inline editing; E2E: 10-minute update flow |

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1:** big.js string parsing errors from user input | Medium | Zod validation ensures valid numeric strings before storage |
| **R2:** Dexie transaction failures on concurrent writes | Low | Use db.transaction() for multi-record operations |
| **R3:** Form performance with many fields | Low | React Hook Form uses uncontrolled inputs |

### Assumptions

| Assumption | Rationale |
|------------|-----------|
| **A1:** Single user only (no concurrent access) | MVP personal validation scope |
| **A2:** Browser IndexedDB storage sufficient | Modern browsers support 50MB+ |
| **A3:** User comfortable with manual data entry | PRD explicitly defers bank API integration |

### Open Questions

| Question | Owner | Status |
|----------|-------|--------|
| **Q1:** Should interest rate input be percentage (11.5) or decimal (0.115)? | Dev | **Resolved:** Store as decimal, input as percentage with conversion |
| **Q2:** Should flexi facility balance allow negative (available credit)? | Dev | **Resolved:** Yes, per Story 2.2 AC - can be negative |

## Test Strategy Summary

### Test Levels

| Level | Framework | Coverage |
|-------|-----------|----------|
| Unit Tests | Vitest | Zod schemas, hook calculations, utility functions |
| Integration Tests | Vitest + fake-indexeddb | Dexie CRUD operations, reactive queries |
| Component Tests | Vitest + React Testing Library | Form rendering, validation feedback, list displays |

### Test Coverage by Story

| Story | Unit Tests | Integration Tests | Component Tests |
|-------|------------|-------------------|-----------------|
| 2.1 | Account Zod schema, useAccounts calculations | Account CRUD operations | AccountForm, AccountList render |
| 2.2 | FlexiFacility Zod schema, single-facility constraint | Facility CRUD operations | FlexiFacilityForm render |
| 2.3 | Income Zod schema, total calculation | Income CRUD operations | IncomeForm, IncomeList render |
| 2.4 | Expense Zod schema, category grouping | Expense CRUD operations | ExpenseForm, ExpenseList render |
| 2.5 | Surplus calculation, big.js operations | Reactive snapshot updates | FinancialSnapshot render, color states |
| 2.6 | Debounce logic | Inline edit saves | QuickBalanceUpdate inline editing |

### Critical Paths

1. **Account Creation Flow:** Form → Validation → Dexie save → Toast → List update
2. **Surplus Calculation:** Income total - Expense total - MinPayments = Surplus (with big.js)
3. **Quick Update Flow:** Inline edit → Debounce → Save → Indicator → Total update

### Test Data

```typescript
// Test fixtures for account management
const testAccount: DebtAccount = {
  name: 'Home Loan',
  type: 'home_loan',
  balance: '1500000.00',
  interestRate: '0.115',
  minimumPayment: '15000.00',
  lender: 'FNB',
  interestType: 'monthly',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const testFlexi: FlexiFacility = {
  name: 'FNB Flexi',
  type: 'fnb_flexi',
  creditLimit: '200000.00',
  currentBalance: '50000.00',
  interestRate: '0.1175',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
```

---

_Generated by BMAD SMod Workflow v1.0_
_Date: 2025-11-30_
_For: Leith_
