# Story 4.8: Create Strategy Calculation Orchestrator

Status: review

## Story

As a **user**,
I want **all debt reduction strategies calculated from my current financial data with a single action**,
so that **I can compare all 8 strategies side-by-side without manually triggering each calculation, and understand which approach saves the most interest and time**.

## Acceptance Criteria

1. **AC-4.8.1:** A `calculateAllStrategies()` function creates a `FinancialSnapshot` from the current Dexie database state (accounts, flexiFacility, income, expenses) and runs all 8 strategies.

2. **AC-4.8.2:** The orchestrator calculates the baseline strategy first, then uses that result to compute `monthsSaved` and `interestSaved` metrics for all other strategies.

3. **AC-4.8.3:** All 8 strategies (baseline, snowball, avalanche, flexi-chunking, aggressive-flexi, velocity-banking, hybrid-snowball, hybrid-avalanche) are executed and results collected.

4. **AC-4.8.4:** Strategies that require a flexi facility return `null` gracefully when no flexi facility exists, and these nulls are filtered from the comparison results.

5. **AC-4.8.5:** Calculation completes in under 3 seconds for typical scenarios (5-10 accounts, 360 months max projection) per NFR-P1.

6. **AC-4.8.6:** A `calculationStore` (Zustand) stores calculation results:
   - `results: StrategyProjection[]` - array of calculated projections
   - `baseline: StrategyProjection | null` - the baseline for comparison
   - `isCalculating: boolean` - loading state
   - `lastCalculated: string | null` - ISO timestamp of last calculation
   - `error: string | null` - error message if calculation failed

7. **AC-4.8.7:** A `useStrategies()` hook provides React components access to:
   - `strategies` - array of calculated strategy projections
   - `baseline` - the baseline projection
   - `isCalculating` - loading state
   - `calculateStrategies()` - trigger recalculation
   - `bestStrategy` - the strategy with highest interest savings (excluding baseline)

8. **AC-4.8.8:** User configuration from `useStrategyConfig` hook is passed to all strategy calculations, respecting chunk amount, payment frequency, and target account overrides.

9. **AC-4.8.9:** While calculation is running, UI shows a loading state (skeleton loaders or spinner indicator).

10. **AC-4.8.10:** Results are sorted by interest saved (highest savings first) by default in the store.

11. **AC-4.8.11:** Unit tests verify:
    - Orchestrator creates correct FinancialSnapshot from DB
    - Baseline calculated first and used for comparison metrics
    - All 8 strategies receive correct parameters
    - Null strategies filtered correctly
    - Results sorted by interest saved
    - Loading state management works correctly

12. **AC-4.8.12:** If there are no accounts or accounts have zero total balance, orchestrator returns empty results with appropriate message (not an error).

## Tasks / Subtasks

- [x] Task 1: Create calculationStore (Zustand) (AC: 6)
  - [x] Create `src/store/calculationStore.ts`
  - [x] Define state: `results`, `baseline`, `isCalculating`, `lastCalculated`, `error`
  - [x] Implement actions: `setResults()`, `setBaseline()`, `setCalculating()`, `setError()`, `clearResults()`
  - [x] Export from `src/store/index.ts`

- [x] Task 2: Create FinancialSnapshot builder (AC: 1)
  - [x] Create `src/lib/calculations/snapshot.ts`
  - [x] Implement `buildFinancialSnapshot(accounts, flexiFacility, income, expenses)` function
  - [x] Calculate `availableSurplus` = income - expenses - sum(minimumPayments)
  - [x] Use big.js for all calculations
  - [x] Return properly typed `FinancialSnapshot` object

- [x] Task 3: Create strategy calculation orchestrator (AC: 1, 2, 3, 4, 8)
  - [x] Create `src/lib/calculations/engine.ts`
  - [x] Import all strategies from `strategies/index.ts`
  - [x] Implement `calculateAllStrategies(snapshot, config?)`:
    - Calculate baseline first
    - Loop through all strategies, passing baseline for comparison metrics
    - Filter null results (flexi strategies without flexi)
    - Return array of `StrategyProjection`
  - [x] Pass user config to all strategy calculate() calls
  - [x] Handle edge case: no accounts or zero balance (return empty array)

