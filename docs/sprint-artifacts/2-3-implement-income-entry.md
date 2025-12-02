# Story 2.3: Implement Income Entry

Status: ready-for-review

## Story

As a **user**,
I want **to record my monthly income sources**,
so that **the system knows how much surplus I have for debt payments**.

## Acceptance Criteria

1. **Given** I navigate to the Data Entry page **When** I click "Add Income Source" **Then** I see a form with fields:
   - Income source (required, text, e.g., "Salary", "Side Business")
   - Monthly amount (required, ZAR currency input, minimum R0)
   - Payment date (optional, day of month 1-31)

2. **Given** I fill out the form with valid data **When** I click "Save Income" **Then** the income entry is saved to Dexie database with `createdAt` timestamp

3. **Given** a successful save **When** the operation completes **Then** I see a success toast "Income source saved"

4. **Given** I add multiple income sources **When** I view the income section **Then** I see a list of all income sources with amounts (ZAR formatted)

5. **Given** I have multiple income entries **When** I view the income section **Then** I see total monthly income displayed at the bottom of the list

6. **Given** I click "Edit" on an income entry **When** the edit form opens **Then** the form is populated with existing data

7. **Given** I modify fields in edit mode and click "Save" **When** the save completes **Then** the income entry is updated in database and I see success toast "Income source updated"

8. **Given** I click "Delete" on an income entry **When** I see the confirmation dialog and confirm **Then** the entry is removed from database and I see success toast "Income source deleted"

9. **Given** I add, edit, or delete income entries **When** I view total income **Then** the total recalculates automatically (reactive via useLiveQuery)

## Tasks / Subtasks

- [x] Task 1: Create Zod validation schema (AC: 1, 2)
  - [x] Create `src/lib/validation/income.ts`
  - [x] Define incomeSchema with all fields:
    - source: required string, min 1 char
    - amount: required string, numeric >= 0
    - paymentDate: optional number, 1-31 range if provided
  - [x] Create conversion helpers: `formValuesToIncome()`, `incomeToFormValues()`
  - [x] Export schema and inferred type
  - [x] Update `src/lib/validation/index.ts` barrel export
  - [x] Write tests for validation schema

- [x] Task 2: Create useIncome hook (AC: 2, 4, 5, 7, 8, 9)
  - [x] Create `src/hooks/useIncome.ts`
  - [x] Implement `useLiveQuery` for reactive income entries from Dexie
  - [x] Implement `addIncome(data)` function returning `Result<number>`
  - [x] Implement `updateIncome(id, updates)` function returning `Result<void>`
  - [x] Implement `deleteIncome(id)` function returning `Result<void>`
  - [x] Calculate `totalMonthlyIncome` using big.js: sum of all income amounts
  - [x] Add isLoading state
  - [x] Update `src/hooks/index.ts` barrel export
  - [x] Write tests for useIncome hook

- [x] Task 3: Create IncomeForm component (AC: 1, 2, 3, 6, 7)
  - [x] Create `src/components/accounts/IncomeForm.tsx`
  - [x] Use React Hook Form with Zod resolver
  - [x] Implement controlled form with all fields from AC1:
    - Source text input
    - Amount currency input (use formatCurrency pattern from Story 2.1)
    - Payment date optional number input (1-31)
  - [x] Support both create and edit modes via optional `income` prop
  - [x] Call `toast.success()` on successful save/update
  - [x] Add proper form validation error display
  - [x] Write component tests

- [x] Task 4: Create IncomeCard component (AC: 4)
  - [x] Create `src/components/accounts/IncomeCard.tsx`
  - [x] Display income source name, amount (ZAR formatted)
  - [x] Show payment date if provided (e.g., "25th of month")
  - [x] Include Edit and Delete action buttons
  - [x] Use shadcn/ui Card components
  - [x] Write component tests

- [x] Task 5: Create IncomeList component (AC: 4, 5)
  - [x] Create `src/components/accounts/IncomeList.tsx`
  - [x] Display all income entries as IncomeCard components
  - [x] Display total monthly income at bottom with big.js sum
  - [x] Format total as ZAR currency
  - [x] Handle empty state with message "No income sources added yet"
  - [x] Write component tests

