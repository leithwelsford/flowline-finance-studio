# Story 2.4: Implement Expense Tracking by Category

Status: ready-for-dev

## Story

As a **user**,
I want **to track my monthly expenses by category**,
so that **the system can calculate my available surplus for debt payments**.

## Acceptance Criteria

1. **Given** I navigate to the Data Entry page **When** I click "Add Expense" **Then** I see a form with fields:
   - Category (required, dropdown: Housing, Transport, Food, Utilities, Insurance, Entertainment, Other)
   - Monthly amount (required, ZAR currency input, minimum R0)
   - Description (optional, text)

2. **Given** I fill out the form with valid data **When** I click "Save Expense" **Then** the expense entry is saved to Dexie database with `createdAt` timestamp

3. **Given** a successful save **When** the operation completes **Then** I see a success toast "Expense saved"

4. **Given** I add multiple expenses **When** I view the expenses section **Then** I see expenses grouped by category

5. **Given** I have multiple expense entries **When** I view the expenses section **Then** I see total monthly expenses displayed at the bottom of the list

6. **Given** I click "Edit" on an expense entry **When** the edit form opens **Then** the form is populated with existing data

7. **Given** I modify fields in edit mode and click "Save" **When** the save completes **Then** the expense entry is updated in database and I see success toast "Expense updated"

8. **Given** I click "Delete" on an expense entry **When** I see the confirmation dialog and confirm **Then** the entry is removed from database and I see success toast "Expense deleted"

9. **Given** I add, edit, or delete expense entries **When** I view total expenses **Then** the total recalculates automatically (reactive via useLiveQuery)

## Tasks / Subtasks

- [ ] Task 1: Create Zod validation schema (AC: 1, 2)
  - [ ] Create `src/lib/validation/expense.ts`
  - [ ] Define expenseSchema with all fields:
    - category: required ExpenseCategory enum value
    - amount: required string, numeric >= 0
    - description: optional string
  - [ ] Create conversion helpers: `formValuesToExpense()`, `expenseToFormValues()`
  - [ ] Export schema and inferred type
  - [ ] Update `src/lib/validation/index.ts` barrel export
  - [ ] Write tests for validation schema

- [ ] Task 2: Create useExpenses hook (AC: 2, 4, 5, 7, 8, 9)
  - [ ] Create `src/hooks/useExpenses.ts`
  - [ ] Implement `useLiveQuery` for reactive expense entries from Dexie
  - [ ] Implement `addExpense(data)` function returning `Result<number>`
  - [ ] Implement `updateExpense(id, updates)` function returning `Result<void>`
  - [ ] Implement `deleteExpense(id)` function returning `Result<void>`
  - [ ] Calculate `totalMonthlyExpenses` using big.js: sum of all expense amounts
  - [ ] Calculate `expensesByCategory`: Map<ExpenseCategory, string> for grouped totals
  - [ ] Add isLoading state
  - [ ] Update `src/hooks/index.ts` barrel export
  - [ ] Write tests for useExpenses hook

- [ ] Task 3: Create ExpenseForm component (AC: 1, 2, 3, 6, 7)
  - [ ] Create `src/components/accounts/ExpenseForm.tsx`
  - [ ] Use React Hook Form with Zod resolver
  - [ ] Implement controlled form with all fields from AC1:
    - Category Select dropdown using shadcn/ui Select component
    - Amount currency input (use formatCurrency pattern from Story 2.1)
    - Description optional text input
  - [ ] Support both create and edit modes via optional `expense` prop
  - [ ] Call `toast.success()` on successful save/update
  - [ ] Add proper form validation error display
  - [ ] Write component tests

- [ ] Task 4: Create ExpenseCard component (AC: 4)
  - [ ] Create `src/components/accounts/ExpenseCard.tsx`
  - [ ] Display expense category label, amount (ZAR formatted)
  - [ ] Show description if provided
  - [ ] Include Edit and Delete action buttons
  - [ ] Use category-specific icons from lucide-react
  - [ ] Use shadcn/ui Card components
  - [ ] Write component tests

