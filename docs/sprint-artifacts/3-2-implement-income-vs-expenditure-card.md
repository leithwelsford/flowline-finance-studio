# Story 3.2: Implement Income vs Expenditure Card

Status: ready-for-dev

## Story

As a **user**,
I want **to see how my income compares to my spending**,
so that **I understand if I'm living within my means**.

## Acceptance Criteria

1. **AC-3.2.1:** Given income and expenses are entered, when I view the Dashboard, then I see an "Income vs Expenditure" card

2. **AC-3.2.2:** Card displays Total Monthly Income in ZAR format (R X,XXX.XX)

3. **AC-3.2.3:** Card displays Total Monthly Expenses in ZAR format (R X,XXX.XX)

4. **AC-3.2.4:** Card displays Discretionary Amount (Income - Expenses) in ZAR format

5. **AC-3.2.5:** Card displays Savings Rate as percentage: ((Income - Expenses) / Income) × 100

6. **AC-3.2.6:** Visual bar shows income vs expense proportions (stacked horizontal bar)

7. **AC-3.2.7:** Savings rate shows green if positive, red if negative

8. **AC-3.2.8:** Card uses teal header (#0d9488) per UX spec

## Tasks / Subtasks

- [ ] Task 1: Create IncomeExpenseCard types (AC: All)
  - [ ] Create `src/types/income-expense.ts`
  - [ ] Define IncomeExpenseMetrics interface: totalIncome, totalExpenses, discretionaryAmount, savingsRate
  - [ ] Export from `src/types/index.ts`

- [ ] Task 2: Create useIncomeExpense hook (AC: 2, 3, 4, 5)
  - [ ] Create `src/hooks/useIncomeExpense.ts`
  - [ ] Import useFinancialSnapshot from existing hooks
  - [ ] Calculate discretionaryAmount: totalMonthlyIncome - totalMonthlyExpenses
  - [ ] Calculate savingsRate: ((income - expenses) / income) × 100
  - [ ] Use big.js for all calculations per ADR-003
  - [ ] Handle edge cases: no income (division by zero), no data
  - [ ] Return { incomeExpense, isLoading, error }

- [ ] Task 3: Create ProportionBar component (AC: 6)
  - [ ] Create `src/components/dashboard/ProportionBar.tsx`
  - [ ] Props interface: income, expenses (both as Big or string)
  - [ ] Render horizontal stacked bar with two segments
  - [ ] Income segment: teal-500
  - [ ] Expense segment: slate-400
  - [ ] Calculate percentages for width styling
  - [ ] Add accessible labels for screen readers

- [ ] Task 4: Create IncomeExpenseCard component (AC: All)
  - [ ] Create `src/components/dashboard/IncomeExpenseCard.tsx`
  - [ ] Use HealthCard component (reuse from Story 3.1)
  - [ ] Use useIncomeExpense hook for data
  - [ ] Format values with formatCurrency (ZAR)
  - [ ] Display income, expenses, discretionary amount
  - [ ] Display savings rate with conditional coloring:
    - Green (text-green-500) if positive
    - Red (text-red-500) if negative
  - [ ] Include ProportionBar component
  - [ ] Handle loading state with skeleton
  - [ ] Handle empty data state

- [ ] Task 5: Update dashboard barrel exports (AC: 1)
  - [ ] Update `src/components/dashboard/index.ts` with new exports
  - [ ] Export ProportionBar
  - [ ] Export IncomeExpenseCard

- [ ] Task 6: Integrate into DashboardPage (AC: 1)
  - [ ] Import IncomeExpenseCard component
  - [ ] Add to DashboardPage after CashFlowHealth
  - [ ] Position in second slot of future ThreeNumbersGrid
  - [ ] Handle loading state with skeleton loader
  - [ ] Handle empty data state with prompt to add data

- [ ] Task 7: Write unit tests for useIncomeExpense hook (AC: 2, 3, 4, 5)
  - [ ] Create `tests/hooks/useIncomeExpense.test.ts`
  - [ ] Test discretionary amount calculation accuracy
  - [ ] Test savings rate calculation accuracy
  - [ ] Test positive savings rate scenario
  - [ ] Test negative savings rate scenario (expenses > income)
  - [ ] Test edge cases: zero income, no income data, no expense data
  - [ ] Test big.js precision for calculations

- [ ] Task 8: Write component tests (AC: All)
  - [ ] Create `tests/components/dashboard/ProportionBar.test.tsx`
  - [ ] Create `tests/components/dashboard/IncomeExpenseCard.test.tsx`
  - [ ] Test ProportionBar renders correct segment widths
  - [ ] Test IncomeExpenseCard renders all values
  - [ ] Test savings rate color logic (green/red)
  - [ ] Test ZAR formatting displayed correctly
  - [ ] Test teal header color class applied
  - [ ] Test loading state renders skeleton
  - [ ] Test empty state shows prompt

- [ ] Task 9: Verify build and all tests pass (AC: All)
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
│   ├── HealthCard.tsx           # REUSE from Story 3.1
│   ├── ProportionBar.tsx        # NEW: Stacked bar visualization
│   ├── IncomeExpenseCard.tsx    # NEW: Income vs expense card
│   └── index.ts                 # Update barrel exports
├── hooks/
│   └── useIncomeExpense.ts      # NEW: Income/expense metrics hook
├── types/
│   └── income-expense.ts        # NEW: Metric types
```

**ADR-003 (big.js):** All financial calculations must use big.js for precision. Savings rate calculated with Big type, then converted to number for display.

**ADR-005 (Zustand vs Dexie):** No Zustand needed for this story - data flows from Dexie via useFinancialSnapshot (existing) → useIncomeExpense (new) → React components.

**Data Flow (from architecture):**
```
Dexie DB (income, expenses)
    ↓
useLiveQuery() in useFinancialSnapshot (existing from Story 2.5)
    ↓
useIncomeExpense hook (new - derives metrics)
    ↓
IncomeExpenseCard → HealthCard + ProportionBar components
```

### Income vs Expense Logic

From [epics.md](../epics.md) Story 3.2:

```typescript
// Metrics Calculation Logic
const calculateIncomeExpenseMetrics = (
  totalIncome: Big,
  totalExpenses: Big
): IncomeExpenseMetrics => {
  const discretionaryAmount = totalIncome.minus(totalExpenses);

  // Handle edge case: no income
  if (totalIncome.eq(0)) {
    return {
      totalIncome,
      totalExpenses,
      discretionaryAmount,
      savingsRate: new Big(0)
    };
  }

  // Savings rate = (Income - Expenses) / Income × 100
  const savingsRate = discretionaryAmount.div(totalIncome).times(100);

  return { totalIncome, totalExpenses, discretionaryAmount, savingsRate };
};
```

### Visual Design (from UX Spec)

From [ux-design-specification.md](../ux-design-specification.md) Section 3.1:

**Color Application:**
- Card header: `bg-teal-600` (#0d9488)
- Savings rate positive: `text-green-500` (#10b981)
- Savings rate negative: `text-red-500` (#ef4444)
- Proportion bar income segment: `bg-teal-500`
- Proportion bar expense segment: `bg-slate-400`

**Card Structure (from Section 6.1):**
```tsx
<Card>
  <CardHeader className="bg-teal-600 text-white">
    <CardTitle>Income vs Expenditure</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-4">
      <div className="flex justify-between">
        <span className="text-slate-600">Total Income</span>
        <span className="font-semibold">{formattedIncome}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Total Expenses</span>
        <span className="font-semibold">{formattedExpenses}</span>
      </div>
      <ProportionBar income={income} expenses={expenses} />
      <div className="flex justify-between">
        <span className="text-slate-600">Discretionary</span>
        <span className="font-semibold">{formattedDiscretionary}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-slate-600">Savings Rate</span>
        <span className={savingsRateColor}>{savingsRate}%</span>
      </div>
    </div>
  </CardContent>
</Card>
```

### ProportionBar Design

The proportion bar is a horizontal stacked bar showing income vs expense distribution:

```tsx
// ProportionBar.tsx structure
<div className="w-full h-4 rounded-full overflow-hidden bg-slate-200">
  <div
    className="h-full bg-teal-500"
    style={{ width: `${incomePercent}%` }}
    aria-label={`Income: ${formatCurrency(income)}`}
  />
  <div
    className="h-full bg-slate-400"
    style={{ width: `${expensePercent}%` }}
    aria-label={`Expenses: ${formatCurrency(expenses)}`}
  />
</div>
```

Note: When expenses exceed income, the bar should show 100% expenses with the overflow indicated visually or via text.

### Project Structure Notes

**Files to Create:**
- `src/components/dashboard/ProportionBar.tsx` - Stacked bar component
- `src/components/dashboard/IncomeExpenseCard.tsx` - Main card component
- `src/hooks/useIncomeExpense.ts` - Metrics calculation hook
- `src/types/income-expense.ts` - Type definitions
- `tests/hooks/useIncomeExpense.test.ts`
- `tests/components/dashboard/ProportionBar.test.tsx`
- `tests/components/dashboard/IncomeExpenseCard.test.tsx`

**Files to Modify:**
- `src/types/index.ts` - Export new types
- `src/hooks/index.ts` - Export new hook
- `src/components/dashboard/index.ts` - Export new components
- `src/pages/DashboardPage.tsx` - Add IncomeExpenseCard component

### Learnings from Previous Story

**From Story 3.1 (Status: done)**

- **HealthCard component exists** at `src/components/dashboard/HealthCard.tsx` - REUSE for card structure
- **useFinancialSnapshot hook exists** at `src/hooks/useFinancialSnapshot.ts` - provides base data (totalMonthlyIncome, totalMonthlyExpenses)
- **formatCurrency()** available from `@/lib/format/currency` for ZAR display
- **Skeleton component** added in Story 3.1 at `src/components/ui/skeleton.tsx`
- **big.js pattern established** - use for all financial calculations
- **696 tests passing** - maintain test hygiene
- **Bundle size: 631KB** - monitor for Epic 3+ (warning threshold 500KB)
- **Hook composition pattern** established: new hook calls existing hook (useFinancialHealth calls useFinancialSnapshot)

**New Files from Story 3.1 (reference, reuse where applicable):**
- `src/components/dashboard/HealthCard.tsx` - Reusable card component with teal header
- `src/components/dashboard/CashFlowHealth.tsx` - Pattern for specific metric card
- `src/hooks/useFinancialHealth.ts` - Pattern for derived metrics hook
- `src/types/financial-health.ts` - Pattern for metric type definitions

**Reusable Patterns from Story 3.1:**
- Card-based layouts with teal header accent (HealthCard)
- Hook composition: new hook calls existing hook
- Status indicator pattern with icons + colors
- Loading/empty state handling in components
- Test patterns with mock data seeding

**Review Notes from Story 3.1:**
- All acceptance criteria verified complete
- No unresolved action items or blockers
- Bundle size at 631KB - monitor but not blocking

[Source: docs/sprint-artifacts/3-1-implement-cash-flow-health-card.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-3.2] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR40] - Income vs expenditure requirement
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-005] - Zustand vs Dexie for state
- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/ux-design-specification.md#Section-3.1] - Color system and status indicators
- [Source: docs/ux-design-specification.md#Section-6.1] - Component strategy and card structure

## Dev Agent Record

### Context Reference

- [3-2-implement-income-vs-expenditure-card.context.xml](./3-2-implement-income-vs-expenditure-card.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Story drafted with full context from Epic 3, Story 3.1 learnings, PRD, Architecture, and UX Spec | SM Agent (Bob) |
