# Story 3.3: Implement True Cost of Debt Card

Status: done

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

- [x] Task 1: Create TrueCostCard types (AC: All)
  - [x] Create `src/types/true-cost.ts`
  - [x] Define TrueCostMetrics interface: monthlyInterest, annualInterest, interestToIncomeRatio, isHighBurden
  - [x] Export from `src/types/index.ts`

- [x] Task 2: Create interest calculation utilities (AC: 2, 3, 8)
  - [x] Create `src/lib/calculations/interest.ts` (or extend if exists)
  - [x] Implement `calculateMonthlyInterest(account: DebtAccount): Big`
    - Standard loans: (balance × rate) / 12
    - Flexi facilities: (balance × rate) / 365 × 30 (approximate monthly)
  - [x] Implement `calculateTotalMonthlyInterest(accounts: DebtAccount[], flexi: FlexiFacility | null): Big`
  - [x] Use big.js for all calculations per ADR-003
  - [x] Handle edge cases: zero balance, zero rate

- [x] Task 3: Create useTrueCost hook (AC: 2, 3, 4, 6, 8)
  - [x] Create `src/hooks/useTrueCost.ts`
  - [x] Import useAccounts, useFlexiFacility, useFinancialSnapshot from existing hooks
  - [x] Calculate monthlyInterest: sum of all account interest charges
  - [x] Calculate annualInterest: monthlyInterest × 12
  - [x] Calculate interestToIncomeRatio: (monthlyInterest / monthlyIncome) × 100
  - [x] Calculate isHighBurden: ratio > 20
  - [x] Use big.js for all calculations per ADR-003
  - [x] Handle edge cases: no accounts (return zero), no income (ratio = 0 or N/A)
  - [x] Return { trueCost: TrueCostMetrics, isLoading, error }

- [x] Task 4: Create TrueCostCard component (AC: All)
  - [x] Create `src/components/dashboard/TrueCostCard.tsx`
  - [x] Use Card component with teal header (bg-teal-600)
  - [x] Use useTrueCost hook for data
  - [x] Format values with formatCurrency (ZAR)
  - [x] Display monthly interest charges in red (text-red-500)
  - [x] Display annual interest projection in red (text-red-500)
  - [x] Display interest-to-income ratio with percentage formatting
  - [x] Conditionally show "High debt burden" warning if ratio > 20%
  - [x] Add warning icon (lucide-react AlertTriangle) next to warning message
  - [x] Handle loading state with skeleton
  - [x] Handle empty data state (no accounts)

- [x] Task 5: Update dashboard barrel exports (AC: 1)
  - [x] Update `src/components/dashboard/index.ts` with TrueCostCard export

- [x] Task 6: Integrate into DashboardPage (AC: 1)
  - [x] Import TrueCostCard component
  - [x] Add to DashboardPage after IncomeExpenseCard
  - [x] Position in third slot of future ThreeNumbersGrid
  - [x] Handle loading state with skeleton loader
  - [x] Handle empty data state

- [x] Task 7: Write unit tests for interest calculations (AC: 2, 3, 8)
  - [x] Create `tests/lib/calculations/interest.test.ts`
  - [x] Test standard loan interest: R100,000 at 11.5% = R958.33/month
  - [x] Test flexi facility interest: daily compounding approximation
  - [x] Test multiple accounts summed correctly
  - [x] Test edge cases: zero balance, zero rate
  - [x] Test big.js precision for calculations

- [x] Task 8: Write unit tests for useTrueCost hook (AC: 2, 3, 4, 6, 8)
  - [x] Create `tests/hooks/useTrueCost.test.ts`
  - [x] Test monthlyInterest calculation accuracy
  - [x] Test annualInterest = monthlyInterest × 12
  - [x] Test interestToIncomeRatio calculation accuracy
  - [x] Test isHighBurden threshold (> 20%)
  - [x] Test edge cases: no accounts, no income, mixed account types
  - [x] Test big.js precision

- [x] Task 9: Write component tests (AC: All)
  - [x] Create `tests/components/dashboard/TrueCostCard.test.tsx`
  - [x] Test card renders with teal header
  - [x] Test monthly interest displays in ZAR format
  - [x] Test annual interest displays correctly
  - [x] Test interest-to-income ratio displays as percentage
  - [x] Test red color applied to interest values (text-red-500)
  - [x] Test warning message appears when ratio > 20%
  - [x] Test warning icon present with warning message
  - [x] Test loading state renders skeleton
  - [x] Test empty state (no accounts) shows appropriate message

