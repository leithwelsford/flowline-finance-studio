# Story 4.3: Implement Baseline and Traditional Strategies

Status: review

## Story

As a **user**,
I want **baseline, snowball, and avalanche strategies calculated**,
so that **I can compare traditional debt payoff methods against each other and use them as comparison points for advanced strategies**.

## Acceptance Criteria

1. **AC-4.3.1:** Given my financial data, when I calculate the **Baseline Strategy**, then it projects paying only minimum payments on all accounts with no extra payments applied—showing the "do nothing extra" scenario.

2. **AC-4.3.2:** Given my financial data with surplus, when I calculate the **Debt Snowball Strategy**, then it applies surplus to the smallest balance first, and when that debt is paid off, rolls the payment to the next smallest balance, continuing until all debt is paid.

3. **AC-4.3.3:** Given my financial data with surplus, when I calculate the **Debt Avalanche Strategy**, then it applies surplus to the highest interest rate first, and when that debt is paid off, rolls the payment to the next highest rate, continuing until all debt is paid.

4. **AC-4.3.4:** Each strategy returns a `StrategyProjection` with all required fields: strategyId, strategyName, effortLevel, debtFreeMonth, debtFreeDate, totalInterestPaid, totalPrincipalPaid, monthsSaved, interestSaved, monthlyProjections[].

5. **AC-4.3.5:** Effort levels are assigned: Baseline = 'low', Snowball = 'low', Avalanche = 'low'.

6. **AC-4.3.6:** All strategies implement the `DebtStrategy` interface with `calculate()` and `allocatePayment()` methods.

7. **AC-4.3.7:** Unit tests verify that Avalanche saves more interest than Snowball, and Snowball has faster early "wins" (more accounts paid off sooner).

8. **AC-4.3.8:** All calculations use big.js for precision with cent-level accuracy (2 decimal places in ZAR).

## Tasks / Subtasks

- [x] Task 1: Define StrategyProjection and DebtStrategy types (AC: 4, 6)
  - [x] Update `src/lib/calculations/types.ts`:
  - [x] Define `StrategyProjection` interface with all required fields
  - [x] Define `DebtStrategy` interface with id, name, description, effortLevel, requiresFlexi, calculate(), allocatePayment()
  - [x] Export types via barrel export

- [x] Task 2: Implement Baseline Strategy (AC: 1, 4, 5, 6, 8)
  - [x] Create `src/lib/calculations/strategies/baseline.ts`
  - [x] Implement `BaselineStrategy` class/object implementing `DebtStrategy`
  - [x] id: 'baseline', name: 'Baseline (Minimum Payments)', effortLevel: 'low', requiresFlexi: false
  - [x] `calculate()`: use `generateProjection()` with `createBaselineAllocator()` from Story 4.2
  - [x] `allocatePayment()`: return empty array (no extra payments)
  - [x] Build `StrategyProjection` from projection results
  - [x] Calculate debtFreeMonth, debtFreeDate, totalInterestPaid from projection

- [x] Task 3: Create strategy helper to build StrategyProjection (AC: 4)
  - [x] Create `src/lib/calculations/strategies/strategy-helpers.ts`
  - [x] Implement `buildStrategyProjection(strategy: DebtStrategy, projection: MonthlyProjection[], baseline?: StrategyProjection): StrategyProjection`
  - [x] Calculate debtFreeMonth from projection length
  - [x] Calculate debtFreeDate by adding months to snapshot date
  - [x] Sum totalInterestPaid and totalPrincipalPaid from projection
  - [x] Calculate monthsSaved and interestSaved vs baseline (0 if no baseline provided)

- [x] Task 4: Implement Snowball Strategy (AC: 2, 4, 5, 6, 8)
  - [x] Create `src/lib/calculations/strategies/snowball.ts`
  - [x] Implement `SnowballStrategy` class/object implementing `DebtStrategy`
  - [x] id: 'snowball', name: 'Debt Snowball (Smallest First)', effortLevel: 'low', requiresFlexi: false
  - [x] `allocatePayment()`: sort accounts by balance ascending, allocate all surplus to smallest non-zero balance
  - [x] `calculate()`: use `generateProjection()` with snowball allocator
  - [x] Handle "rolling" - when target account paid off, surplus goes to next smallest