- [x] Task 6: Create IncomeSection component (AC: 1, 4, 5, 6, 7, 8)
  - [x] Create `src/components/accounts/IncomeSection.tsx`
  - [x] Show "Add Income Source" button
  - [x] Render IncomeList with all entries
  - [x] Implement add mode: clicking button opens IncomeForm (empty)
  - [x] Implement edit mode: clicking Edit opens IncomeForm with income data
  - [x] Implement delete: clicking Delete opens AlertDialog confirmation
  - [x] Handle empty state messaging
  - [x] Use useIncome hook for data
  - [x] Write component tests

- [x] Task 7: Integrate into DataEntryPage (AC: All)
  - [x] Update `src/pages/DataEntryPage.tsx` to include IncomeSection
  - [x] Add section header "Income Sources" below Flexi Facility section
  - [x] Add informational text explaining income tracking purpose
  - [x] Style with appropriate spacing and layout

- [x] Task 8: Run all tests and verify (AC: All)
  - [x] Create barrel export updates in `src/components/accounts/index.ts`
  - [x] Run `npm run test` and ensure all tests pass (423 tests passing)
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify all 9 acceptance criteria are implemented

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/
│   ├── IncomeForm.tsx            # NEW: Income entry form
│   ├── IncomeCard.tsx            # NEW: Income display card
│   ├── IncomeList.tsx            # NEW: Income list with total
│   ├── IncomeSection.tsx         # NEW: Container with add/edit logic
│   └── index.ts                  # Update barrel exports
├── hooks/
│   └── useIncome.ts              # NEW: Income queries
├── lib/validation/
│   └── income.ts                 # NEW: Zod schema
```

**ADR-002 (Dexie.js):** All data persisted to IndexedDB via Dexie with `useLiveQuery`
**ADR-003 (big.js):** Monetary calculations use big.js for precision
**ADR-006 (React Hook Form + Zod):** Forms use RHF with Zod validation

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md):

**Data Model (already exists in src/types/income.ts):**
```typescript
interface IncomeEntry {
  id?: number;
  source: string;
  amount: string;           // big.js compatible
  paymentDate?: number;     // Day of month (1-31)
  createdAt: string;
}
```

**Hook Interface:**
```typescript
interface UseIncomeReturn {
  incomeEntries: IncomeEntry[];
  isLoading: boolean;
  addIncome: (income: Omit<IncomeEntry, 'id' | 'createdAt'>) => Promise<Result<number>>;
  updateIncome: (id: number, updates: Partial<IncomeEntry>) => Promise<Result<void>>;
  deleteIncome: (id: number) => Promise<Result<void>>;
  totalMonthlyIncome: string; // big.js sum
}
```

### Total Income Calculation

```typescript
import Big from 'big.js';

const totalMonthlyIncome = useMemo(() => {
  if (!incomeEntries || incomeEntries.length === 0) return '0';
  return incomeEntries
    .reduce((sum, entry) => sum.plus(new Big(entry.amount)), new Big(0))
    .toString();
}, [incomeEntries]);

// Example:
// Salary: R45,000
// Side Business: R5,000
// Rental Income: R8,000
// Total: R58,000
```

### Payment Date Display

```typescript
// Optional payment date display
const formatPaymentDate = (day?: number): string => {
  if (!day) return '';
  const suffix = day === 1 || day === 21 || day === 31 ? 'st'
    : day === 2 || day === 22 ? 'nd'
    : day === 3 || day === 23 ? 'rd'
    : 'th';
  return `${day}${suffix} of month`;
};

