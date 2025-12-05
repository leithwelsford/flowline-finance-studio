# Story 4.4: Implement Flexi Chunking Strategies

Status: ready-for-dev

## Story

As a **user**,
I want **flexi chunking and aggressive flexi strategies calculated**,
so that **I can see how leveraging my flexi facility for lump sum payments or income parking affects my debt payoff timeline compared to traditional methods**.

## Acceptance Criteria

1. **AC-4.4.1:** Given my financial data including a flexi facility, when I calculate the **Flexi Chunking Strategy**, then it models regular lump sum deposits from the flexi facility to the highest-rate debt account, with the flexi being repaid from income over subsequent months.

2. **AC-4.4.2:** Given my financial data with a flexi facility, when I calculate the **Aggressive Flexi Strategy**, then it models maximum deposits to the flexi facility with minimum withdrawals (only for required expenses), using daily interest savings to accelerate debt payoff.

3. **AC-4.4.3:** Both strategies correctly model flexi daily interest compounding versus standard loan monthly interest compounding, capturing the interest arbitrage opportunity.

4. **AC-4.4.4:** Given no flexi facility exists in the financial snapshot, when either flexi-based strategy is calculated, then it returns `null` or a "Not applicable - requires flexi facility" result (not an error).

5. **AC-4.4.5:** Effort levels are assigned: Flexi Chunking = 'medium', Aggressive Flexi = 'high'.

6. **AC-4.4.6:** Each strategy returns a `StrategyProjection` with all required fields: strategyId, strategyName, effortLevel, debtFreeMonth, debtFreeDate, totalInterestPaid, totalPrincipalPaid, monthsSaved, interestSaved, monthlyProjections[].

7. **AC-4.4.7:** Both strategies implement the `DebtStrategy` interface with `calculate()` and `allocatePayment()` methods, following the Strategy Pattern (ADR-004).

8. **AC-4.4.8:** All calculations use big.js for precision with cent-level accuracy (2 decimal places in ZAR).

9. **AC-4.4.9:** Unit tests verify that both strategies perform better than baseline and traditional strategies when a flexi facility is available with favorable rate differential.

## Tasks / Subtasks

- [ ] Task 1: Implement Flexi Chunking Strategy (AC: 1, 3, 5, 6, 7, 8)
  - [ ] Create `src/lib/calculations/strategies/flexi-chunking.ts`
  - [ ] Implement `FlexiChunkingStrategy` object implementing `DebtStrategy`
  - [ ] id: 'flexi-chunking', name: 'Flexi Chunking', effortLevel: 'medium', requiresFlexi: true
  - [ ] Model "chunk and repay" cycle:
    - [ ] Each month, transfer chunk amount from flexi to highest-rate debt
    - [ ] Flexi balance increases by chunk amount
    - [ ] Apply flexi daily interest to flexi balance
    - [ ] Apply surplus to repay flexi over following months
    - [ ] When flexi repaid, make next chunk transfer
  - [ ] `allocatePayment()`: allocate surplus to repay flexi first, then chunk to highest-rate debt
  - [ ] `calculate()`: use `generateProjection()` with flexi-chunking allocator

- [ ] Task 2: Implement Aggressive Flexi Strategy (AC: 2, 3, 5, 6, 7, 8)
  - [ ] Create `src/lib/calculations/strategies/aggressive-flexi.ts`
  - [ ] Implement `AggressiveFlexiStrategy` object implementing `DebtStrategy`
  - [ ] id: 'aggressive-flexi', name: 'Aggressive Flexi', effortLevel: 'high', requiresFlexi: true
  - [ ] Model maximum flexi utilization:
    - [ ] Deposit full surplus to flexi each month
    - [ ] Withdraw only minimum necessary for expenses (already accounted in availableSurplus)
    - [ ] Make larger periodic lump sums to target debt using flexi credit
    - [ ] Benefit from daily interest on lower average flexi balance
  - [ ] `allocatePayment()`: maximize flexi deposits, periodic large debt payments
  - [ ] `calculate()`: use `generateProjection()` with aggressive-flexi allocator

- [ ] Task 3: Handle flexi facility absence gracefully (AC: 4)
  - [ ] In both strategies, check if `snapshot.flexiFacility` is null at start of `calculate()`
  - [ ] If null, return `null` (not an error, just not applicable)
  - [ ] Ensure orchestrator handles null returns correctly (filters them out)

- [ ] Task 4: Implement flexi interest calculation integration (AC: 3)
  - [ ] Use `calculateDailyInterest()` from Story 4.1 for flexi facility
  - [ ] Calculate monthly flexi interest as daily × daysInMonth (use 30 for simplicity)
  - [ ] Ensure flexi balance tracking includes interest accrual
  - [ ] Model the interest differential: flexi daily vs debt monthly compounding

