# Story 4.6: Implement Hybrid Strategies

Status: ready-for-dev

## Story

As a **user**,
I want **hybrid strategies that combine flexi optimization with traditional debt targeting methods**,
so that **I have more options to compare and can see whether combining flexi chunking with snowball (smallest balance first) or avalanche (highest rate first) targeting delivers better results than either approach alone**.

## Acceptance Criteria

1. **AC-4.6.1:** Given my financial data with a flexi facility, when I calculate the **Hybrid Flexi-Snowball Strategy** (FR19), then it combines flexi chunking methodology (use flexi for lump sums) with snowball target selection (smallest balance first).

2. **AC-4.6.2:** Given my financial data with a flexi facility, when I calculate the **Hybrid Flexi-Avalanche Strategy** (FR20), then it combines flexi chunking methodology with avalanche target selection (highest rate first).

3. **AC-4.6.3:** Both hybrid strategies park surplus in the flexi facility during the month, then chunk to the target debt account based on their respective targeting logic (snowball: smallest balance, avalanche: highest rate).

4. **AC-4.6.4:** When the target debt account is paid off, both strategies roll the freed-up payment amount to the next account according to their targeting logic.

5. **AC-4.6.5:** Both hybrid strategies have effort level = 'medium' (more complex than traditional methods, but simpler than velocity banking).

6. **AC-4.6.6:** Given no flexi facility exists in the financial snapshot, when either hybrid strategy is calculated, then it returns `null` (not an error, just not applicable) with requiresFlexi = true.

7. **AC-4.6.7:** Both strategies return a complete `StrategyProjection` with all required fields: strategyId, strategyName, effortLevel, debtFreeMonth, debtFreeDate, totalInterestPaid, totalPrincipalPaid, monthsSaved, interestSaved, monthlyProjections[].

8. **AC-4.6.8:** Both strategies implement the `DebtStrategy` interface with `calculate()` and `allocatePayment()` methods, following the Strategy Pattern (ADR-004).

9. **AC-4.6.9:** All calculations use big.js for precision with cent-level accuracy (2 decimal places in ZAR).

10. **AC-4.6.10:** Unit tests verify that hybrid strategies correctly combine flexi chunking mechanics with their respective targeting methods.

11. **AC-4.6.11:** Comparison tests verify hybrid strategies perform differently from pure flexi-chunking (which uses avalanche by default) and show expected behavior: hybrid-avalanche should save more interest, hybrid-snowball should have faster psychological "wins".

## Tasks / Subtasks

- [ ] Task 1: Implement Hybrid Flexi-Snowball Strategy (AC: 1, 3, 4, 5, 6, 7, 8, 9)
  - [ ] Create `src/lib/calculations/strategies/hybrid-snowball.ts`
  - [ ] Implement `hybridSnowballStrategy` object implementing `DebtStrategy`
  - [ ] id: 'hybrid-flexi-snowball', name: 'Hybrid Flexi-Snowball', effortLevel: 'medium', requiresFlexi: true
  - [ ] `allocatePayment()`: Park surplus in flexi, then chunk to smallest balance first
  - [ ] Reuse sorting logic: sort accounts by balance ascending (smallest first)
  - [ ] Roll payment to next smallest debt when one is paid off
  - [ ] `calculate()`: Use `generateProjection()` with snowball-targeting allocator

- [ ] Task 2: Implement Hybrid Flexi-Avalanche Strategy (AC: 2, 3, 4, 5, 6, 7, 8, 9)
  - [ ] Create `src/lib/calculations/strategies/hybrid-avalanche.ts`
  - [ ] Implement `hybridAvalancheStrategy` object implementing `DebtStrategy`
  - [ ] id: 'hybrid-flexi-avalanche', name: 'Hybrid Flexi-Avalanche', effortLevel: 'medium', requiresFlexi: true
  - [ ] `allocatePayment()`: Park surplus in flexi, then chunk to highest rate first
  - [ ] Reuse sorting logic from avalanche.ts or strategy-helpers.ts
  - [ ] Roll payment to next highest-rate debt when one is paid off
  - [ ] `calculate()`: Use `generateProjection()` with avalanche-targeting allocator

- [ ] Task 3: Handle flexi facility absence gracefully (AC: 6)
  - [ ] Check if `snapshot.flexiFacility` is null at start of `calculate()` for both strategies
  - [ ] If null, return `null` (not an error, just not applicable)
  - [ ] Ensure orchestrator handles null returns correctly (already does from previous stories)

- [ ] Task 4: Update strategy registry (AC: 8)
  - [ ] Update `src/lib/calculations/strategies/index.ts`
  - [ ] Export `hybridSnowballStrategy` and `hybridAvalancheStrategy`
  - [ ] Update `getAllStrategies()` to include both new strategies
  - [ ] Update `getStrategyById()` to find both new strategies