- [x] Task 10: Verify build and all tests pass (AC: All)
  - [x] Run `npm run test` and ensure all tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify no console errors in browser

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

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None

### Completion Notes List

- All 10 tasks completed successfully
- All 8 acceptance criteria verified
- 62 new tests added (23 interest calculation + 19 useTrueCost hook + 20 TrueCostCard component)
- Total test suite: 801 tests passing
- Build successful (638KB bundle, advisory on chunk size)
- Interest calculations use big.js per ADR-003
- Card displays in teal with red interest values per UX spec
- High debt burden warning triggers at >20% interest-to-income ratio

### File List

**Created:**
- `src/types/true-cost.ts` - TrueCostMetrics interface
- `src/lib/calculations/interest.ts` - Interest calculation utilities
- `src/hooks/useTrueCost.ts` - True cost metrics hook
- `src/components/dashboard/TrueCostCard.tsx` - Dashboard card component
- `tests/lib/calculations/interest.test.ts` - Interest calculation tests
- `tests/hooks/useTrueCost.test.ts` - Hook tests
- `tests/components/dashboard/TrueCostCard.test.tsx` - Component tests

**Modified:**
- `src/types/index.ts` - Added TrueCostMetrics export
- `src/hooks/index.ts` - Added useTrueCost export
- `src/components/dashboard/index.ts` - Added TrueCostCard export
- `src/pages/DashboardPage.tsx` - Integrated TrueCostCard in third slot

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Story drafted with full context from Epic 3, Story 3.2 learnings, PRD (FR41, FR9-10), Architecture (ADR-003), and UX Spec | SM Agent (Bob) |
| 2025-12-04 | Story context generated and status updated to ready-for-dev | SM Agent (Bob) |
| 2025-12-04 | Story implementation complete - all tasks done, all tests passing, build successful | Dev Agent (Amelia) |
| 2025-12-04 | Senior Developer Review notes appended - APPROVED | Dev Agent (Amelia) |

---

## Senior Developer Review (AI)

### Reviewer
Leith

### Date
2025-12-04

### Outcome
**APPROVE** - All acceptance criteria implemented and verified. All completed tasks confirmed done. No blockers or high-severity issues found.

