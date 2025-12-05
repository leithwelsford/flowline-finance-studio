# Story 4.5: Implement Velocity Banking Strategy (SA Adaptation)

Status: drafted

## Story

As a **user**,
I want **the velocity banking strategy calculated for my financial data**,
so that **I can see if the SA velocity banking approach—using my flexi facility as a primary income parking account—delivers better results than traditional or simpler flexi strategies**.

## Acceptance Criteria

1. **AC-4.5.1:** Given my financial data with a flexi facility, when I calculate the **Velocity Banking Strategy**, then it models income deposited directly to the flexi facility (reducing flexi balance on payday).

2. **AC-4.5.2:** The strategy models all expenses paid from the flexi facility throughout the month, with the net effect being (income - expenses) reducing the average daily flexi balance.

3. **AC-4.5.3:** Periodic chunks are transferred from the flexi facility to the target debt (highest interest rate first), following the avalanche targeting logic.

4. **AC-4.5.4:** The projection shows month-by-month flexi balance fluctuation, capturing the "income parking" effect where money spends more time in the lower-rate flexi versus higher-rate debt accounts.

5. **AC-4.5.5:** Flexi interest is calculated using daily compounding formula (`balance × rate / 365 × days`), benefiting from the lower average daily balance throughout the month.

6. **AC-4.5.6:** Given no flexi facility exists in the financial snapshot, when velocity banking is calculated, then it returns `null` (not an error, just not applicable) with requiresFlexi = true.

7. **AC-4.5.7:** The strategy has effort level = 'high' (requires active management, all money flow through flexi).

8. **AC-4.5.8:** The strategy returns a `StrategyProjection` with all required fields: strategyId ('velocity-banking'), strategyName ('Velocity Banking'), effortLevel ('high'), debtFreeMonth, debtFreeDate, totalInterestPaid, totalPrincipalPaid, monthsSaved, interestSaved, monthlyProjections[].

9. **AC-4.5.9:** The strategy implements the `DebtStrategy` interface with `calculate()` and `allocatePayment()` methods, following the Strategy Pattern (ADR-004).

10. **AC-4.5.10:** All calculations use big.js for precision with cent-level accuracy (2 decimal places in ZAR).

11. **AC-4.5.11:** Unit tests verify that velocity banking performs better than flexi chunking strategies when the rate differential is favorable and surplus is consistent.

## Tasks / Subtasks

- [ ] Task 1: Implement Velocity Banking Strategy (AC: 1, 2, 3, 4, 5, 7, 8, 9, 10)
  - [ ] Create `src/lib/calculations/strategies/velocity-banking.ts`
  - [ ] Implement `VelocityBankingStrategy` object implementing `DebtStrategy`
  - [ ] id: 'velocity-banking', name: 'Velocity Banking', effortLevel: 'high', requiresFlexi: true
  - [ ] Model the "income parking" cycle:
    - [ ] Income deposited to flexi on payday (reduces flexi balance/increases available credit)
    - [ ] Expenses drawn from flexi throughout month (increases flexi balance)
    - [ ] Net effect: (income - expenses) = surplus reduces average daily balance
    - [ ] Daily interest calculated on lower average balance = less interest
    - [ ] Periodic chunks transferred to target debt (avalanche targeting)
  - [ ] `allocatePayment()`: Park surplus in flexi, periodically chunk to highest-rate debt
  - [ ] `calculate()`: Use `generateProjection()` with velocity-banking allocator

- [ ] Task 2: Model intra-month flexi balance fluctuation (AC: 4, 5)
  - [ ] Track flexi balance changes within each month:
    - [ ] Start of month: previous month's ending flexi balance
    - [ ] Payday: flexi balance reduces by income amount
    - [ ] Throughout month: flexi balance increases as expenses are drawn
    - [ ] End of month: calculate daily interest on average balance
  - [ ] For MVP simplification: model average daily balance as (startBalance + endBalance) / 2
  - [ ] Apply daily interest formula: `avgBalance × rate / 365 × 30`
  - [ ] Document simplification and note future enhancement opportunity

- [ ] Task 3: Handle flexi facility absence gracefully (AC: 6)
  - [ ] Check if `snapshot.flexiFacility` is null at start of `calculate()`
  - [ ] If null, return `null` (not an error, just not applicable)
  - [ ] Ensure orchestrator handles null returns correctly (filters them out)

