# Story 2.5: Implement Financial Snapshot View

Status: done

## Story

As a **user**,
I want **to see a complete snapshot of my financial situation**,
so that **I can verify all data is entered correctly before running calculations**.

## Acceptance Criteria

1. **Given** I have entered accounts, income, and expenses **When** I navigate to the Data Entry page **Then** I see a summary panel showing:
   - **Total Debt:** Sum of all account balances (ZAR)
   - **Total Monthly Income:** Sum of all income (ZAR)
   - **Total Monthly Expenses:** Sum of all expenses (ZAR)
   - **Minimum Debt Payments:** Sum of all minimum payments (ZAR)
   - **Available Surplus:** Income - Expenses - Minimum Payments (ZAR)
   - **Number of Accounts:** Count

2. **Given** Available Surplus is negative **When** I view the snapshot **Then** the surplus shows in red with warning icon

3. **Given** Available Surplus is positive **When** I view the snapshot **Then** the surplus shows in green

4. **Given** I make changes to any data (accounts, income, expenses) **When** I return to the snapshot view **Then** all totals update automatically (reactive via Dexie useLiveQuery)

5. **Given** I have no accounts, income, or expenses entered **When** I view the snapshot **Then** I see zeros for all values with helpful messaging to add data

6. **Given** I have a flexi facility **When** I view the snapshot **Then** I see an indicator showing flexi facility status (available credit)

## Tasks / Subtasks

- [x] Task 1: Create FinancialSnapshot TypeScript type (AC: 1)
  - [x] Create `src/types/financial-snapshot.ts` with FinancialSnapshot interface
  - [x] Add fields: totalDebt, totalMonthlyIncome, totalMonthlyExpenses, minimumDebtPayments, availableSurplus, accountCount, hasFlexi, flexiAvailableCredit
  - [x] Update `src/types/index.ts` barrel export
  - [x] All monetary values as string for big.js compatibility

- [x] Task 2: Create useFinancialSnapshot hook (AC: 1, 4, 5, 6)
  - [x] Create `src/hooks/useFinancialSnapshot.ts`
  - [x] Import and use existing hooks: useAccounts, useIncome, useExpenses, useFlexiFacility
  - [x] Calculate totalDebt: sum of all account balances using big.js
  - [x] Calculate totalMonthlyIncome: from useIncome hook
  - [x] Calculate totalMonthlyExpenses: from useExpenses hook
  - [x] Calculate minimumDebtPayments: sum of all account minimum payments using big.js
  - [x] Calculate availableSurplus: income - expenses - minimumPayments using big.js
  - [x] Calculate accountCount: accounts.length
  - [x] Check hasFlexi: facility !== null
  - [x] Calculate flexiAvailableCredit: creditLimit - currentBalance if flexi exists
  - [x] Return isLoading state (any hook loading)
  - [x] Return isHealthy: availableSurplus > 0
  - [x] Update `src/hooks/index.ts` barrel export
  - [x] Write tests for useFinancialSnapshot hook

- [x] Task 3: Create FinancialSnapshot component (AC: 1, 2, 3, 5, 6)
  - [x] Create `src/components/accounts/FinancialSnapshot.tsx`
  - [x] Use shadcn/ui Card as container
  - [x] Display all 6 snapshot metrics with labels
  - [x] Format all monetary values using formatCurrency() from `@/lib/format/currency`
  - [x] Apply conditional styling for surplus:
    - Red text (red-500) + warning icon (AlertTriangle from lucide-react) if negative
    - Green text (green-500) + check icon (CheckCircle from lucide-react) if positive
  - [x] Display account count
  - [x] Display flexi facility status if present (green badge with available credit)
  - [x] Handle empty state: show zeros with "Add accounts, income, and expenses to see your financial snapshot"
  - [x] Use semantic colors from UX spec (green-500, red-500, slate colors)
  - [x] Write component tests

- [x] Task 4: Create SnapshotMetricCard sub-component (AC: 1, 2, 3)
  - [x] Create `src/components/accounts/SnapshotMetricCard.tsx`
  - [x] Props: label, value, variant ('default' | 'positive' | 'negative' | 'neutral'), icon (optional)
  - [x] Display label and formatted value
  - [x] Apply variant-based styling (color, icon)
  - [x] Use consistent typography and spacing
  - [x] Write component tests