- [ ] Task 5: Write unit tests for Hybrid Flexi-Snowball Strategy (AC: 1, 3, 4, 5, 6, 7, 8, 9, 10)
  - [ ] Create `tests/lib/calculations/strategies/hybrid-snowball.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Returns null when no flexi facility (AC-4.6.6)
  - [ ] Test: Targets smallest balance first (snowball targeting)
  - [ ] Test: Parks surplus in flexi, then chunks to target
  - [ ] Test: Rolls payment to next smallest when debt paid off
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: Uses big.js for all calculations (precision check)

- [ ] Task 6: Write unit tests for Hybrid Flexi-Avalanche Strategy (AC: 2, 3, 4, 5, 6, 7, 8, 9, 10)
  - [ ] Create `tests/lib/calculations/strategies/hybrid-avalanche.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Returns null when no flexi facility (AC-4.6.6)
  - [ ] Test: Targets highest interest rate first (avalanche targeting)
  - [ ] Test: Parks surplus in flexi, then chunks to target
  - [ ] Test: Rolls payment to next highest-rate when debt paid off
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: Uses big.js for all calculations (precision check)

- [ ] Task 7: Write comparison tests (AC: 11)
  - [ ] Add to `tests/lib/calculations/strategies/flexi-comparison.test.ts` or create new comparison file
  - [ ] Test: Hybrid-avalanche saves more interest than hybrid-snowball (expected behavior)
  - [ ] Test: Hybrid-snowball pays off smallest debt faster than hybrid-avalanche (psychological wins)
  - [ ] Test: Both hybrid strategies differ from pure flexi-chunking in targeting behavior
  - [ ] Test: Compare all flexi strategies (flexi-chunking, aggressive-flexi, velocity-banking, hybrid-snowball, hybrid-avalanche)
  - [ ] Use test snapshot with flexi facility and multiple debts of varying sizes/rates

- [ ] Task 8: Update barrel exports (AC: all)
  - [ ] Update `src/lib/calculations/index.ts` with hybrid strategy exports
  - [ ] Ensure strategies and types are exported

- [ ] Task 9: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all new tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite (1100+ tests from Story 4.5)
  - [ ] Document any known limitations or edge cases in Completion Notes

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
│   │       ├── index.ts        # MODIFY: Add hybrid strategies
│   │       ├── baseline.ts     # EXISTING: Story 4.3
│   │       ├── snowball.ts     # EXISTING: Story 4.3 (reuse sorting logic)
│   │       ├── avalanche.ts    # EXISTING: Story 4.3 (reuse sorting logic)
│   │       ├── flexi-chunking.ts     # EXISTING: Story 4.4 (reuse flexi chunking logic)
│   │       ├── aggressive-flexi.ts   # EXISTING: Story 4.4
│   │       ├── velocity-banking.ts   # EXISTING: Story 4.5
│   │       ├── strategy-helpers.ts   # EXISTING: Shared helper functions
│   │       ├── hybrid-snowball.ts    # NEW: FR19
│   │       └── hybrid-avalanche.ts   # NEW: FR20
```

**Strategy Pattern (ADR-004):**
```typescript
interface DebtStrategy {
  id: string;
  name: string;
  description: string;
  effortLevel: 'low' | 'medium' | 'high';
  requiresFlexi: boolean;  // TRUE for both hybrid strategies

  calculate(snapshot: FinancialSnapshot, config?: StrategyConfig): StrategyProjection | null;
  allocatePayment(surplus: Big, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null): PaymentAllocation[];
}
```

### Hybrid Strategy Logic

**Core Concept:** Combine the flexi facility's daily interest advantage with different debt targeting approaches.

```
Hybrid Flexi-Snowball:
- Flexi Chunking mechanics (park surplus in flexi, benefit from daily interest)
- Snowball targeting (pay smallest balance first for psychological wins)
- Best for: Users who need motivation from seeing debts disappear quickly

Hybrid Flexi-Avalanche:
- Flexi Chunking mechanics (park surplus in flexi, benefit from daily interest)
- Avalanche targeting (pay highest rate first for maximum interest savings)
- Best for: Users who want optimal mathematical outcome with flexi benefits
- Note: This should be very similar to flexi-chunking (which already uses avalanche)
```

**Key Difference from Pure Strategies:**
- Pure Snowball/Avalanche: Extra payments go directly to target debt
- Hybrid Strategies: Surplus parks in flexi first (earning daily interest benefit), then chunks to target

**Effort Level: MEDIUM**
- More complex than traditional snowball/avalanche (requires flexi management)
- Simpler than velocity banking (doesn't require routing ALL income through flexi)
- Just requires periodic chunking + maintaining flexi facility

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/strategies/hybrid-snowball.ts`
- `src/lib/calculations/strategies/hybrid-avalanche.ts`
- `tests/lib/calculations/strategies/hybrid-snowball.test.ts`
- `tests/lib/calculations/strategies/hybrid-avalanche.test.ts`