- [ ] Task 4: Implement avalanche targeting for chunk allocation (AC: 3)
  - [ ] When surplus accumulates in flexi, transfer chunk to highest-rate debt
  - [ ] Chunk timing: monthly (align with existing projection generator)
  - [ ] Reuse avalanche sorting logic from `avalanche.ts` or `strategy-helpers.ts`
  - [ ] Roll payment to next highest-rate debt when one is paid off

- [ ] Task 5: Update strategy registry (AC: 9)
  - [ ] Update `src/lib/calculations/strategies/index.ts`
  - [ ] Export `velocityBankingStrategy`
  - [ ] Update `getAllStrategies()` to include new strategy
  - [ ] Update `getStrategyById()` to find new strategy

- [ ] Task 6: Write unit tests for Velocity Banking Strategy (AC: 1-11)
  - [ ] Create `tests/lib/calculations/strategies/velocity-banking.test.ts`
  - [ ] Test: Returns correct strategyId, name, effortLevel
  - [ ] Test: Returns null when no flexi facility (AC-4.5.6)
  - [ ] Test: Models income deposit reducing flexi balance
  - [ ] Test: Models expenses increasing flexi balance
  - [ ] Test: Net surplus reduces average daily balance
  - [ ] Test: Flexi interest calculated using daily rate on average balance
  - [ ] Test: Periodic chunks transferred to highest-rate debt
  - [ ] Test: StrategyProjection has all required fields
  - [ ] Test: Uses big.js for all calculations (precision check)

- [ ] Task 7: Write comparison tests (AC: 11)
  - [ ] Add to `tests/lib/calculations/strategies/flexi-comparison.test.ts` or create new comparison file
  - [ ] Test: Velocity banking beats baseline with favorable rate differential
  - [ ] Test: Velocity banking outperforms flexi chunking in typical scenarios
  - [ ] Test: Compare interest savings across all flexi strategies
  - [ ] Use test snapshot with flexi facility from tech spec

- [ ] Task 8: Update barrel exports (AC: all)
  - [ ] Update `src/lib/calculations/index.ts` with velocity banking export
  - [ ] Ensure strategy and types are exported

- [ ] Task 9: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all new tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite (1050+ tests from Story 4.4)
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
│   │       ├── index.ts        # MODIFY: Add velocity banking strategy
│   │       ├── baseline.ts     # EXISTING: Story 4.3
│   │       ├── snowball.ts     # EXISTING: Story 4.3
│   │       ├── avalanche.ts    # EXISTING: Story 4.3
│   │       ├── flexi-chunking.ts     # EXISTING: Story 4.4
│   │       ├── aggressive-flexi.ts   # EXISTING: Story 4.4
│   │       ├── strategy-helpers.ts   # EXISTING: Shared helper functions
│   │       └── velocity-banking.ts   # NEW: FR18
```

**Strategy Pattern (ADR-004):**
```typescript
interface DebtStrategy {
  id: string;
  name: string;
  description: string;
  effortLevel: 'low' | 'medium' | 'high';
  requiresFlexi: boolean;  // TRUE for velocity banking

  calculate(snapshot: FinancialSnapshot, config?: StrategyConfig): StrategyProjection | null;
  allocatePayment(surplus: Big, accounts: SimulatedAccount[], flexi: SimulatedFlexi | null): PaymentAllocation[];
}
```

### Velocity Banking Strategy Logic

**Core Concept:** Use flexi facility as the **primary account** for all cash flow, not just lump sum transfers.

```
Traditional Banking:
Salary → Bank Account → Pay Bills → What's left goes to savings/debt

Velocity Banking (SA Adaptation):
Salary → Flexi Facility → Pay Bills from Flexi → Lower average daily balance → Less interest

Key Insight:
- Flexi uses DAILY interest on ACTUAL daily balance
- If income sits in flexi for even a few days, it offsets balance
- Less interest on flexi means more money for debt chunks
```

**Monthly Cycle Model:**

```
Day 1 (Payday):    Flexi Balance = Previous - Income
                   (Income reduces what we owe on flexi)

Days 2-30:         Expenses drawn from flexi
                   (Balance gradually increases as we spend)

Day 30:            Flexi Balance = (Previous - Income) + Expenses
                   Net change = -(Income - Expenses) = -Surplus