- [x] Task 5: Implement Avalanche Strategy (AC: 3, 4, 5, 6, 8)
  - [x] Create `src/lib/calculations/strategies/avalanche.ts`
  - [x] Implement `AvalancheStrategy` class/object implementing `DebtStrategy`
  - [x] id: 'avalanche', name: 'Debt Avalanche (Highest Rate First)', effortLevel: 'low', requiresFlexi: false
  - [x] `allocatePayment()`: sort accounts by interestRate descending, allocate all surplus to highest rate non-zero balance
  - [x] `calculate()`: use `generateProjection()` with avalanche allocator
  - [x] Handle "rolling" - when target account paid off, surplus goes to next highest rate

- [x] Task 6: Create strategy registry (AC: 6)
  - [x] Create `src/lib/calculations/strategies/index.ts`
  - [x] Export all strategy instances: `baselineStrategy`, `snowballStrategy`, `avalancheStrategy`
  - [x] Export `getAllStrategies(): DebtStrategy[]` function
  - [x] Export `getStrategyById(id: string): DebtStrategy | undefined` function

- [x] Task 7: Write unit tests for Baseline Strategy (AC: 1, 4, 5)
  - [x] Create `tests/lib/calculations/strategies/baseline.test.ts`
  - [x] Test: Returns correct strategyId, name, effortLevel
  - [x] Test: Applies only minimum payments (no surplus allocation)
  - [x] Test: StrategyProjection has all required fields
  - [x] Test: debtFreeMonth matches projection length
  - [x] Test: totalInterestPaid matches sum from projection

- [x] Task 8: Write unit tests for Snowball Strategy (AC: 2, 4, 5, 7)
  - [x] Create `tests/lib/calculations/strategies/snowball.test.ts`
  - [x] Test: Returns correct strategyId, name, effortLevel
  - [x] Test: Allocates surplus to smallest balance first
  - [x] Test: When smallest paid off, surplus rolls to next smallest
  - [x] Test: With 3 accounts, smallest is targeted first regardless of rate
  - [x] Test: Faster early wins - count months until first account paid off

- [x] Task 9: Write unit tests for Avalanche Strategy (AC: 3, 4, 5, 7)
  - [x] Create `tests/lib/calculations/strategies/avalanche.test.ts`
  - [x] Test: Returns correct strategyId, name, effortLevel
  - [x] Test: Allocates surplus to highest rate first
  - [x] Test: When highest rate paid off, surplus rolls to next highest
  - [x] Test: With 3 accounts, highest rate is targeted first regardless of balance
  - [x] Test: Saves more total interest than snowball (key verification)

- [x] Task 10: Write comparison tests (AC: 7)
  - [x] Create `tests/lib/calculations/strategies/comparison.test.ts`
  - [x] Test: Avalanche totalInterestPaid < Snowball totalInterestPaid (for typical portfolio)
  - [x] Test: Snowball has first account paid off in fewer months than Avalanche (for typical portfolio)
  - [x] Test: Both strategies beat Baseline in monthsSaved and interestSaved
  - [x] Use test snapshot from tech spec: home loan R1.5M, car R250k, credit card R50k

- [x] Task 11: Update barrel exports (AC: all)
  - [x] Update `src/lib/calculations/index.ts` with strategy exports
  - [x] Export strategy instances and registry functions
  - [x] Export DebtStrategy and StrategyProjection types

- [x] Task 12: Verify build and all tests pass (AC: all)
  - [x] Run `npm run test` and ensure all new tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify no regressions in existing test suite
  - [x] Document any known limitations

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   ├── calculations/
│   │   ├── types.ts            # Extended: DebtStrategy, StrategyProjection
│   │   ├── interest.ts         # EXISTING: Interest formulas (Story 4.1)
│   │   ├── projections.ts      # EXISTING: Projection generator (Story 4.2)
│   │   └── strategies/
│   │       ├── index.ts        # NEW: Strategy registry
│   │       ├── baseline.ts     # NEW: FR13 - Minimum payments
│   │       ├── snowball.ts     # NEW: FR14 - Smallest balance first
│   │       └── avalanche.ts    # NEW: FR15 - Highest rate first
```

**Strategy Pattern (ADR-004):**
```typescript
interface DebtStrategy {
  id: string;
  name: string;
  description: string;
  effortLevel: 'low' | 'medium' | 'high';
  requiresFlexi: boolean;

