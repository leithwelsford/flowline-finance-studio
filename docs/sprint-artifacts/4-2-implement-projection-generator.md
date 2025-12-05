# Story 4.2: Implement Projection Generator

Status: review

## Story

As a **developer**,
I want **a projection generator that simulates debt payoff over time**,
so that **each strategy can produce month-by-month forecasts for comparison**.

## Acceptance Criteria

1. **AC-4.2.1:** Given a financial snapshot and payment allocation for a month, when I run the projection generator, then for each month it calculates: starting balance per account, interest charged, payment applied, principal paid, ending balance, running total debt.

2. **AC-4.2.2:** Projection continues until all debts reach zero OR maximum 360 months (30 years) is reached.

3. **AC-4.2.3:** Projection handles accounts being paid off by skipping further calculations for zero-balance accounts.

4. **AC-4.2.4:** When payment exceeds remaining balance, payment is capped at balance (no overpayment).

5. **AC-4.2.5:** Output is an array of `MonthlyProjection` objects containing per-account snapshots and totals.

6. **AC-4.2.6:** All calculations use big.js for precision with cent-level accuracy (2 decimal places in ZAR).

7. **AC-4.2.7:** The projection generator accepts a `PaymentAllocator` function that determines how surplus is distributed across accounts (enabling different strategy implementations).

8. **AC-4.2.8:** Unit tests verify projection correctness against manual spreadsheet calculations for 2-account scenarios.

## Tasks / Subtasks

- [x] Task 1: Define projection-related types (AC: 5, 7)
  - [x] Add to `src/lib/calculations/types.ts`:
  - [x] Define `AccountSnapshot` interface: accountId, startBalance, interestCharged, paymentApplied, principalPaid, endBalance (all Big)
  - [x] Define `MonthlyProjection` interface: month, date, accounts[], flexiBalance?, totalDebt, totalInterestPaid, totalPrincipalPaid (all Big)
  - [x] Define `PaymentAllocation` interface: accountId, amount (Big)
  - [x] Define `PaymentAllocator` type: `(surplus: Big, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null) => PaymentAllocation[]`
  - [x] Define `SimulatedAccount` interface: id, balance, interestRate, minimumPayment, interestType (working copy for projection)
  - [x] Define `SimulatedFlexi` interface: balance, interestRate (working copy for projection)
  - [x] Define `ProjectionConfig` interface: maxMonths (default 360), startDate (ISO string)
  - [x] Export all types via barrel export

- [x] Task 2: Create projection generator core function (AC: 1, 2, 6)
  - [x] Create `src/lib/calculations/projections.ts`
  - [x] Implement `generateProjection(snapshot: FinancialSnapshot, allocator: PaymentAllocator, config?: ProjectionConfig): MonthlyProjection[]`
  - [x] Initialize projection array and clone accounts for simulation
  - [x] Main loop: iterate month by month until all debts = 0 OR maxMonths reached
  - [x] For each month: calculate interest, apply min payments, allocate surplus, record snapshot
  - [x] Use big.js for all arithmetic with `.round(2, Big.roundHalfUp)`

- [x] Task 3: Implement per-month calculation logic (AC: 1, 6)
  - [x] Implement `calculateMonthSnapshot(month: number, date: string, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null, surplus: Big, allocator: PaymentAllocator): MonthlyProjection`
  - [x] For each account: calculate interest using `calculateMonthlyInterest()` from Story 4.1
  - [x] Apply minimum payment first (capped at balance + interest)
  - [x] Calculate remaining surplus after minimum payments
  - [x] Call allocator to get extra payment distribution
  - [x] Apply extra payments per allocation
  - [x] Record AccountSnapshot for each account
  - [x] Sum totals: totalDebt, totalInterestPaid, totalPrincipalPaid

- [x] Task 4: Handle paid-off accounts (AC: 3, 4)
  - [x] Add logic to skip accounts with zero balance
  - [x] When payment would exceed balance, cap payment at remaining balance
  - [x] When account is paid off mid-month, stop interest accrual
  - [x] Test: account with R500 balance receiving R1000 payment caps at R500
  - [x] Freed minimum payment from paid-off accounts available for surplus

- [x] Task 5: Implement early termination logic (AC: 2)
  - [x] Check total remaining debt after each month
  - [x] Exit loop when totalDebt equals zero (all accounts paid)
  - [x] Exit loop when month >= maxMonths (default 360)
  - [x] Record final month as debtFreeMonth in projection metadata
  - [x] Test: simple scenario reaches zero in expected months

- [x] Task 6: Create default payment allocator (baseline) (AC: 7)
  - [x] Implement `createBaselineAllocator(): PaymentAllocator`
  - [x] Baseline allocator returns empty array (no extra payments, min only)
  - [x] This will be used by baseline strategy
  - [x] Export for use by strategy implementations