- [ ] Task 5: Update strategy registry (AC: 7)
  - [ ] Update `src/lib/calculations/strategies/index.ts`
  - [ ] Export `flexiChunkingStrategy`, `aggressiveFlexiStrategy`
  - [ ] Update `getAllStrategies()` to include new strategies
  - [ ] Update `getStrategyById()` to find new strategies

- [ ] Task 6: Write unit tests for Flexi Chunking Strategy (AC: 1, 3, 4, 5, 6, 9)
  - [ ] Create `tests/lib/calculations/strategies/flexi-chunking.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Returns null when no flexi facility
  - [ ] Test: Models chunk transfer from flexi to debt
  - [ ] Test: Flexi balance increases after chunk, decreases as repaid
  - [ ] Test: Flexi interest calculated using daily rate
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: Outperforms baseline when flexi rate < debt rate

- [ ] Task 7: Write unit tests for Aggressive Flexi Strategy (AC: 2, 3, 4, 5, 6, 9)
  - [ ] Create `tests/lib/calculations/strategies/aggressive-flexi.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Returns null when no flexi facility
  - [ ] Test: Models maximum deposit pattern
  - [ ] Test: Makes larger periodic lump sum payments
  - [ ] Test: Flexi interest calculated using daily rate
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: Outperforms flexi chunking when surplus is high and rate differential favorable

- [ ] Task 8: Write comparison tests (AC: 9)
  - [ ] Create or extend `tests/lib/calculations/strategies/flexi-comparison.test.ts`
  - [ ] Test: Both flexi strategies beat baseline with favorable rate differential
  - [ ] Test: Aggressive flexi saves more interest than flexi chunking (typical scenario)
  - [ ] Test: Flexi strategies return null without flexi, traditional strategies still work
  - [ ] Use test snapshot from tech spec with flexi facility added

- [ ] Task 9: Update barrel exports (AC: all)
  - [ ] Update `src/lib/calculations/index.ts` with flexi strategy exports
  - [ ] Ensure both strategies and their types are exported

- [ ] Task 10: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all new tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite (980+ tests)
  - [ ] Document any known limitations or edge cases

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   ├── calculations/
│   │   ├── types.ts            # EXISTING: DebtStrategy, StrategyProjection
│   │   ├── interest.ts         # EXISTING: Interest formulas (Story 4.1)
│   │   ├── projections.ts      # EXISTING: Projection generator (Story 4.2)
│   │   └── strategies/
│   │       ├── index.ts        # MODIFY: Add flexi strategies
│   │       ├── baseline.ts     # EXISTING: Story 4.3
│   │       ├── snowball.ts     # EXISTING: Story 4.3
│   │       ├── avalanche.ts    # EXISTING: Story 4.3
│   │       ├── flexi-chunking.ts     # NEW: FR16
│   │       └── aggressive-flexi.ts   # NEW: FR17
```

**Strategy Pattern (ADR-004):**
```typescript
interface DebtStrategy {
  id: string;
  name: string;
  description: string;
  effortLevel: 'low' | 'medium' | 'high';
  requiresFlexi: boolean;  // TRUE for both flexi strategies

  calculate(snapshot: FinancialSnapshot, config?: StrategyConfig): StrategyProjection | null;
  allocatePayment(surplus: Big, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null): PaymentAllocation[];
}
```

### Flexi Strategy Logic

**Flexi Chunking Strategy (FR16):**
```
Core Concept: Use flexi facility as a "batching account" for lump sum debt payments

Cycle:
1. Accumulate surplus in flexi (reducing flexi balance)
2. When accumulated enough (e.g., monthly surplus), make lump sum to target debt
3. Flexi balance increases by chunk amount
4. Continue making minimum payments + interest on flexi
5. Repeat cycle

Interest Arbitrage:
- Flexi daily interest: (balance × rate / 365) × days
- Debt monthly interest: balance × (rate / 12)
- If flexi rate < debt rate, net interest savings

Effort: Medium (requires tracking flexi balance, timing chunks)
```

**Aggressive Flexi Strategy (FR17):**
```
Core Concept: Maximize time money spends in lower-rate flexi vs higher-rate debt

Pattern:
1. All surplus deposited to flexi immediately (lowers flexi balance)
2. Income deposited to flexi on payday
3. Expenses drawn from flexi throughout month
4. Net effect: lower average daily balance = less interest
5. Periodically transfer large lump sums to target debt