  calculate(snapshot: FinancialSnapshot, config?: StrategyConfig): StrategyProjection;
  allocatePayment(surplus: Big, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null): PaymentAllocation[];
}
```

### Data Models (from Tech Spec)

**StrategyProjection:**
```typescript
interface StrategyProjection {
  strategyId: string;
  strategyName: string;
  effortLevel: 'low' | 'medium' | 'high';
  debtFreeMonth: number;             // Month number when debt-free
  debtFreeDate: string;              // ISO date
  totalInterestPaid: Big;            // Total interest over payoff period
  totalPrincipalPaid: Big;           // Should equal initial debt
  monthsSaved: number;               // vs baseline
  interestSaved: Big;                // vs baseline
  monthlyProjections: MonthlyProjection[];
}
```

### Strategy Logic

**Baseline Strategy:**
```
Payment Allocation: None (minimum payments only)
Target Selection: N/A
Effort: Low (do nothing extra)
Purpose: Comparison baseline for all other strategies
```

**Snowball Strategy:**
```
Payment Allocation: All surplus to single target account
Target Selection: Smallest balance first (psychological wins)
Rolling: When target = 0, add its min payment to surplus, target next smallest
Effort: Low (simple rule, easy to follow)
Purpose: Quick wins build motivation
```

**Avalanche Strategy:**
```
Payment Allocation: All surplus to single target account
Target Selection: Highest interest rate first (mathematical optimum)
Rolling: When target = 0, add its min payment to surplus, target next highest rate
Effort: Low (simple rule, easy to follow)
Purpose: Minimize total interest paid
```

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/strategies/baseline.ts`
- `src/lib/calculations/strategies/snowball.ts`
- `src/lib/calculations/strategies/avalanche.ts`
- `src/lib/calculations/strategies/strategy-helpers.ts`
- `src/lib/calculations/strategies/index.ts`
- `tests/lib/calculations/strategies/baseline.test.ts`
- `tests/lib/calculations/strategies/snowball.test.ts`
- `tests/lib/calculations/strategies/avalanche.test.ts`
- `tests/lib/calculations/strategies/comparison.test.ts`

**Files to Modify:**
- `src/lib/calculations/types.ts` - Add DebtStrategy and StrategyProjection types
- `src/lib/calculations/index.ts` - Add strategy exports

### Learnings from Previous Story

**From Story 4.2 (Status: done)**

- **Projection Generator Available:**
  - `generateProjection(snapshot, allocator, config)` - main projection function
  - `createBaselineAllocator()` - returns empty allocation (use for baseline)
  - `buildSnapshot(accounts, flexi, income, expenses, minPayments)` - creates FinancialSnapshot

- **Types Available:**
  - `MonthlyProjection` - single month in projection
  - `AccountSnapshot` - per-account state in a month
  - `PaymentAllocator` - function type `(surplus, accounts, flexi) => PaymentAllocation[]`
  - `PaymentAllocation` - `{ accountId, amount }`
  - `SimulatedAccount` - working copy for projection
  - `SimulatedFlexi` - working copy for flexi
  - `ProjectionConfig` - `{ maxMonths, startDate }`
  - `FinancialSnapshot` - input to projection

- **big.js Patterns:**
  - `new Big(value)` for creation
  - `.times()`, `.div()`, `.plus()`, `.minus()` for arithmetic
  - `.round(2, Big.roundHalfUp)` for cent-level precision
  - `.eq(0)`, `.gt(0)`, `.lt(0)` for comparisons
  - `.cmp()` for sorting

- **Test Patterns:**
  - Organize tests in `tests/lib/calculations/` directory
  - Use describe blocks referencing ACs
  - Spreadsheet-verified calculations for validation

- **Key Functions to Reuse:**
  - `generateProjection()` - call with custom allocator for each strategy
  - `createBaselineAllocator()` - use directly for baseline strategy
  - `calculateMonthlyInterest()` - if needed for manual calculations

**Files Created by Story 4.2:**
- `src/lib/calculations/projections.ts` - Projection generator
- `src/lib/calculations/types.ts` - Extended with projection types
- `src/lib/calculations/index.ts` - Updated exports