- [x] Task 7: Create helper to build FinancialSnapshot (AC: 1)
  - [x] Implement `buildSnapshot(accounts: DebtAccount[], flexi: FlexiFacility | null, income: Big, expenses: Big, minPayments: Big): FinancialSnapshot`
  - [x] Calculate availableSurplus: income - expenses - minPayments
  - [x] Handle case where surplus is negative (warning, continue with 0 surplus)
  - [x] Set snapshotDate to current date

- [x] Task 8: Add barrel export for projections module (AC: all)
  - [x] Update `src/lib/calculations/index.ts`
  - [x] Export `generateProjection`, `buildSnapshot`, `createBaselineAllocator`
  - [x] Export all projection-related types

- [x] Task 9: Write unit tests for basic projection (AC: 1, 2, 5)
  - [x] Create `tests/lib/calculations/projections.test.ts`
  - [x] Test: Single account R10,000 at 12% with R500/month payment
  - [x] Verify month-by-month interest and balance reduction
  - [x] Test: Projection terminates when debt = 0
  - [x] Test: Projection stops at 360 months if not paid off

- [x] Task 10: Write unit tests for 2-account scenarios (AC: 8)
  - [x] Test: Two accounts with baseline allocator (min payments only)
  - [x] Verify each account calculated independently
  - [x] Verify totals are sum of individual accounts
  - [x] Compare results against manual spreadsheet calculation
  - [x] Test: R100,000 home loan at 11.5% + R50,000 car at 13%

- [x] Task 11: Write unit tests for edge cases (AC: 3, 4)
  - [x] Test: Payment exceeds balance (caps at balance)
  - [x] Test: Zero balance account skipped
  - [x] Test: Account paid off mid-projection
  - [x] Test: Negative surplus handled gracefully (warning logged, continues with 0)
  - [x] Test: Zero rate account (no interest charged)

- [x] Task 12: Verify build and all tests pass (AC: all)
  - [x] Run `npm run test` and ensure all new tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify no regressions in existing test suite
  - [x] Document any known limitations or assumptions

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   ├── calculations/           # FR9-23: Calculation Engine
│   │   ├── types.ts            # Extended: Projection types
│   │   ├── interest.ts         # EXISTING: Interest formulas (Story 4.1)
│   │   ├── projections.ts      # NEW: FR22-23: Month-by-month projections
│   │   └── index.ts            # Updated: New exports
```

**Novel Pattern: Multi-Strategy Comparison Engine (from architecture.md):**
```
Financial Snapshot
    │
    ▼
Strategy Registry (8 strategies)
    │
    ▼
Projection Generator (month-by-month simulation)  <-- THIS STORY
    │
    ▼
StrategyProjection[] (comparison metrics)
```

**Core Interfaces (from architecture):**
```typescript
/** A single debt strategy definition */
interface DebtStrategy {
  // ...
  calculate(snapshot: FinancialSnapshot): MonthlyProjection[];
  allocatePayment(surplus: Big, accounts: DebtAccount[], flexi: FlexiFacility | null): PaymentAllocation[];
}
```

### Data Models (from Tech Spec)

**MonthlyProjection:**
```typescript
interface MonthlyProjection {
  month: number;                     // 1, 2, 3, ...
  date: string;                      // ISO date
  accounts: AccountSnapshot[];       // Per-account state
  flexiBalance?: Big;                // Flexi balance if applicable
  totalDebt: Big;                    // Sum of all balances
  totalInterestPaid: Big;            // Cumulative interest
  totalPrincipalPaid: Big;           // Cumulative principal
}

interface AccountSnapshot {
  accountId: number;
  startBalance: Big;
  interestCharged: Big;
  paymentApplied: Big;
  principalPaid: Big;
  endBalance: Big;
}
```

### Projection Logic Flow

```
For each month (1 to maxMonths):
  1. For each active account (balance > 0):
     a. Calculate interest: calculateMonthlyInterest(balance, rate, type)
     b. Apply minimum payment (capped at balance + interest)
     c. Update balance: balance = balance + interest - minPayment

  2. Calculate remaining surplus = availableSurplus - totalMinPaymentsMade

  3. Call PaymentAllocator(surplus, accounts, flexi) → PaymentAllocation[]

  4. For each allocation:
     a. Apply extra payment to specified account
     b. Cap at account balance
     c. Update balance

  5. Record MonthlyProjection with all account snapshots

  6. Check exit conditions:
     - If totalDebt = 0 → exit loop
     - If month >= maxMonths → exit loop