### Summary
Story 3.3 implements the True Cost of Debt card for the Financial Health Dashboard. The implementation correctly calculates monthly/annual interest charges using big.js for precision, displays values in ZAR format with red styling for truth-telling, and shows a "High debt burden" warning when interest-to-income ratio exceeds 20%. Code quality is excellent, following established patterns from Stories 3.1 and 3.2.

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**LOW Severity:**
- Note: Bundle size at 638KB (advisory continues from Story 3.2)

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC-3.3.1 | True Cost of Debt card visible on Dashboard | IMPLEMENTED | [src/pages/DashboardPage.tsx:10](src/pages/DashboardPage.tsx#L10) - TrueCostCard in grid |
| AC-3.3.2 | Monthly Interest in ZAR format | IMPLEMENTED | [src/components/dashboard/TrueCostCard.tsx:80-82](src/components/dashboard/TrueCostCard.tsx#L80-L82) - formatCurrency(monthlyInterest) |
| AC-3.3.3 | Annual Interest = Monthly × 12 | IMPLEMENTED | [src/hooks/useTrueCost.ts:66](src/hooks/useTrueCost.ts#L66) - annualInterest = monthlyInterest.times(12) |
| AC-3.3.4 | Interest-to-Income Ratio as percentage | IMPLEMENTED | [src/hooks/useTrueCost.ts:76](src/hooks/useTrueCost.ts#L76) - ratio = monthlyInterest.div(monthlyIncome).times(100) |
| AC-3.3.5 | Interest values in red | IMPLEMENTED | [src/components/dashboard/TrueCostCard.tsx:80,88](src/components/dashboard/TrueCostCard.tsx#L80) - text-red-500 class |
| AC-3.3.6 | High debt burden warning at >20% | IMPLEMENTED | [src/hooks/useTrueCost.ts:79](src/hooks/useTrueCost.ts#L79), [src/components/dashboard/TrueCostCard.tsx:100-105](src/components/dashboard/TrueCostCard.tsx#L100-L105) |
| AC-3.3.7 | Teal header (#0d9488) | IMPLEMENTED | [src/components/dashboard/TrueCostCard.tsx:72](src/components/dashboard/TrueCostCard.tsx#L72) - bg-teal-600 |
| AC-3.3.8 | Edge cases handled | IMPLEMENTED | [src/lib/calculations/interest.ts:33-36](src/lib/calculations/interest.ts#L33-L36), [src/hooks/useTrueCost.ts:72-74](src/hooks/useTrueCost.ts#L72-L74) |

**Summary: 8 of 8 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Create TrueCostCard types | [x] | VERIFIED | [src/types/true-cost.ts](src/types/true-cost.ts) exists with TrueCostMetrics interface |
| Task 2: Create interest calculation utilities | [x] | VERIFIED | [src/lib/calculations/interest.ts](src/lib/calculations/interest.ts) - 102 lines, 3 exported functions |
| Task 3: Create useTrueCost hook | [x] | VERIFIED | [src/hooks/useTrueCost.ts](src/hooks/useTrueCost.ts) - 97 lines, all calculations using big.js |
| Task 4: Create TrueCostCard component | [x] | VERIFIED | [src/components/dashboard/TrueCostCard.tsx](src/components/dashboard/TrueCostCard.tsx) - 110 lines with skeleton/empty states |
| Task 5: Update dashboard barrel exports | [x] | VERIFIED | [src/components/dashboard/index.ts:5](src/components/dashboard/index.ts#L5) - export { TrueCostCard } |
| Task 6: Integrate into DashboardPage | [x] | VERIFIED | [src/pages/DashboardPage.tsx:1,10](src/pages/DashboardPage.tsx#L1) - import and render |
| Task 7: Write unit tests for interest calculations | [x] | VERIFIED | [tests/lib/calculations/interest.test.ts](tests/lib/calculations/interest.test.ts) - 23 tests |
| Task 8: Write unit tests for useTrueCost hook | [x] | VERIFIED | [tests/hooks/useTrueCost.test.ts](tests/hooks/useTrueCost.test.ts) - 19 tests |
| Task 9: Write component tests | [x] | VERIFIED | [tests/components/dashboard/TrueCostCard.test.tsx](tests/components/dashboard/TrueCostCard.test.tsx) - 20 tests |
| Task 10: Verify build and all tests pass | [x] | VERIFIED | npm run test:run - 801 tests passing; npm run build - successful |

**Summary: 10 of 10 completed tasks verified, 0 questionable, 0 falsely marked complete**

### Test Coverage and Gaps

- **62 new tests added** for this story (23 interest + 19 hook + 20 component)
- **801 total tests passing**
- All ACs have corresponding tests
- Edge cases covered: zero balance, zero rate, no accounts, no income, mixed account types
- big.js precision verified in tests

### Architectural Alignment

- ✅ Follows hook composition pattern from Story 3.2 (useTrueCost → useAccounts, useFlexiFacility, useFinancialSnapshot)
- ✅ All monetary calculations use big.js per ADR-003
- ✅ Data flows from Dexie via reactive hooks (ADR-005 compliant)
- ✅ Component placed in correct location: src/components/dashboard/
- ✅ Card structure matches UX spec Section 6.1

### Security Notes

- No security concerns - all calculations client-side, no external API calls
- No user input validation needed (data pre-validated in Epic 2)

### Best-Practices and References

- [React Hooks](https://react.dev/reference/react/hooks) - proper useMemo usage
- [big.js](https://github.com/MikeMcl/big.js/) - correct precision handling
- [Tailwind CSS](https://tailwindcss.com/docs) - semantic color classes (text-red-500, bg-teal-600)

### Action Items

**Code Changes Required:**
None - story approved as-is.

**Advisory Notes:**
- Note: Bundle size at 638KB - consider code-splitting when approaching 750KB (carried forward from Story 3.2)
- Note: Pre-existing flaky test in QuickBalanceUpdate.test.tsx unrelated to this story (carried forward)
