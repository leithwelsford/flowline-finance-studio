# Story 2.1: Implement Debt Account Management

Status: review

## Story

As a **user**,
I want **to add and manage my debt accounts**,
so that **the system knows about all debts I want to pay off**.

## Acceptance Criteria

1. **Given** I navigate to the Data Entry page **When** I click "Add Debt Account" **Then** I see a form with fields:
   - Account name (required, text)
   - Account type (required, dropdown: Home Loan, Vehicle Finance, Personal Loan, Credit Card)
   - Current balance (required, ZAR currency input, minimum R0)
   - Annual interest rate (required, percentage input 0-100%)
   - Minimum monthly payment (required, ZAR currency input)
   - Lender name (optional, text)

2. **Given** I fill out the form with valid data **When** I click "Save Account" **Then** the account is saved to Dexie database with `createdAt` and `updatedAt` timestamps

3. **Given** a successful save **When** the operation completes **Then** I see a success toast "Account saved"

4. **Given** I have existing accounts **When** I view the accounts list **Then** I see a card for each account showing: name, type icon, current balance (ZAR formatted), interest rate, minimum payment

5. **Given** I click "Edit" on an account **When** the edit form opens **Then** the form is populated with existing data

6. **Given** I modify fields in edit mode and click "Save" **When** the save completes **Then** the account is updated in database and I see success toast "Account updated"

7. **Given** I click "Delete" on an account **When** I see the confirmation dialog and confirm **Then** the account is removed from database

8. **Given** a successful delete **When** the operation completes **Then** I see success toast "Account deleted"

## Tasks / Subtasks

- [x] Task 1: Install required shadcn/ui components (AC: 1, 7)
  - [x] Install Select component: `npx shadcn@latest add select`
  - [x] Install AlertDialog component: `npx shadcn@latest add alert-dialog`
  - [x] Install Badge component: `npx shadcn@latest add badge`
  - [x] Verify components exist in `src/components/ui/`

- [x] Task 2: Create Zod validation schema (AC: 1, 2)
  - [x] Create `src/lib/validation/account.ts`
  - [x] Define accountSchema with all fields:
    - name: required string, min 1 char
    - type: required enum ('home_loan', 'vehicle_finance', 'personal_loan', 'credit_card')
    - balance: required string, numeric >= 0
    - interestRate: required string, numeric 0-1 (store as decimal)
    - minimumPayment: required string, numeric >= 0
    - lender: optional string
  - [x] Export schema and inferred type
  - [x] Create `src/lib/validation/index.ts` barrel export
  - [x] Write tests for validation schema

- [x] Task 3: Create useAccounts hook (AC: 2, 4, 6, 7)
  - [x] Create `src/hooks/useAccounts.ts`
  - [x] Implement `useLiveQuery` for reactive account list from Dexie
  - [x] Implement `addAccount(data)` function returning `Result<number>`
  - [x] Implement `updateAccount(id, data)` function returning `Result<void>`
  - [x] Implement `deleteAccount(id)` function returning `Result<void>`
  - [x] Calculate `totalDebt` using big.js (sum of all balances)
  - [x] Calculate `totalMinPayments` using big.js (sum of all minimumPayments)
  - [x] Add isLoading state
  - [x] Create `src/hooks/index.ts` barrel export
  - [x] Write tests for useAccounts hook

- [x] Task 4: Create currency formatting utility (AC: 4)
  - [x] Create `src/lib/format/currency.ts`
  - [x] Implement `formatCurrency(amount: string): string` using Intl.NumberFormat for ZAR
  - [x] Implement `parseCurrencyInput(value: string): string` for form input handling
  - [x] Create `src/lib/format/index.ts` barrel export
  - [x] Write tests for currency formatting

- [x] Task 5: Create AccountForm component (AC: 1, 2, 3, 5, 6)
  - [x] Create `src/components/accounts/AccountForm.tsx`
  - [x] Use React Hook Form with Zod resolver
  - [x] Implement controlled form with all fields from AC1
  - [x] Add shadcn/ui Select for account type dropdown
  - [x] Add percentage input handling for interest rate (display %, store decimal)
  - [x] Support both create and edit modes via optional `account` prop
  - [x] Call `toast.success()` on successful save/update
  - [x] Add proper form validation error display
  - [x] Write component tests

- [x] Task 6: Create AccountCard component (AC: 4)
  - [x] Create `src/components/accounts/AccountCard.tsx`
  - [x] Display account name, type with icon, balance (ZAR), rate (%), minimum payment
  - [x] Add lucide-react icons for account types (Home, Car, CreditCard, Wallet)
  - [x] Include Edit and Delete action buttons
  - [x] Use shadcn/ui Card, Badge components
  - [x] Write component tests