Key Insight:
- Daily interest calculated on actual daily balance
- Lower average balance = lower total interest
- More aggressive than chunking because income itself sits in flexi

Effort: High (requires all money flow through flexi, active management)
```

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/strategies/flexi-chunking.ts`
- `src/lib/calculations/strategies/aggressive-flexi.ts`
- `tests/lib/calculations/strategies/flexi-chunking.test.ts`
- `tests/lib/calculations/strategies/aggressive-flexi.test.ts`
- `tests/lib/calculations/strategies/flexi-comparison.test.ts`

**Files to Modify:**
- `src/lib/calculations/strategies/index.ts` - Add flexi strategies to registry

### Learnings from Previous Story

**From Story 4.3 (Status: done)**

- **Strategy Pattern Implementation:**
  - All strategies implement `DebtStrategy` interface
  - `calculate()` uses `generateProjection()` with custom allocator
  - `buildStrategyProjection()` helper in `strategy-helpers.ts` for building result

- **Available Helper Functions:**
  - `generateProjection(snapshot, allocator, config)` - main projection function
  - `buildStrategyProjection(strategy, projection, baseline)` - builds result with comparison metrics
  - `createBaselineAllocator()` - returns empty allocation

- **Test Patterns:**
  - Organize tests in `tests/lib/calculations/strategies/` directory
  - Use describe blocks referencing ACs
  - Test both positive scenarios and edge cases (null flexi)
  - Comparison tests verify relative performance

- **Build Status from Story 4.3:**
  - 980 tests passing
  - Build chunk size warning (641KB) - acceptable for MVP

- **Key Files Created by Story 4.3:**
  - `src/lib/calculations/strategies/baseline.ts`
  - `src/lib/calculations/strategies/snowball.ts`
  - `src/lib/calculations/strategies/avalanche.ts`
  - `src/lib/calculations/strategies/strategy-helpers.ts`
  - `src/lib/calculations/strategies/index.ts`

[Source: docs/sprint-artifacts/4-3-implement-baseline-and-traditional-strategies.md#Dev-Agent-Record]

### Test Snapshot (from Tech Spec)

```typescript
const testSnapshotWithFlexi: FinancialSnapshot = {
  accounts: [
    { id: 1, name: 'Home Loan', balance: '1500000', rate: '0.115', minPayment: '15000', type: 'home_loan', interestType: 'monthly' },
    { id: 2, name: 'Car', balance: '250000', rate: '0.13', minPayment: '5500', type: 'vehicle_finance', interestType: 'monthly' },
    { id: 3, name: 'Credit Card', balance: '50000', rate: '0.20', minPayment: '1500', type: 'credit_card', interestType: 'monthly' },
  ],
  flexiFacility: {
    id: 1,
    name: 'FNB Flexi Option',
    type: 'fnb_flexi',
    creditLimit: '500000',
    currentBalance: '100000',  // Currently owe R100k on flexi
    interestRate: '0.1375',    // Prime + 2% (prime at 11.75%)
  },
  monthlyIncome: new Big('85000'),
  monthlyExpenses: new Big('45000'),
  availableSurplus: new Big('18000'), // 85000 - 45000 - 22000 min payments
  snapshotDate: '2025-12-05'
};
```

**Expected Strategy Behaviors with Test Snapshot:**

| Strategy | Flexi Required | Target Logic | Expected Result |
|----------|----------------|--------------|-----------------|
| Flexi Chunking | Yes | Chunk to highest-rate (Credit Card 20%) | Beats baseline via rate arbitrage |
| Aggressive Flexi | Yes | Max deposit, large lump sums to Credit Card | Best interest savings with flexi |

**Interest Rate Differential:**
- Flexi rate: 13.75%
- Credit Card rate: 20%
- Arbitrage opportunity: 6.25% rate differential on chunked amounts

### References

- [Source: docs/epics.md#Story-4.4] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR16] - Flexi Chunking Strategy requirement
- [Source: docs/prd.md#FR17] - Aggressive Flexi Strategy requirement
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine
- [Source: docs/architecture.md#Core-Interfaces] - DebtStrategy interface
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.4] - Detailed acceptance criteria
- [Source: docs/sprint-artifacts/4-3-implement-baseline-and-traditional-strategies.md] - Previous story learnings

## Dev Agent Record

### Context Reference

- [4-4-implement-flexi-chunking-strategies.context.xml](docs/sprint-artifacts/4-4-implement-flexi-chunking-strategies.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec, PRD (FR16-17), Architecture (Strategy Pattern), and Story 4.3 learnings | SM Agent (Bob) |