// Example: 25 → "25th of month"
```

### Project Structure Notes

**Files to Create:**
- `src/lib/validation/income.ts`
- `src/hooks/useIncome.ts`
- `src/components/accounts/IncomeForm.tsx`
- `src/components/accounts/IncomeCard.tsx`
- `src/components/accounts/IncomeList.tsx`
- `src/components/accounts/IncomeSection.tsx`
- `tests/lib/validation/income.test.ts`
- `tests/hooks/useIncome.test.ts`
- `tests/components/accounts/IncomeForm.test.tsx`
- `tests/components/accounts/IncomeCard.test.tsx`
- `tests/components/accounts/IncomeList.test.tsx`
- `tests/components/accounts/IncomeSection.test.tsx`

**Files to Modify:**
- `src/lib/validation/index.ts` - Add income export
- `src/hooks/index.ts` - Add useIncome export
- `src/components/accounts/index.ts` - Add new component exports
- `src/pages/DataEntryPage.tsx` - Add IncomeSection

### Learnings from Previous Story

**From Story 2.2 (Status: done)**

- **Validation Pattern Ready:** Use same Zod schema structure with `toFormValues()` and `toDbValues()` conversion helpers
- **Currency Formatting Ready:** Use `formatCurrency()` from `@/lib/format/currency` for ZAR display
- **Hook Pattern:** Follow useFlexiFacility structure - useLiveQuery, CRUD operations, Result types
- **Component Structure:** Form, Card, List, Section pattern established
- **Toast Pattern:** Use `toast.success('message')` for success, `toast.error('message')` for errors
- **Result Type Ready:** `src/lib/utils/result.ts` with `ok<T>()`, `err<E>()`, `isOk()`, `isErr()`
- **Test Count:** 317 tests passing - maintain test hygiene
- **Test Setup:** Use `fake-indexeddb/auto` for Dexie tests

**Reusable from Previous Stories:**
- `formatCurrency()` from `@/lib/format/currency`
- `parseCurrencyInput()` from `@/lib/format/currency`
- `DeleteConfirmDialog` pattern from Story 2.1/2.2
- Test setup patterns with `fake-indexeddb/auto`
- AlertDialog component for delete confirmations

[Source: docs/sprint-artifacts/2-2-implement-flexi-facility-management.md#Completion-Notes-List]

### Testing Approach

**Unit Tests:**
- Zod schema validation (valid/invalid inputs)
- Total income calculation with big.js
- Payment date validation (1-31 range)

**Component Tests:**
- IncomeForm: form rendering, validation display, submit handling
- IncomeCard: data display, optional payment date
- IncomeList: empty state, populated state, total calculation display
- IncomeSection: add flow, edit flow, delete flow

**Integration Test Pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.income.clear();
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-006] - React Hook Form + Zod
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Story-2.3] - Detailed acceptance criteria
- [Source: docs/epics.md#Story-2.3] - Original story definition
- [Source: docs/prd.md#FR3] - Income recording requirements

## Dev Agent Record

### Context Reference

- [2-3-implement-income-entry.context.xml](docs/sprint-artifacts/2-3-implement-income-entry.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- All 9 acceptance criteria implemented and tested
- 423 tests passing (106 new tests added for income functionality)
- TypeScript compilation clean
- Production build successful
- Follows established patterns from Story 2.1/2.2 for validation, hooks, and components
- Payment date validation changed from transform-based to simple optional number for cleaner TypeScript types
- Total monthly income reactive via useLiveQuery + useMemo with big.js precision

### File List

**Created:**
- `src/lib/validation/income.ts` - Zod schema and conversion helpers
- `src/hooks/useIncome.ts` - Dexie queries and CRUD operations
- `src/components/accounts/IncomeForm.tsx` - Create/edit form
- `src/components/accounts/IncomeCard.tsx` - Income display card
- `src/components/accounts/IncomeList.tsx` - List with total display
- `src/components/accounts/IncomeSection.tsx` - Container with add/edit/delete logic
- `tests/lib/validation/income.test.ts` - 22 validation tests
- `tests/hooks/useIncome.test.ts` - 20 hook tests
- `tests/components/accounts/IncomeForm.test.tsx` - 16 form tests
- `tests/components/accounts/IncomeCard.test.tsx` - 24 card tests
- `tests/components/accounts/IncomeList.test.tsx` - 8 list tests
- `tests/components/accounts/IncomeSection.test.tsx` - 16 section tests

**Modified:**
- `src/lib/validation/index.ts` - Added income exports
- `src/hooks/index.ts` - Added useIncome export
- `src/components/accounts/index.ts` - Added new component exports
- `src/pages/DataEntryPage.tsx` - Added IncomeSection
- `docs/sprint-artifacts/sprint-status.yaml` - Updated status to in-progress

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-02 | Story drafted from tech-spec-epic-2.md with full context from Story 2.2 learnings | SM Agent (Bob) |
| 2025-12-02 | Story implementation complete - all 8 tasks done, 423 tests passing | Dev Agent (Amelia) |