- [ ] Task 5: Create ExpenseList component (AC: 4, 5)
  - [ ] Create `src/components/accounts/ExpenseList.tsx`
  - [ ] Group expenses by category with category headers
  - [ ] Display all expense entries as ExpenseCard components within groups
  - [ ] Display total monthly expenses at bottom with big.js sum
  - [ ] Display per-category subtotals
  - [ ] Format all totals as ZAR currency
  - [ ] Handle empty state with message "No expenses added yet"
  - [ ] Write component tests

- [ ] Task 6: Create ExpenseSection component (AC: 1, 4, 5, 6, 7, 8)
  - [ ] Create `src/components/accounts/ExpenseSection.tsx`
  - [ ] Show "Add Expense" button
  - [ ] Render ExpenseList with all entries
  - [ ] Implement add mode: clicking button opens ExpenseForm (empty)
  - [ ] Implement edit mode: clicking Edit opens ExpenseForm with expense data
  - [ ] Implement delete: clicking Delete opens AlertDialog confirmation
  - [ ] Handle empty state messaging
  - [ ] Use useExpenses hook for data
  - [ ] Write component tests

- [ ] Task 7: Integrate into DataEntryPage (AC: All)
  - [ ] Update `src/pages/DataEntryPage.tsx` to include ExpenseSection
  - [ ] Add section header "Monthly Expenses" below Income Sources section
  - [ ] Add informational text explaining expense tracking purpose
  - [ ] Style with appropriate spacing and layout

- [ ] Task 8: Run all tests and verify (AC: All)
  - [ ] Create barrel export updates in `src/components/accounts/index.ts`
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify all 9 acceptance criteria are implemented

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/
│   ├── ExpenseForm.tsx            # NEW: Expense entry form
│   ├── ExpenseCard.tsx            # NEW: Expense display card
│   ├── ExpenseList.tsx            # NEW: Expense list with grouping
│   ├── ExpenseSection.tsx         # NEW: Container with add/edit logic
│   └── index.ts                   # Update barrel exports
├── hooks/
│   └── useExpenses.ts             # NEW: Expense queries
├── lib/validation/
│   └── expense.ts                 # NEW: Zod schema
```

**ADR-002 (Dexie.js):** All data persisted to IndexedDB via Dexie with `useLiveQuery`
**ADR-003 (big.js):** Monetary calculations use big.js for precision
**ADR-006 (React Hook Form + Zod):** Forms use RHF with Zod validation

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md):

**Data Model (already exists in src/types/expense.ts):**
```typescript
interface ExpenseEntry {
  id?: number;
  category: ExpenseCategory;
  amount: string;           // big.js compatible
  description?: string;
  createdAt: string;
}

type ExpenseCategory =
  | 'housing'
  | 'transport'
  | 'food'
  | 'utilities'
  | 'insurance'
  | 'entertainment'
  | 'other';

const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'housing', label: 'Housing' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];
```

**Hook Interface:**
```typescript
interface UseExpensesReturn {
  expenses: ExpenseEntry[];
  isLoading: boolean;
  addExpense: (expense: Omit<ExpenseEntry, 'id' | 'createdAt'>) => Promise<Result<number>>;
  updateExpense: (id: number, updates: Partial<ExpenseEntry>) => Promise<Result<void>>;
  deleteExpense: (id: number) => Promise<Result<void>>;
  totalMonthlyExpenses: string;       // big.js sum
  expensesByCategory: Map<ExpenseCategory, string>; // grouped totals
}
```

### Category Grouping Implementation

```typescript
import Big from 'big.js';

const expensesByCategory = useMemo(() => {
  if (!expenses || expenses.length === 0) return new Map();

  const grouped = new Map<ExpenseCategory, string>();

  for (const expense of expenses) {
    const current = grouped.get(expense.category) || '0';
    grouped.set(
      expense.category,
      new Big(current).plus(new Big(expense.amount)).toString()
    );
  }

  return grouped;
}, [expenses]);

// Example output:
// Map {
//   'housing' => '12000',
//   'transport' => '3500',
//   'food' => '5000',
//   'utilities' => '1800'
// }
```

### Category Icons

```typescript
import {
  Home,
  Car,
  UtensilsCrossed,
  Zap,
  Shield,
  Clapperboard,
  MoreHorizontal
} from 'lucide-react';