- [x] Task 5: Integrate into DataEntryPage (AC: All)
  - [x] Update `src/pages/DataEntryPage.tsx` to include FinancialSnapshot at the top
  - [x] Position snapshot panel prominently above data entry sections
  - [x] Add section header "Financial Snapshot"
  - [x] Ensure proper spacing between snapshot and data entry sections
  - [x] Verify reactive updates when data changes

- [x] Task 6: Run all tests and verify (AC: All)
  - [x] Create barrel export updates in `src/components/accounts/index.ts`
  - [x] Run `npm run test` and ensure all tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify all 6 acceptance criteria are implemented

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/
│   ├── FinancialSnapshot.tsx       # NEW: Summary panel
│   ├── SnapshotMetricCard.tsx      # NEW: Individual metric display
│   └── index.ts                    # Update barrel exports
├── hooks/
│   └── useFinancialSnapshot.ts     # NEW: Aggregated calculations
├── types/
│   └── financial-snapshot.ts       # NEW: Snapshot type definition
```

**ADR-002 (Dexie.js):** Leverages useLiveQuery from existing hooks for reactive updates
**ADR-003 (big.js):** All monetary calculations use big.js for precision
**ADR-005 (Zustand):** No additional store needed - uses existing hooks

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md):

**Data Model (to be created in src/types/financial-snapshot.ts):**
```typescript
interface FinancialSnapshot {
  totalDebt: string;            // Sum of all account balances
  totalMonthlyIncome: string;   // Sum of all income
  totalMonthlyExpenses: string; // Sum of all expenses
  minimumDebtPayments: string;  // Sum of all minimum payments
  availableSurplus: string;     // Income - Expenses - MinPayments
  accountCount: number;
  hasFlexi: boolean;
  flexiAvailableCredit?: string; // If flexi exists
}
```

**Hook Interface:**
```typescript
interface UseFinancialSnapshotReturn {
  snapshot: FinancialSnapshot;
  isLoading: boolean;
  isHealthy: boolean;         // availableSurplus > 0
}
```

### Calculation Logic

```typescript
import Big from 'big.js';

// In useFinancialSnapshot hook
const totalDebt = useMemo(() => {
  if (!accounts || accounts.length === 0) return '0';
  return accounts.reduce(
    (sum, acc) => new Big(sum).plus(new Big(acc.balance)),
    new Big('0')
  ).toString();
}, [accounts]);

const minimumDebtPayments = useMemo(() => {
  if (!accounts || accounts.length === 0) return '0';
  return accounts.reduce(
    (sum, acc) => new Big(sum).plus(new Big(acc.minimumPayment)),
    new Big('0')
  ).toString();
}, [accounts]);

const availableSurplus = useMemo(() => {
  return new Big(totalMonthlyIncome)
    .minus(new Big(totalMonthlyExpenses))
    .minus(new Big(minimumDebtPayments))
    .toString();
}, [totalMonthlyIncome, totalMonthlyExpenses, minimumDebtPayments]);