- [x] Task 4: Create useStrategies hook (AC: 7, 9)
  - [x] Create `src/hooks/useStrategies.ts`
  - [x] Use `useLiveQuery` for accounts, flexiFacility, income, expenses
  - [x] Use `useStrategyConfig` for user configuration
  - [x] Implement `calculateStrategies()` that:
    - Sets isCalculating = true
    - Builds snapshot from current data
    - Calls orchestrator
    - Stores results in calculationStore
    - Sets isCalculating = false
  - [x] Compute `bestStrategy` as strategy with highest `interestSaved`
  - [x] Return `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`

- [x] Task 5: Implement results sorting (AC: 10)
  - [x] Sort results by `interestSaved` descending (highest savings first)
  - [x] Baseline always included but may be last (zero savings)
  - [x] Sorting happens in orchestrator before returning

- [x] Task 6: Add loading state indicator component (AC: 9)
  - [x] Create `src/components/strategies/CalculationLoading.tsx`
  - [x] Use shadcn/ui Skeleton for loading states
  - [x] Show "Calculating strategies..." message
  - [x] Animate with subtle pulse

- [x] Task 7: Write unit tests for orchestrator (AC: 11, 5)
  - [x] Create `tests/lib/calculations/engine.test.ts`
  - [x] Test: Snapshot built correctly from data
  - [x] Test: Baseline calculated first
  - [x] Test: All 8 strategies invoked
  - [x] Test: Null strategies filtered (flexi without flexi facility)
  - [x] Test: Results sorted by interest saved
  - [x] Test: Empty results when no accounts
  - [x] Test: Performance < 3 seconds for typical scenario

- [x] Task 8: Write unit tests for useStrategies hook (AC: 11)
  - [x] Create `tests/hooks/useStrategies.test.ts`
  - [x] Test: Loading state management
  - [x] Test: bestStrategy computed correctly
  - [x] Test: calculateStrategies triggers full calculation

- [x] Task 9: Integration test with real data flow (AC: 1-12)
  - [x] Test: Full flow from DB data to calculated results
  - [x] Test: Config passed through correctly
  - [x] Test: Store updated with results

- [x] Task 10: Update barrel exports (AC: all)
  - [x] Update `src/lib/calculations/index.ts` with engine exports
  - [x] Update `src/store/index.ts` with calculationStore
  - [x] Update `src/hooks/index.ts` with useStrategies

- [x] Task 11: Verify build and all tests pass (AC: all)
  - [x] Run `npm run test` and ensure all tests pass
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify performance target (< 3 seconds)

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   └── calculations/
│       ├── engine.ts             # NEW: Main orchestrator (FR23)
│       ├── snapshot.ts           # NEW: FinancialSnapshot builder
│       └── strategies/
│           └── index.ts          # EXISTS: Strategy registry (already has getAllStrategies)
├── store/
│   ├── calculationStore.ts       # NEW: Calculation results store
│   └── index.ts                  # MODIFY: Export calculationStore
├── hooks/
│   ├── useStrategies.ts          # NEW: Strategy calculation hook
│   └── index.ts                  # MODIFY: Export useStrategies
└── components/
    └── strategies/
        └── CalculationLoading.tsx # NEW: Loading indicator
```

**Key Pattern from Architecture (Novel Pattern: Multi-Strategy Comparison Engine):**
```
┌─────────────────────────────────────────────────────────────────┐
│                     CALCULATION ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────────────────────────────┐ │
│  │   Input      │     │         Strategy Registry            │ │
│  │   Snapshot   │────▶│  All 8 strategies executed           │ │
│  └──────────────┘     └──────────────────────────────────────┘ │
│                                    │                            │
│                                    ▼                            │
│                       ┌──────────────────────────────────────┐ │
│                       │      Comparison Aggregator           │ │
│                       │  - Debt-free date                    │ │
│                       │  - Total interest paid               │ │
│                       │  - Savings vs baseline               │ │
│                       │  - Effort rating                     │ │
│                       └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Orchestrator Flow