const CATEGORY_ICONS: Record<ExpenseCategory, React.ComponentType> = {
  housing: Home,
  transport: Car,
  food: UtensilsCrossed,
  utilities: Zap,
  insurance: Shield,
  entertainment: Clapperboard,
  other: MoreHorizontal,
};
```

### Project Structure Notes

**Files to Create:**
- `src/lib/validation/expense.ts`
- `src/hooks/useExpenses.ts`
- `src/components/accounts/ExpenseForm.tsx`
- `src/components/accounts/ExpenseCard.tsx`
- `src/components/accounts/ExpenseList.tsx`
- `src/components/accounts/ExpenseSection.tsx`
- `tests/lib/validation/expense.test.ts`
- `tests/hooks/useExpenses.test.ts`
- `tests/components/accounts/ExpenseForm.test.tsx`
- `tests/components/accounts/ExpenseCard.test.tsx`
- `tests/components/accounts/ExpenseList.test.tsx`
- `tests/components/accounts/ExpenseSection.test.tsx`

**Files to Modify:**
- `src/lib/validation/index.ts` - Add expense export
- `src/hooks/index.ts` - Add useExpenses export
- `src/components/accounts/index.ts` - Add new component exports
- `src/pages/DataEntryPage.tsx` - Add ExpenseSection

### Learnings from Previous Story

**From Story 2.3 (Status: done)**

- **Validation Pattern Ready:** Use same Zod schema structure with `formValuesToExpense()` and `expenseToFormValues()` conversion helpers
- **Currency Formatting Ready:** Use `formatCurrency()` from `@/lib/format/currency` for ZAR display
- **Hook Pattern:** Follow useIncome structure - useLiveQuery, CRUD operations, Result types
- **Component Structure:** Form, Card, List, Section pattern established
- **Toast Pattern:** Use `toast.success('message')` for success, `toast.error('message')` for errors
- **Result Type Ready:** `src/lib/utils/result.ts` with `ok<T>()`, `err<E>()`, `isOk()`, `isErr()`
- **Test Count:** 423 tests passing - maintain test hygiene
- **Test Setup:** Use `fake-indexeddb/auto` for Dexie tests
- **Payment Date Validation:** Changed from transform-based to simple optional type for cleaner TypeScript
- **Reactive Totals:** useLiveQuery + useMemo with big.js precision works well

**New for This Story:**
- **Category Dropdown:** Use shadcn/ui Select component (already installed per tech-spec)
- **Category Grouping:** Group expenses by category in list view with subtotals
- **Category Icons:** Use lucide-react icons for visual category identification

**Reusable from Previous Stories:**
- `formatCurrency()` from `@/lib/format/currency`
- `parseCurrencyInput()` from `@/lib/format/currency`
- `DeleteConfirmDialog` pattern from Story 2.1/2.2
- Test setup patterns with `fake-indexeddb/auto`
- AlertDialog component for delete confirmations
- Form/Card/List/Section component patterns

[Source: docs/sprint-artifacts/2-3-implement-income-entry.md#Completion-Notes-List]

### Testing Approach

**Unit Tests:**
- Zod schema validation (valid/invalid inputs)
- Total expenses calculation with big.js
- Category grouping logic
- Category enum validation

**Component Tests:**
- ExpenseForm: form rendering, category dropdown, validation display, submit handling
- ExpenseCard: data display, category icon, optional description
- ExpenseList: empty state, grouped display, category headers, totals
- ExpenseSection: add flow, edit flow, delete flow

**Integration Test Pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.expenses.clear();
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-006] - React Hook Form + Zod
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Story-2.4] - Detailed acceptance criteria
- [Source: docs/epics.md#Story-2.4] - Original story definition
- [Source: docs/prd.md#FR4] - Expense tracking requirements

## Dev Agent Record

### Context Reference

- [2-4-implement-expense-tracking-by-category.context.xml](docs/sprint-artifacts/2-4-implement-expense-tracking-by-category.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story drafted from tech-spec-epic-2.md with full context from Story 2.3 learnings | SM Agent (Bob) |