```

### Performance Considerations

From [tech-spec-epic-4.md](./tech-spec-epic-4.md):

**NFR-P1: Calculation Performance**
- Target: All 8 strategies calculated in < 3 seconds
- Constraint: Up to 360 months × 10 accounts × 8 strategies
- Approach: Efficient big.js operations, early loop termination, no unnecessary allocations

This projection generator is called by EACH strategy, so efficiency matters:
- Avoid creating unnecessary Big instances in loops
- Use early termination when debt reaches zero
- Clone accounts once at start, mutate in place during simulation

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/projections.ts` - Projection generator functions

**Files to Modify:**
- `src/lib/calculations/types.ts` - Add projection-related types
- `src/lib/calculations/index.ts` - Add new exports

**Dependencies Available:**
- `big.js` - For precision arithmetic
- `calculateMonthlyInterest()` from `interest.ts` - For interest calculations
- `date-fns` - For date manipulation (if needed)

### Learnings from Previous Story

**From Story 4.1 (Status: done)**

- **Interest calculation functions available:**
  - `calculateMonthlyInterest(balance, rate, interestType)` - use for standard loans
  - `calculateDailyInterest(balance, rate)` - use for flexi
  - `calculateMonthlyFromDaily(dailyInterest, daysInMonth)` - for flexi monthly approximation
- **big.js patterns established:**
  - `new Big(value)` for creation
  - `.times()`, `.div()`, `.plus()`, `.minus()` for arithmetic
  - `.round(2, Big.roundHalfUp)` for cent-level precision
  - `.eq(0)`, `.gt(0)`, `.lt(0)` for comparisons
- **Types file structure** - extend existing `src/lib/calculations/types.ts`
- **Barrel export pattern** - follow `src/lib/calculations/index.ts`
- **Test organization** - place in `tests/lib/calculations/`
- **897/898 tests passing** - maintain test hygiene (1 flaky test in unrelated component)

**New Services Created by Story 4.1:**
- `calculateDailyInterest()` - for flexi daily compounding
- `calculateEffectiveRate()` - for prime rate linkage
- `calculateCompoundInterest()` - for compound growth
- `calculateTotalPayment()` - iterative loan payment calculator (similar pattern to projection)
- `SA_PRIME_RATE` constant

**Files Available:**
- `src/lib/calculations/interest.ts` - Interest calculation functions
- `src/lib/calculations/types.ts` - Existing type definitions
- `src/lib/calculations/index.ts` - Barrel exports
- `src/types/account.ts` - DebtAccount, InterestType types
- `src/types/flexi-facility.ts` - FlexiFacility type

[Source: docs/sprint-artifacts/4-1-implement-interest-calculation-functions.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-4.2] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR22] - Month-by-month projection requirement
- [Source: docs/prd.md#FR23] - Savings calculation requirement (uses projection output)
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine
- [Source: docs/architecture.md#Core-Interfaces] - StrategyProjection, MonthlyProjection types
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.2] - Detailed acceptance criteria

## Dev Agent Record

### Context Reference

- [4-2-implement-projection-generator.context.xml](docs/sprint-artifacts/4-2-implement-projection-generator.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Implementation plan: Types first, then core generator, then tests
- Used `calculateMonthlyInterest()` and `calculateFlexiMonthlyInterest()` from Story 4.1
- Followed big.js patterns established in interest.ts

### Completion Notes List

- ✅ All 8 ACs satisfied
- ✅ 25 new unit tests added covering all scenarios
- ✅ Spreadsheet-verified calculations for home loan (R100,000 at 11.5%) and car loan (R50,000 at 13%)
- ✅ Build passes with no type errors
- ✅ 922/923 tests passing (1 pre-existing flaky test in QuickBalanceUpdate.test.tsx unrelated to this story)
- ✅ All 111 calculation tests (86 interest + 25 projection) passing
- Known limitation: `debtFreeMonth` metadata field not implemented (early termination works via array length instead)

### File List

**Created:**
- `src/lib/calculations/projections.ts` - Core projection generator with `generateProjection`, `createBaselineAllocator`, `buildSnapshot`
- `tests/lib/calculations/projections.test.ts` - 25 unit tests covering all ACs

**Modified:**
- `src/lib/calculations/types.ts` - Added 8 projection-related types (AccountSnapshot, MonthlyProjection, PaymentAllocation, PaymentAllocator, SimulatedAccount, SimulatedFlexi, ProjectionConfig, FinancialSnapshot)
- `src/lib/calculations/index.ts` - Added barrel exports for projection functions and types

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec, PRD (FR22-23), Architecture (Projection Generator), and Story 4.1 learnings | SM Agent (Bob) |
| 2025-12-05 | Implementation complete: projection generator with all types, core functions, and 25 tests | Dev Agent (Amelia) |