Average Balance:   Lower than if surplus was transferred at end of month
Daily Interest:    Calculated on lower average = less interest
```

**Interest Arbitrage:**
- Flexi rate: ~13.75% (prime + 2%)
- Debt rates: 11.5% - 20%
- Key: Money spends MORE TIME in flexi (lowering flexi interest) before chunking to debt

**Effort Level: HIGH**
- Requires routing all income through flexi
- All expenses paid from flexi
- Continuous management of flexi account
- More complex than flexi chunking (which just does periodic lump sums)

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/strategies/velocity-banking.ts`
- `tests/lib/calculations/strategies/velocity-banking.test.ts`

**Files to Modify:**
- `src/lib/calculations/strategies/index.ts` - Add velocity banking to registry
- `src/lib/calculations/index.ts` - Add velocity banking export
- Potentially `tests/lib/calculations/strategies/flexi-comparison.test.ts` - Add comparison tests

### Learnings from Previous Story

**From Story 4.4 (Status: done)**

- **Strategy Pattern Implementation:**
  - All strategies implement `DebtStrategy` interface
  - `calculate()` uses `generateProjection()` with custom allocator
  - `buildStrategyProjection()` helper in `strategy-helpers.ts` builds result with comparison metrics

- **Available Helper Functions (use these, don't recreate):**
  - `generateProjection(snapshot, allocator, config)` - main projection function
  - `buildStrategyProjection(strategy, projection, baseline)` - builds StrategyProjection with metrics
  - `calculateFlexiMonthlyInterest()` from `interest.ts` - flexi interest calculation
  - `sortByHighestRate()` - avalanche sorting (check if exists or replicate from avalanche.ts)

- **Null Return Pattern:**
  - All flexi strategies return `null` when `snapshot.flexiFacility` is null
  - DebtStrategy.calculate() return type is `StrategyProjection | null`
  - Orchestrator filters out null results

- **Files Created by Story 4.4:**
  - `src/lib/calculations/strategies/flexi-chunking.ts` - 152 lines
  - `src/lib/calculations/strategies/aggressive-flexi.ts` - 156 lines
  - Tests with 35 test cases each

- **Test Status from Story 4.4:**
  - 1050 tests passing
  - Build succeeds (641KB bundle, acceptable for MVP)
  - 6 strategies in registry (baseline, snowball, avalanche, flexi-chunking, aggressive-flexi + this will be 6th)

- **Known Patterns:**
  - Both flexi chunking and aggressive flexi use avalanche targeting (highest rate first)
  - Effort differentiation captured via effortLevel property
  - Interest arbitrage benefit captured by daily vs monthly compounding difference

[Source: docs/sprint-artifacts/4-4-implement-flexi-chunking-strategies.md#Dev-Agent-Record]

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

**Expected Velocity Banking Behavior:**
1. Income (R85,000) deposited to flexi → flexi balance temporarily reduces by R85k
2. Expenses (R45,000) drawn throughout month → flexi balance increases by R45k
3. Min payments (R22,000) made to debts → flexi balance increases by R22k
4. Net: flexi balance = 100,000 - 85,000 + 45,000 + 22,000 = R82,000 (after min payments)
5. Chunk R18,000 surplus to Credit Card (highest rate 20%)
6. Daily interest on lower average flexi balance < interest if just did end-of-month chunk

### MVP Simplification

For this story, use a simplified average balance model:
- `avgFlexiBalance = (startOfMonthBalance + endOfMonthBalance) / 2`
- This captures the core "income parking" benefit without intra-day tracking
- Future enhancement: Track actual daily balances if validation shows significant variance

[Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.5]

### References

- [Source: docs/epics.md#Story-4.5] - Original story definition
- [Source: docs/prd.md#FR18] - Velocity Banking Strategy requirement: "System calculates 'Velocity Banking Strategy' projection using flexi facility as primary account (SA adaptation)"
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine
- [Source: docs/architecture.md#Core-Interfaces] - DebtStrategy interface
- [Source: docs/architecture.md#ADR-004] - Strategy Pattern for Calculation Engine
- [Source: docs/architecture.md#ADR-003] - big.js for Financial Calculations
- [Source: docs/sprint-artifacts/tech-spec-epic-4.md#Story-4.5] - Detailed acceptance criteria
- [Source: docs/sprint-artifacts/4-4-implement-flexi-chunking-strategies.md#Dev-Agent-Record] - Previous story learnings

## Dev Agent Record

### Context Reference

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 tech spec (FR18), PRD, Architecture (Strategy Pattern ADR-004), and Story 4.4 learnings | SM Agent (Bob) |