**Build Status:**
- 922/923 tests passing (1 pre-existing flaky test unrelated to calculation engine)
- All 111 calculation tests (86 interest + 25 projection) passing

[Source: docs/sprint-artifacts/4-2-implement-projection-generator.md#Dev-Agent-Record]

### Test Snapshot (from Tech Spec)

```typescript
const testSnapshot: FinancialSnapshot = {
  accounts: [
    { id: 1, name: 'Home Loan', balance: '1500000', rate: '0.115', minPayment: '15000', type: 'home_loan', interestType: 'monthly' },
    { id: 2, name: 'Car', balance: '250000', rate: '0.13', minPayment: '5500', type: 'vehicle_finance', interestType: 'monthly' },
    { id: 3, name: 'Credit Card', balance: '50000', rate: '0.20', minPayment: '1500', type: 'credit_card', interestType: 'monthly' },
  ],
  flexiFacility: null,  // No flexi for traditional strategies
  monthlyIncome: new Big('85000'),
  monthlyExpenses: new Big('45000'),
  availableSurplus: new Big('18000'), // 85000 - 45000 - 22000 min payments
  snapshotDate: '2025-12-05'
};
```

**Expected Strategy Behaviors with Test Snapshot:**

| Strategy | Target Order | Expected Result |
|----------|--------------|-----------------|
| Baseline | N/A | Longest payoff, highest interest |
| Snowball | Credit Card → Car → Home Loan | Faster early wins |
| Avalanche | Credit Card → Car → Home Loan | Lowest total interest |

Note: In this test case, Snowball and Avalanche have the same target order because the Credit Card has both smallest balance AND highest rate. Create additional test with different rate/balance ordering to verify distinct behaviors.

### References

- [Source: docs/epics.md#Story-4.3] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR13] - Baseline strategy requirement
- [Source: docs/prd.md#FR14] - Debt Snowball requirement
- [Source: docs/prd.md#FR15] - Debt Avalanche requirement
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine
- [Source: docs/architecture.md#Core-Interfaces] - DebtStrategy interface
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.3] - Detailed acceptance criteria

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/4-3-implement-baseline-and-traditional-strategies.context.xml](docs/sprint-artifacts/4-3-implement-baseline-and-traditional-strategies.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Task 1: Added EffortLevel, StrategyConfig, StrategyProjection, DebtStrategy types to types.ts
- Task 3: Created strategy-helpers.ts with buildStrategyProjection helper before strategies (dependency)
- Task 2,4,5: Implemented strategies using Strategy Pattern, each with calculate() and allocatePayment()
- Task 10: Tech spec snapshot has credit card with both smallest balance AND highest rate, so snowball/avalanche target same account. Added separate test with different target ordering to verify distinct behaviors.

### Completion Notes List

- All 3 strategies (baseline, snowball, avalanche) implemented following ADR-004 Strategy Pattern
- 57 new tests across 4 test files, all passing
- 980 total tests passing, no regressions
- Strategies reuse generateProjection() from Story 4.2 with custom allocators
- Avalanche saves R2,353.98 more interest than Snowball (with different target ordering scenario)
- Known: Tech spec snapshot has credit card as both smallest balance and highest rate, so strategies produce identical results for that specific case

### File List

**Created:**
- src/lib/calculations/strategies/strategy-helpers.ts
- src/lib/calculations/strategies/baseline.ts
- src/lib/calculations/strategies/snowball.ts
- src/lib/calculations/strategies/avalanche.ts
- src/lib/calculations/strategies/index.ts
- tests/lib/calculations/strategies/baseline.test.ts
- tests/lib/calculations/strategies/snowball.test.ts
- tests/lib/calculations/strategies/avalanche.test.ts
- tests/lib/calculations/strategies/comparison.test.ts

**Modified:**
- src/lib/calculations/types.ts (added strategy types)
- src/lib/calculations/index.ts (added strategy exports)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec, PRD (FR13-15), Architecture (Strategy Pattern), and Story 4.2 learnings | SM Agent (Bob) |
| 2025-12-05 | Implementation complete: baseline, snowball, avalanche strategies with 57 tests (980 total passing) | Dev Agent (Amelia) |