const isHealthy = useMemo(() => {
  return new Big(availableSurplus).gt(0);
}, [availableSurplus]);
```

### Visual Design (from UX Spec)

From [ux-design-specification.md](../ux-design-specification.md):

**Color Usage:**
- Positive surplus: `green-500` (#10b981) with CheckCircle icon
- Negative surplus: `red-500` (#ef4444) with AlertTriangle icon
- Neutral values: `slate-900` (#0f172a)
- Labels: `slate-600` (#475569)

**Card Layout:**
- Use shadcn/ui Card component
- Grid layout for metrics: 2x3 on desktop, 1x6 on mobile
- Each metric as SnapshotMetricCard sub-component
- Teal header accent (#0d9488) for the summary card

### Project Structure Notes

**Files to Create:**
- `src/types/financial-snapshot.ts`
- `src/hooks/useFinancialSnapshot.ts`
- `src/components/accounts/FinancialSnapshot.tsx`
- `src/components/accounts/SnapshotMetricCard.tsx`
- `tests/hooks/useFinancialSnapshot.test.ts`
- `tests/components/accounts/FinancialSnapshot.test.tsx`
- `tests/components/accounts/SnapshotMetricCard.test.tsx`

**Files to Modify:**
- `src/types/index.ts` - Add financial-snapshot export
- `src/hooks/index.ts` - Add useFinancialSnapshot export
- `src/components/accounts/index.ts` - Add new component exports
- `src/pages/DataEntryPage.tsx` - Add FinancialSnapshot at top

### Learnings from Previous Story

**From Story 2.4 (Status: done)**

- **536 tests passing** - maintain test hygiene
- **Test Setup:** Use `fake-indexeddb/auto` for Dexie tests
- **Currency Formatting Ready:** Use `formatCurrency()` from `@/lib/format/currency` for ZAR display
- **Hook Composition:** Can compose from useAccounts, useIncome, useExpenses, useFlexiFacility
- **big.js Pattern:** Sum calculations using `.reduce()` with `new Big(sum).plus(new Big(value))`
- **Reactive Pattern:** useLiveQuery in child hooks automatically propagates reactivity
- **Bundle size note:** ~598KB (warning threshold 500KB) - monitor for Epic 3+
- **Component Patterns:** Card-based layouts with consistent styling established

**Reusable from Previous Stories:**
- `formatCurrency()` from `@/lib/format/currency`
- `useAccounts`, `useIncome`, `useExpenses`, `useFlexiFacility` hooks
- Result type from `@/lib/utils/result.ts`
- shadcn/ui Card, Badge components
- lucide-react icons (CheckCircle, AlertTriangle, etc.)

[Source: docs/sprint-artifacts/2-4-implement-expense-tracking-by-category.md#Senior-Developer-Review]

### Testing Approach

**Unit Tests:**
- FinancialSnapshot type creation
- Surplus calculation with big.js (positive, negative, zero cases)
- isHealthy boolean derivation
- Edge cases: empty accounts, no income, no expenses

**Component Tests:**
- FinancialSnapshot: all metrics displayed, color variants applied
- SnapshotMetricCard: variant styling, icon display
- Empty state rendering
- Flexi facility indicator when present

**Integration Test Pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.accounts.clear();
  await db.income.clear();
  await db.expenses.clear();
  await db.flexiFacility.clear();
});

// Test reactive updates by adding/modifying data
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Story-2.5] - Acceptance criteria
- [Source: docs/epics.md#Story-2.5] - Original story definition
- [Source: docs/prd.md#FR6] - Financial snapshot requirements
- [Source: docs/ux-design-specification.md#Color-System] - Visual design colors

## Dev Agent Record

### Context Reference

- [2-5-implement-financial-snapshot-view.context.xml](./2-5-implement-financial-snapshot-view.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Composed useFinancialSnapshot from existing hooks (useAccounts, useIncome, useExpenses, useFlexiFacility)
- All calculations use big.js for precision per ADR-003
- Leveraged existing totalDebt, totalMinPayments, totalMonthlyIncome, totalMonthlyExpenses from child hooks
- SnapshotMetricCard created as reusable sub-component with variant-based styling

### Completion Notes List

- ✅ All 6 acceptance criteria implemented and tested
- ✅ 586 tests passing (50 new tests added)
- ✅ Build passes with no type errors
- ✅ Bundle size: ~601KB (slight increase from 598KB, within acceptable range)
- ✅ FinancialSnapshot displays at top of DataEntryPage with teal header accent
- ✅ Flexi facility badge shows when facility exists with available credit
- ✅ Surplus color coding: green (positive), red (negative), neutral (zero) with icons
- ✅ Empty state message displays when no data entered
- ✅ Reactive updates via Dexie useLiveQuery propagation

### File List

**Created:**
- src/types/financial-snapshot.ts
- src/hooks/useFinancialSnapshot.ts
- src/components/accounts/FinancialSnapshot.tsx
- src/components/accounts/SnapshotMetricCard.tsx
- tests/hooks/useFinancialSnapshot.test.ts
- tests/components/accounts/FinancialSnapshot.test.tsx
- tests/components/accounts/SnapshotMetricCard.test.tsx

**Modified:**
- src/types/index.ts
- src/hooks/index.ts
- src/components/accounts/index.ts
- src/pages/DataEntryPage.tsx

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story drafted from tech-spec-epic-2.md with full context from Story 2.4 learnings | SM Agent (Bob) |
| 2025-12-03 | Story implementation complete - all 6 ACs satisfied, 586 tests passing, build clean | Dev Agent (Amelia) |
