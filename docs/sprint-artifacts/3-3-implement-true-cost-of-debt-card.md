# Story 3.3: Implement True Cost of Debt Card

Status: ready-for-dev

## Story

As a **user**,
I want **to see the true cost of my debt**,
so that **I understand how much money is going to interest alone**.

## Acceptance Criteria

1. **AC-3.3.1:** Given I have debt accounts entered, when I view the Dashboard, then I see a "True Cost of Debt" card

2. **AC-3.3.2:** Card displays Monthly Interest Charges: total interest across all accounts in ZAR format (R X,XXX.XX)

3. **AC-3.3.3:** Card displays Annual Interest Projection: Monthly Interest × 12 in ZAR format

4. **AC-3.3.4:** Card displays Interest-to-Income Ratio: (Monthly Interest / Monthly Income) × 100 as percentage

5. **AC-3.3.5:** Interest values display in red (honest truth-telling per UX spec)

6. **AC-3.3.6:** If Interest-to-Income Ratio > 20%, card shows warning message "High debt burden"

7. **AC-3.3.7:** Card uses teal header (#0d9488) per UX spec

8. **AC-3.3.8:** Card handles edge cases: no accounts, no income (division by zero), flexi vs standard interest calculation

## Tasks / Subtasks

- [ ] Task 1: Create TrueCostCard types (AC: All)
  - [ ] Create `src/types/true-cost.ts`
  - [ ] Define TrueCostMetrics interface: monthlyInterest, annualInterest, interestToIncomeRatio, isHighBurden
  - [ ] Export from `src/types/index.ts`

- [ ] Task 2: Create interest calculation utilities (AC: 2, 3, 8)
  - [ ] Create `src/lib/calculations/interest.ts` (or extend if exists)
  - [ ] Implement `calculateMonthlyInterest(account: DebtAccount): Big`
    - Standard loans: (balance × rate) / 12
    - Flexi facilities: (balance × rate) / 365 × 30 (approximate monthly)
  - [ ] Implement `calculateTotalMonthlyInterest(accounts: DebtAccount[], flexi: FlexiFacility | null): Big`
  - [ ] Use big.js for all calculations per ADR-003
  - [ ] Handle edge cases: zero balance, zero rate

- [ ] Task 3: Create useTrueCost hook (AC: 2, 3, 4, 6, 8)
  - [ ] Create `src/hooks/useTrueCost.ts`
  - [ ] Import useAccounts, useFlexiFacility, useFinancialSnapshot from existing hooks
  - [ ] Calculate monthlyInterest: sum of all account interest charges
  - [ ] Calculate annualInterest: monthlyInterest × 12
  - [ ] Calculate interestToIncomeRatio: (monthlyInterest / monthlyIncome) × 100
  - [ ] Calculate isHighBurden: ratio > 20
  - [ ] Use big.js for all calculations per ADR-003
  - [ ] Handle edge cases: no accounts (return zero), no income (ratio = 0 or N/A)
  - [ ] Return { trueCost: TrueCostMetrics, isLoading, error }

- [ ] Task 4: Create TrueCostCard component (AC: All)
  - [ ] Create `src/components/dashboard/TrueCostCard.tsx`
  - [ ] Use Card component with teal header (bg-teal-600)
  - [ ] Use useTrueCost hook for data
  - [ ] Format values with formatCurrency (ZAR)
  - [ ] Display monthly interest charges in red (text-red-500)
  - [ ] Display annual interest projection in red (text-red-500)
  - [ ] Display interest-to-income ratio with percentage formatting
  - [ ] Conditionally show "High debt burden" warning if ratio > 20%
  - [ ] Add warning icon (lucide-react AlertTriangle) next to warning message
  - [ ] Handle loading state with skeleton
  - [ ] Handle empty data state (no accounts)

- [ ] Task 5: Update dashboard barrel exports (AC: 1)
  - [ ] Update `src/components/dashboard/index.ts` with TrueCostCard export

- [ ] Task 6: Integrate into DashboardPage (AC: 1)
  - [ ] Import TrueCostCard component
  - [ ] Add to DashboardPage after IncomeExpenseCard
  - [ ] Position in third slot of future ThreeNumbersGrid
  - [ ] Handle loading state with skeleton loader
  - [ ] Handle empty data state

- [ ] Task 7: Write unit tests for interest calculations (AC: 2, 3, 8)
  - [ ] Create `tests/lib/calculations/interest.test.ts`
  - [ ] Test standard loan interest: R100,000 at 11.5% = R958.33/month
  - [ ] Test flexi facility interest: daily compounding approximation
  - [ ] Test multiple accounts summed correctly
  - [ ] Test edge cases: zero balance, zero rate
  - [ ] Test big.js precision for calculations

- [ ] Task 8: Write unit tests for useTrueCost hook (AC: 2, 3, 4, 6, 8)
  - [ ] Create `tests/hooks/useTrueCost.test.ts`
  - [ ] Test monthlyInterest calculation accuracy
  - [ ] Test annualInterest = monthlyInterest × 12
  - [ ] Test interestToIncomeRatio calculation accuracy
  - [ ] Test isHighBurden threshold (> 20%)
  - [ ] Test edge cases: no accounts, no income, mixed account types
  - [ ] Test big.js precision

- [ ] Task 9: Write component tests (AC: All)
  - [ ] Create `tests/components/dashboard/TrueCostCard.test.tsx`
  - [ ] Test card renders with teal header
  - [ ] Test monthly interest displays in ZAR format
  - [ ] Test annual interest displays correctly
  - [ ] Test interest-to-income ratio displays as percentage
  - [ ] Test red color applied to interest values (text-red-500)
  - [ ] Test warning message appears when ratio > 20%
  - [ ] Test warning icon present with warning message
  - [ ] Test loading state renders skeleton
  - [ ] Test empty state (no accounts) shows appropriate message

- [ ] Task 10: Verify build and all tests pass (AC: All)
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no console errors in browser

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/dashboard/
│   ├── HealthCard.tsx           # Available from Story 3.1
│   ├── CashFlowHealth.tsx       # Available from Story 3.1
│   ├── ProportionBar.tsx        # Available from Story 3.2
│   ├── IncomeExpenseCard.tsx    # Available from Story 3.2
│   ├── TrueCostCard.tsx         # NEW: True cost of debt card
│   └── index.ts                 # Update barrel exports
├── lib/calculations/
│   └── interest.ts              # NEW: Interest calculation utilities
├── hooks/
│   └── useTrueCost.ts           # NEW: True cost metrics hook
├── types/
│   └── true-cost.ts             # NEW: Metric types
```

**ADR-003 (big.js):** All financial calculations must use big.js for precision. Interest calculations are critical for accuracy.

**ADR-005 (Zustand vs Dexie):** No Zustand needed for this story - data flows from Dexie via existing hooks → useTrueCost (new) → React components.

**Data Flow (from architecture):**
```
Dexie DB (accounts, flexiFacility, income)
    ↓
useLiveQuery() in useAccounts, useFlexiFacility, useFinancialSnapshot (existing)
    ↓
useTrueCost hook (new - calculates interest metrics)
    ↓
TrueCostCard component
```

### Interest Calculation Logic

From [epics.md](../epics.md) Story 3.3 and [prd.md](../prd.md) FR41:

**Standard Loan Monthly Interest:**
```typescript
// For standard loans (home_loan, vehicle_finance, personal_loan, credit_card)
const monthlyInterest = balance.times(annualRate).div(12);
// Example: R100,000 at 11.5% = R100,000 × 0.115 / 12 = R958.33/month
```

**Flexi Facility Monthly Interest (Approximation):**
```typescript
// Flexi facilities use daily compounding, approximate monthly:
const dailyInterest = balance.times(annualRate).div(365);
const monthlyInterest = dailyInterest.times(30); // Average month
// More precise: dailyInterest.times(daysInMonth)
```

**Total Monthly Interest:**
```typescript
// Sum all account interest charges
const totalMonthly = accounts.reduce(
  (sum, acct) => sum.plus(calculateMonthlyInterest(acct)),
  new Big(0)
);
if (flexiFacility) {
  totalMonthly = totalMonthly.plus(calculateFlexiMonthlyInterest(flexiFacility));
}
```

**Interest-to-Income Ratio:**
```typescript
// Handle edge case: no income
if (monthlyIncome.eq(0)) {
  return { ratio: new Big(0), isHighBurden: false }; // or show "N/A"
}
const ratio = monthlyInterest.div(monthlyIncome).times(100);
const isHighBurden = ratio.gt(20);
```

### Visual Design (from UX Spec)

From [ux-design-specification.md](../ux-design-specification.md) Section 3.1:

**Color Application:**
- Card header: `bg-teal-600` (#0d9488)
- Interest values: `text-red-500` (#ef4444) - honest truth-telling
- High burden warning: amber background or red text with warning icon

**Card Structure (from Section 6.1):**
```tsx
<Card>
  <CardHeader className="bg-teal-600 text-white">
    <CardTitle>True Cost of Debt</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-slate-600">Monthly Interest</span>
        <span className="font-semibold text-red-500">{formattedMonthly}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Annual Interest</span>
        <span className="font-semibold text-red-500">{formattedAnnual}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Interest-to-Income</span>
        <span className="font-semibold">{ratio}%</span>
      </div>
      {isHighBurden && (
        <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">High debt burden</span>
        </div>
      )}
    </div>
  </CardContent>
</Card>
```

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/interest.ts` - Interest calculation utilities
- `src/components/dashboard/TrueCostCard.tsx` - Main card component
- `src/hooks/useTrueCost.ts` - Metrics calculation hook
- `src/types/true-cost.ts` - Type definitions
- `tests/lib/calculations/interest.test.ts`
- `tests/hooks/useTrueCost.test.ts`
- `tests/components/dashboard/TrueCostCard.test.tsx`

**Files to Modify:**
- `src/types/index.ts` - Export new types
- `src/hooks/index.ts` - Export new hook
- `src/components/dashboard/index.ts` - Export new component
- `src/pages/DashboardPage.tsx` - Add TrueCostCard component

### Learnings from Previous Story

**From Story 3.2 (Status: done)**

- **Hook composition pattern established**: useIncomeExpense calls useFinancialSnapshot - follow this pattern for useTrueCost
- **Card component pattern**: Used Card directly instead of HealthCard for more flexible layout - consider same approach for TrueCostCard
- **ProportionBar available**: `src/components/dashboard/ProportionBar.tsx` - not needed for this story but available
- **formatCurrency()** available from `@/lib/format/currency` for ZAR display
- **Skeleton component** available at `src/components/ui/skeleton.tsx`
- **big.js pattern well-established** - use for all financial calculations
- **739 tests passing** - maintain test hygiene
- **Bundle size: 635KB** - approaching 500KB warning threshold, monitor
- **Pre-existing flaky test** in QuickBalanceUpdate.test.tsx (flexi balance save timing) - not related to this story

**New Files from Story 3.2 (reference, reuse where applicable):**
- `src/types/income-expense.ts` - Pattern for metric type definitions
- `src/hooks/useIncomeExpense.ts` - Pattern for derived metrics hook
- `src/components/dashboard/ProportionBar.tsx` - Stacked bar (not needed here)
- `src/components/dashboard/IncomeExpenseCard.tsx` - Card component pattern

**Reusable Patterns from Story 3.2:**
- Card-based layouts with teal header accent
- Hook composition: new hook calls existing hooks
- Loading/empty state handling in components
- Test patterns with mock data seeding
- big.js for all calculations

**Review Notes from Story 3.2:**
- All acceptance criteria verified complete
- No unresolved action items or blockers
- Advisory: Bundle size at 635KB - consider code-splitting when approaching 750KB
- Advisory: Pre-existing flaky test in QuickBalanceUpdate.test.tsx should be addressed in future story

[Source: docs/sprint-artifacts/3-2-implement-income-vs-expenditure-card.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-3.3] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR41] - True cost of debt requirement
- [Source: docs/prd.md#FR9-10] - Interest calculation requirements (daily vs monthly)
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-005] - Zustand vs Dexie for state
- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#Novel-Pattern] - Calculation engine design
- [Source: docs/ux-design-specification.md#Section-3.1] - Color system (red for debt/truth-telling)
- [Source: docs/ux-design-specification.md#Section-6.1] - Component strategy and card structure

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/3-3-implement-true-cost-of-debt-card.context.xml](3-3-implement-true-cost-of-debt-card.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Story drafted with full context from Epic 3, Story 3.2 learnings, PRD (FR41, FR9-10), Architecture (ADR-003), and UX Spec | SM Agent (Bob) |
| 2025-12-04 | Story context generated and status updated to ready-for-dev | SM Agent (Bob) |