```typescript
// src/lib/calculations/engine.ts

export async function calculateAllStrategies(
  snapshot: FinancialSnapshot,
  config?: StrategyConfig
): Promise<StrategyProjection[]> {
  // Step 1: Get all strategies from registry
  const allStrategies = getAllStrategies();

  // Step 2: Calculate baseline first (needed for comparison metrics)
  const baseline = baselineStrategy.calculate(snapshot, config);
  if (!baseline) {
    return []; // No accounts or zero balance
  }

  // Step 3: Calculate all other strategies with baseline for comparison
  const results: StrategyProjection[] = [baseline];

  for (const strategy of allStrategies) {
    if (strategy.id === 'baseline') continue; // Already calculated

    const result = strategy.calculate(snapshot, config, baseline);
    if (result !== null) {
      results.push(result);
    }
  }

  // Step 4: Sort by interest saved (highest first)
  results.sort((a, b) => {
    // Baseline has 0 savings, should be last
    const aSaved = a.interestSaved.toNumber();
    const bSaved = b.interestSaved.toNumber();
    return bSaved - aSaved;
  });

  return results;
}
```

### FinancialSnapshot Builder

```typescript
// src/lib/calculations/snapshot.ts

export function buildFinancialSnapshot(
  accounts: DebtAccount[],
  flexiFacility: FlexiFacility | null,
  incomeEntries: IncomeEntry[],
  expenseEntries: ExpenseEntry[]
): FinancialSnapshot {
  const Big = require('big.js');

  // Sum income
  const monthlyIncome = incomeEntries.reduce(
    (sum, entry) => sum.plus(entry.amount),
    Big(0)
  );

  // Sum expenses
  const monthlyExpenses = expenseEntries.reduce(
    (sum, entry) => sum.plus(entry.amount),
    Big(0)
  );

  // Sum minimum payments
  const totalMinPayments = accounts.reduce(
    (sum, acct) => sum.plus(acct.minimumPayment),
    Big(0)
  );

  // Calculate surplus
  const availableSurplus = monthlyIncome.minus(monthlyExpenses).minus(totalMinPayments);

  return {
    accounts: accounts.map(a => ({
      id: a.id!,
      balance: a.balance,
      interestRate: a.interestRate,
      minimumPayment: a.minimumPayment,
      interestType: a.interestType
    })),
    flexiFacility: flexiFacility ? {
      currentBalance: flexiFacility.currentBalance,
      interestRate: flexiFacility.interestRate
    } : null,
    monthlyIncome: monthlyIncome.toString(),
    monthlyExpenses: monthlyExpenses.toString(),
    availableSurplus: availableSurplus.toString(),
    snapshotDate: new Date().toISOString()
  };
}
```

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/engine.ts` - Main orchestrator
- `src/lib/calculations/snapshot.ts` - FinancialSnapshot builder
- `src/store/calculationStore.ts` - Zustand store for results
- `src/hooks/useStrategies.ts` - React hook for strategy access
- `src/components/strategies/CalculationLoading.tsx` - Loading indicator
- `tests/lib/calculations/engine.test.ts` - Orchestrator tests
- `tests/hooks/useStrategies.test.ts` - Hook tests

**Files to Modify:**
- `src/lib/calculations/index.ts` - Export engine functions
- `src/store/index.ts` - Export calculationStore
- `src/hooks/index.ts` - Export useStrategies

### Learnings from Previous Story

**From Story 4.7 (Status: done)**

- **Test Results:** 1251 tests passing
- **Build:** Succeeds (641KB bundle)
- **Strategy Registry:** 8 strategies total via `getAllStrategies()` function already exists in `src/lib/calculations/strategies/index.ts`

- **Available Infrastructure:**
  - `getAllStrategies()` - Returns all 8 strategy implementations
  - `getStrategyById(id)` - Find specific strategy
  - `buildStrategyProjection()` - Builds projection with comparison metrics
  - All strategies implement `DebtStrategy` interface with `calculate(snapshot, config, baseline)`
  - `StrategyConfig` interface supports all user configuration options

- **Configuration System:**
  - `useStrategyConfig` hook provides `{ config, updateConfig, isLoading }`
  - Config includes: `chunkAmount`, `paymentFrequency`, `targetAccountId`
  - Config persisted in Dexie `settings` table

- **Available Hooks for Data:**
  - `useAccounts()` - Returns `{ accounts, isLoading }` from Dexie
  - `useFlexiFacility()` - Returns `{ facility, isLoading }` from Dexie
  - `useIncome()` - Returns income entries
  - `useExpenses()` - Returns expense entries
  - `useFinancialSnapshot()` - May already provide combined financial data

- **Key Implementation Insight:**
  - Strategies already accept baseline parameter for comparison metrics
  - `interestSaved` and `monthsSaved` computed in `buildStrategyProjection()`
  - Strategy registry pattern allows clean iteration

[Source: docs/sprint-artifacts/4-7-implement-strategy-configuration-options.md#Dev-Agent-Record]

### Performance Considerations (NFR-P1)

From [architecture.md](../architecture.md):

| Requirement | Target | Strategy |
|-------------|--------|----------|
| All strategies calculated | < 3 seconds | Optimized big.js operations |
| 360-month projections | < 3 seconds | Efficient iteration |
| 5-10 accounts | < 3 seconds | Array operations |

**Performance Approach:**
- Sequential calculation (strategies are independent but baseline must be first)
- No Web Workers for MVP (defer optimization if needed)
- Measure actual performance in tests
- Consider memoization if recalculation is frequent

### UI Integration (for future Epic 5)

This orchestrator provides the data layer for Epic 5 (Strategy Comparison):
- `useStrategies().strategies` powers the comparison table
- `useStrategies().bestStrategy` powers the recommendation card
- `useStrategies().isCalculating` powers loading states

### References

- [Source: docs/epics.md#Story-4.8] - Original story definition
- [Source: docs/prd.md#FR23] - "System calculates total interest saved and months saved for each strategy vs. baseline"
- [Source: docs/architecture.md#Novel-Pattern] - Multi-Strategy Comparison Engine design
- [Source: docs/architecture.md#ADR-004] - Strategy Pattern for Calculation Engine
- [Source: docs/architecture.md#ADR-005] - Zustand over React Context
- [Source: docs/sprint-artifacts/4-7-implement-strategy-configuration-options.md] - Previous story with config system

## Dev Agent Record

### Context Reference

- [4-8-create-strategy-calculation-orchestrator.context.xml](docs/sprint-artifacts/4-8-create-strategy-calculation-orchestrator.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

### Completion Notes List

- All 11 tasks completed
- 1306 tests passing (55 new tests added)
- Build succeeds (641KB bundle)
- Performance verified: <82ms for 10 account scenario (well under 3 second target)
- All 8 strategies correctly calculated when flexi facility exists
- 3 strategies returned when no flexi facility (baseline, snowball, avalanche)
- Results sorted by interestSaved descending
- Empty results returned gracefully for no accounts or zero balance scenarios

### File List

**Created:**
- `src/store/calculationStore.ts` - Zustand store for calculation results
- `src/lib/calculations/engine.ts` - Strategy calculation orchestrator
- `src/lib/calculations/snapshot.ts` - FinancialSnapshot builder
- `src/hooks/useStrategies.ts` - React hook for strategy access
- `src/components/strategies/CalculationLoading.tsx` - Loading indicator component
- `tests/lib/calculations/engine.test.ts` - Orchestrator unit tests (19 tests)
- `tests/lib/calculations/snapshot.test.ts` - Snapshot builder tests (10 tests)
- `tests/lib/calculations/integration.test.ts` - Integration tests (6 tests)
- `tests/hooks/useStrategies.test.ts` - Hook and store tests (20 tests)

**Modified:**
- `src/store/index.ts` - Export calculationStore
- `src/lib/calculations/index.ts` - Export engine and snapshot functions
- `src/hooks/index.ts` - Export useStrategies
- `src/components/strategies/index.ts` - Export CalculationLoading

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 (FR23), PRD, Architecture, and Story 4.7 learnings | SM Agent (Bob) |
| 2025-12-05 | Implementation complete - all tasks done, all ACs satisfied, 1306 tests passing | Dev Agent (Amelia) |
