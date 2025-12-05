# Story 4.3: Implement Baseline and Traditional Strategies

Status: ready-for-dev

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

- [ ] Task 1: Define StrategyProjection and DebtStrategy types (AC: 4, 6)
  - [ ] Update `src/lib/calculations/types.ts`:
  - [ ] Define `StrategyProjection` interface with all required fields
  - [ ] Define `DebtStrategy` interface with id, name, description, effortLevel, requiresFlexi, calculate(), allocatePayment()
  - [ ] Export types via barrel export

- [ ] Task 2: Implement Baseline Strategy (AC: 1, 4, 5, 6, 8)
  - [ ] Create `src/lib/calculations/strategies/baseline.ts`
  - [ ] Implement `BaselineStrategy` class/object implementing `DebtStrategy`
  - [ ] id: 'baseline', name: 'Baseline (Minimum Payments)', effortLevel: 'low', requiresFlexi: false
  - [ ] `calculate()`: use `generateProjection()` with `createBaselineAllocator()` from Story 4.2
  - [ ] `allocatePayment()`: return empty array (no extra payments)
  - [ ] Build `StrategyProjection` from projection results
  - [ ] Calculate debtFreeMonth, debtFreeDate, totalInterestPaid from projection

- [ ] Task 3: Create strategy helper to build StrategyProjection (AC: 4)
  - [ ] Create `src/lib/calculations/strategies/strategy-helpers.ts`
  - [ ] Implement `buildStrategyProjection(strategy: DebtStrategy, projection: MonthlyProjection[], baseline?: StrategyProjection): StrategyProjection`
  - [ ] Calculate debtFreeMonth from projection length
  - [ ] Calculate debtFreeDate by adding months to snapshot date
  - [ ] Sum totalInterestPaid and totalPrincipalPaid from projection
  - [ ] Calculate monthsSaved and interestSaved vs baseline (0 if no baseline provided)

- [ ] Task 4: Implement Snowball Strategy (AC: 2, 4, 5, 6, 8)
  - [ ] Create `src/lib/calculations/strategies/snowball.ts`
  - [ ] Implement `SnowballStrategy` class/object implementing `DebtStrategy`
  - [ ] id: 'snowball', name: 'Debt Snowball (Smallest First)', effortLevel: 'low', requiresFlexi: false
  - [ ] `allocatePayment()`: sort accounts by balance ascending, allocate all surplus to smallest non-zero balance
  - [ ] `calculate()`: use `generateProjection()` with snowball allocator
  - [ ] Handle "rolling" - when target account paid off, surplus goes to next smallest

- [ ] Task 5: Implement Avalanche Strategy (AC: 3, 4, 5, 6, 8)
  - [ ] Create `src/lib/calculations/strategies/avalanche.ts`
  - [ ] Implement `AvalancheStrategy` class/object implementing `DebtStrategy`
  - [ ] id: 'avalanche', name: 'Debt Avalanche (Highest Rate First)', effortLevel: 'low', requiresFlexi: false
  - [ ] `allocatePayment()`: sort accounts by interestRate descending, allocate all surplus to highest rate non-zero balance
  - [ ] `calculate()`: use `generateProjection()` with avalanche allocator
  - [ ] Handle "rolling" - when target account paid off, surplus goes to next highest rate

- [ ] Task 6: Create strategy registry (AC: 6)
  - [ ] Create `src/lib/calculations/strategies/index.ts`
  - [ ] Export all strategy instances: `baselineStrategy`, `snowballStrategy`, `avalancheStrategy`
  - [ ] Export `getAllStrategies(): DebtStrategy[]` function
  - [ ] Export `getStrategyById(id: string): DebtStrategy | undefined` function

- [ ] Task 7: Write unit tests for Baseline Strategy (AC: 1, 4, 5)
  - [ ] Create `tests/lib/calculations/strategies/baseline.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Applies only minimum payments (no surplus allocation)
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: debtFreeMonth matches projection length
  - [ ] Test: totalInterestPaid matches sum from projection

- [ ] Task 8: Write unit tests for Snowball Strategy (AC: 2, 4, 5, 7)
  - [ ] Create `tests/lib/calculations/strategies/snowball.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Allocates surplus to smallest balance first
  - [ ] Test: When smallest paid off, surplus rolls to next smallest
  - [ ] Test: With 3 accounts, smallest is targeted first regardless of rate
  - [ ] Test: Faster early wins - count months until first account paid off

- [ ] Task 9: Write unit tests for Avalanche Strategy (AC: 3, 4, 5, 7)
  - [ ] Create `tests/lib/calculations/strategies/avalanche.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Allocates surplus to highest rate first
  - [ ] Test: When highest rate paid off, surplus rolls to next highest
  - [ ] Test: With 3 accounts, highest rate is targeted first regardless of balance
  - [ ] Test: Saves more total interest than snowball (key verification)

- [ ] Task 10: Write comparison tests (AC: 7)
  - [ ] Create `tests/lib/calculations/strategies/comparison.test.ts`
  - [ ] Test: Avalanche totalInterestPaid < Snowball totalInterestPaid (for typical portfolio)
  - [ ] Test: Snowball has first account paid off in fewer months than Avalanche (for typical portfolio)
  - [ ] Test: Both strategies beat Baseline in monthsSaved and interestSaved
  - [ ] Use test snapshot from tech spec: home loan R1.5M, car R250k, credit card R50k

- [ ] Task 11: Update barrel exports (AC: all)
  - [ ] Update `src/lib/calculations/index.ts` with strategy exports
  - [ ] Export strategy instances and registry functions
  - [ ] Export DebtStrategy and StrategyProjection types

- [ ] Task 12: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all new tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite
  - [ ] Document any known limitations

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

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec, PRD (FR13-15), Architecture (Strategy Pattern), and Story 4.2 learnings | SM Agent (Bob) |