**Files to Modify:**
- `src/lib/calculations/strategies/index.ts` - Add both hybrid strategies to registry
- `src/lib/calculations/index.ts` - Add hybrid strategy exports
- `tests/lib/calculations/strategies/flexi-comparison.test.ts` - Add comparison tests
- `tests/lib/calculations/strategies/comparison.test.ts` - Update strategy count from 6 to 8

### Learnings from Previous Story

**From Story 4.5 (Status: done)**

- **Strategy Pattern Implementation:** All strategies implement `DebtStrategy` interface with `calculate()` and `allocatePayment()` methods.

- **Available Helper Functions (use these, don't recreate):**
  - `generateProjection(snapshot, allocator, config)` - main projection function
  - `buildStrategyProjection(strategy, projection, baseline)` - builds StrategyProjection with metrics
  - `sortBySmallestBalance()` - may exist in strategy-helpers.ts or snowball.ts (check)
  - `sortByHighestRate()` - may exist in strategy-helpers.ts or avalanche.ts (check)

- **Null Return Pattern:**
  - All flexi strategies return `null` when `snapshot.flexiFacility` is null
  - DebtStrategy.calculate() return type is `StrategyProjection | null`
  - Orchestrator filters out null results

- **Files Created by Story 4.5:**
  - `src/lib/calculations/strategies/velocity-banking.ts` - 173 lines
  - Tests with 39 test cases

- **Test Status from Story 4.5:**
  - 1100+ tests passing
  - Build succeeds (641KB bundle, acceptable for MVP)
  - 6 strategies in registry (baseline, snowball, avalanche, flexi-chunking, aggressive-flexi, velocity-banking)
  - After this story: 8 strategies total

- **Key Implementation Insight:**
  - Flexi-chunking already uses avalanche targeting (highest rate first)
  - Hybrid-avalanche will be very similar to flexi-chunking
  - The difference is conceptual/naming - making explicit the combination
  - Hybrid-snowball is the truly novel combination (flexi + snowball targeting)

[Source: docs/sprint-artifacts/4-5-implement-velocity-banking-strategy.md#Dev-Agent-Record]

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

**Expected Hybrid Strategy Behavior:**

**Hybrid Flexi-Snowball:**
1. Park R18,000 surplus in flexi (reduces flexi balance, earns daily interest benefit)
2. Chunk to Credit Card (R50,000) - smallest balance first!
3. Even though Credit Card has 20% rate, snowball prioritizes it by size (smallest)
4. When Credit Card paid off, roll to Car (R250,000 - next smallest)
5. Finally Home Loan (R1,500,000 - largest)

**Hybrid Flexi-Avalanche:**
1. Park R18,000 surplus in flexi (reduces flexi balance, earns daily interest benefit)
2. Chunk to Credit Card (20% rate) - highest rate first!
3. This matches default flexi-chunking behavior
4. When Credit Card paid off, roll to Car (13% rate - next highest)
5. Finally Home Loan (11.5% rate - lowest)

**Key Comparison Test Case:**
- With this snapshot, Credit Card is both smallest (R50k) AND highest rate (20%)
- So both strategies will target it first - need different test data to show difference
- Use test data where smallest balance ≠ highest rate to demonstrate targeting difference

### References

- [Source: docs/epics.md#Story-4.6] - Original story definition
- [Source: docs/prd.md#FR19] - Hybrid Flexi-Snowball: "System calculates 'Hybrid Flexi-Snowball Strategy' combining flexi optimization with smallest debt targeting"
- [Source: docs/prd.md#FR20] - Hybrid Flexi-Avalanche: "System calculates 'Hybrid Flexi-Avalanche Strategy' combining flexi optimization with highest interest targeting"
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine
- [Source: docs/architecture.md#Core-Interfaces] - DebtStrategy interface
- [Source: docs/architecture.md#ADR-004] - Strategy Pattern for Calculation Engine
- [Source: docs/architecture.md#ADR-003] - big.js for Financial Calculations
- [Source: docs/sprint-artifacts/4-5-implement-velocity-banking-strategy.md#Dev-Agent-Record] - Previous story learnings

## Dev Agent Record

### Context Reference

- [4-6-implement-hybrid-strategies.context.xml](docs/sprint-artifacts/4-6-implement-hybrid-strategies.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec (FR19, FR20), PRD, Architecture (Strategy Pattern ADR-004), and Story 4.5 learnings | SM Agent (Bob) |
| 2025-12-05 | Story context generated, status updated to ready-for-dev | SM Agent (Bob) |