- [x] Task 7: Create AccountList component (AC: 4, 5, 7, 8)
  - [x] Create `src/components/accounts/AccountList.tsx`
  - [x] Display list of AccountCard components
  - [x] Implement "Add Debt Account" button that opens AccountForm
  - [x] Implement edit mode: clicking Edit opens AccountForm with account data
  - [x] Implement delete: clicking Delete opens AlertDialog confirmation
  - [x] Handle empty state: show message when no accounts
  - [x] Use useAccounts hook for data
  - [x] Write component tests

- [x] Task 8: Create DeleteConfirmDialog component (AC: 7, 8)
  - [x] Create `src/components/accounts/DeleteConfirmDialog.tsx`
  - [x] Use shadcn/ui AlertDialog
  - [x] Display account name in confirmation message
  - [x] Confirm triggers deleteAccount and shows toast
  - [x] Cancel closes dialog
  - [x] Write component tests

- [x] Task 9: Integrate into DataEntryPage (AC: All)
  - [x] Update `src/pages/DataEntryPage.tsx` to include AccountList
  - [x] Add section header "Debt Accounts"
  - [x] Style with appropriate spacing and layout
  - [x] Test full CRUD flow manually

- [x] Task 10: Create barrel export and run all tests (AC: All)
  - [x] Create `src/components/accounts/index.ts` barrel export
  - [x] Run `npm run test` and ensure all tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify all 8 acceptance criteria are implemented

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/     # FR1-8: Account & Data Management
│   ├── AccountList.tsx
│   ├── AccountForm.tsx
│   ├── AccountCard.tsx
│   └── index.ts
├── hooks/
│   └── useAccounts.ts       # Dexie queries for accounts
├── lib/
│   ├── validation/
│   │   └── account.ts       # Zod schema
│   └── format/
│       └── currency.ts      # ZAR formatting
```

**ADR-002 (Dexie.js):** All data persisted to IndexedDB via Dexie with `useLiveQuery`
**ADR-003 (big.js):** Monetary calculations use big.js for precision
**ADR-006 (React Hook Form + Zod):** Forms use RHF with Zod validation

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md):

**Data Model (already exists in src/types/account.ts):**
```typescript
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
```

**Hook Interface:**
```typescript
interface UseAccountsReturn {
  accounts: DebtAccount[];
  isLoading: boolean;
  addAccount: (account: Omit<DebtAccount, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<number>>;
  updateAccount: (id: number, updates: Partial<DebtAccount>) => Promise<Result<void>>;
  deleteAccount: (id: number) => Promise<Result<void>>;
  totalDebt: string;          // big.js sum
  totalMinPayments: string;   // big.js sum
}
```

### Implementation Patterns

**Currency Formatting:**
```typescript
const formatCurrency = (amount: string): string => {
  const num = parseFloat(amount);
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(num);
};
// Result: "R 1 234.56"
```

**Interest Rate Handling:**
- User inputs as percentage (e.g., "11.5")
- Store as decimal (e.g., "0.115")
- Display as percentage with % symbol

**Dexie CRUD Pattern:**
```typescript
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';

const accounts = useLiveQuery(() => db.accounts.toArray()) ?? [];

const addAccount = async (data) => {
  const now = new Date().toISOString();
  const id = await db.accounts.add({
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ok(id);
};
```

### Project Structure Notes

**Files to Create:**
- `src/lib/validation/account.ts`
- `src/lib/validation/index.ts`
- `src/lib/format/currency.ts`
- `src/lib/format/index.ts`
- `src/hooks/useAccounts.ts`
- `src/hooks/index.ts`
- `src/components/accounts/AccountForm.tsx`
- `src/components/accounts/AccountCard.tsx`
- `src/components/accounts/AccountList.tsx`
- `src/components/accounts/DeleteConfirmDialog.tsx`
- `src/components/accounts/index.ts`
- `tests/lib/validation/account.test.ts`
- `tests/lib/format/currency.test.ts`
- `tests/hooks/useAccounts.test.ts`
- `tests/components/accounts/AccountForm.test.tsx`
- `tests/components/accounts/AccountCard.test.tsx`
- `tests/components/accounts/AccountList.test.tsx`

**Files to Modify:**
- `src/pages/DataEntryPage.tsx` - Add AccountList component

**shadcn/ui Components to Install:**
- Select (for account type dropdown)
- AlertDialog (for delete confirmation)
- Badge (for status indicators)

### Learnings from Previous Story

**From Story 1-4 (Status: done)**

- **Zustand Store Ready:** UI store at `src/store/uiStore.ts` with `currentPage`, `selectedStrategyId`, `isLoading`
- **Toast System Ready:** Use `import { toast } from 'sonner'` for notifications
  - `toast.success('message')` - green, auto-dismiss 3s
  - `toast.error('message')` - red, manual dismiss
- **Result Type Ready:** `src/lib/utils/result.ts` with `ok<T>()`, `err<E>()`, `isOk()`, `isErr()`
- **Path Aliases:** All imports use `@/` prefix
- **Barrel Exports:** Follow pattern from `src/store/index.ts`, `src/lib/utils/index.ts`
- **Test Count:** 100 tests passing - maintain test hygiene

**From Epic 1 - Existing Infrastructure:**
- Dexie database at `src/lib/db/index.ts` with `accounts` table defined
- Types at `src/types/account.ts` with `DebtAccount`, `AccountType`
- Application shell with navigation already working

[Source: docs/sprint-artifacts/1-4-implement-zustand-ui-store-and-toast-notifications.md#Completion-Notes-List]

### Testing Approach

**Unit Tests:**
- Zod schema validation (valid/invalid inputs)
- Currency formatting (edge cases, large numbers)
- useAccounts hook (CRUD operations with fake-indexeddb)

**Component Tests:**
- AccountForm: form rendering, validation display, submit handling
- AccountCard: data display, button clicks
- AccountList: empty state, populated list, CRUD interactions

**Integration Test Pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.accounts.clear();
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-006] - React Hook Form + Zod
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Story-2.1] - Detailed acceptance criteria
- [Source: docs/epics.md#Story-2.1] - Original story definition
- [Source: docs/prd.md#FR1] - Debt account management requirements
- [Source: docs/prd.md#FR7] - Local data persistence
- [Source: docs/prd.md#FR8] - Edit/delete operations

## Dev Agent Record

### Context Reference

- [2-1-implement-debt-account-management.context.xml](docs/sprint-artifacts/2-1-implement-debt-account-management.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Installed shadcn/ui components (Select, AlertDialog, Badge)
- Created Zod validation schema with form value conversion helpers
- Built useAccounts hook with Dexie useLiveQuery, CRUD operations, and big.js calculations
- Created ZAR currency formatting utilities
- Built AccountForm with React Hook Form + Zod, supporting create/edit modes
- Built AccountCard with lucide-react icons, formatted currency display
- Built AccountList with add/edit/delete flows and empty state
- Built DeleteConfirmDialog with AlertDialog and toast notifications
- Integrated into DataEntryPage
- All 206 tests passing, build succeeds

### Completion Notes List

- Story 2.1 implements full CRUD for debt accounts
- All 8 acceptance criteria met
- Test count increased from 100 to 206 (106 new tests)
- Added @testing-library/user-event as dev dependency
- ZAR currency formatting uses Intl.NumberFormat('en-ZA')
- Interest rate stored as decimal (0.115), displayed as percentage (11.5%)
- All monetary calculations use big.js for precision
- useLiveQuery provides reactive data from Dexie

### File List

**Created:**
- src/lib/validation/account.ts
- src/lib/validation/index.ts
- src/lib/format/currency.ts
- src/lib/format/index.ts
- src/hooks/useAccounts.ts
- src/hooks/index.ts
- src/components/accounts/AccountForm.tsx
- src/components/accounts/AccountCard.tsx
- src/components/accounts/AccountList.tsx
- src/components/accounts/DeleteConfirmDialog.tsx
- src/components/accounts/index.ts
- src/components/ui/select.tsx
- src/components/ui/alert-dialog.tsx
- src/components/ui/badge.tsx
- tests/lib/validation/account.test.ts
- tests/lib/format/currency.test.ts
- tests/hooks/useAccounts.test.ts
- tests/components/accounts/AccountForm.test.tsx
- tests/components/accounts/AccountCard.test.tsx
- tests/components/accounts/AccountList.test.tsx
- tests/components/accounts/DeleteConfirmDialog.test.tsx

**Modified:**
- src/pages/DataEntryPage.tsx
- package.json (added @testing-library/user-event)
- package-lock.json

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-30 | Story drafted from tech-spec-epic-2.md with full context | SM Agent (Bob) |
| 2025-12-01 | Story implementation complete - all ACs met, 206 tests passing | Dev Agent (Amelia) |
