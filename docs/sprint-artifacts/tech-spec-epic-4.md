# Epic Technical Specification: Calculation Engine & Strategy Modeling

Date: 2025-12-05
Author: Leith
Epic ID: 4
Status: Draft

---

## Overview

Epic 4 delivers the core calculation engine that powers Flowline Finance Studio's multi-strategy debt comparison capability. This epic transforms raw financial data (debt accounts, flexi facility, income, expenses) into actionable projections for 8 different debt acceleration strategies—the heart of the application's value proposition.

The calculation engine must model SA-specific financial calculations including daily interest compounding for flexi facilities (FNB Flexi Option, Standard Bank Access Bond) versus monthly compounding for standard loans, prime rate linkage, and accurate Rand-denominated projections over multi-year timelines.

**Key Deliverables:**
- Projection generator simulating month-by-month debt payoff scenarios (up to 360 months)
- 8 debt acceleration strategy implementations (Baseline, Snowball, Avalanche, Flexi Chunking, Aggressive Flexi, Velocity Banking, Hybrid Flexi-Snowball, Hybrid Flexi-Avalanche)
- Strategy configuration system for customizing calculation parameters
- Orchestration layer that calculates all strategies from a single financial snapshot

## Objectives and Scope

**In Scope:**
- FR9-FR23: All Calculation Engine & Strategy Modeling functional requirements
- Projection generator with month-by-month simulation
- 8 debt strategy implementations with consistent `DebtStrategy` interface
- Strategy configuration persistence (chunk amounts, payment frequencies, target accounts)
- Calculation orchestrator with comparison metrics (months saved, interest saved vs baseline)
- Performance: All calculations complete in < 3 seconds for typical portfolio (5-10 accounts)

**Out of Scope:**
- UI components for strategy display (Epic 5)
- Progress tracking comparison (Epic 6)
- SARB rate change simulation UI (FR12 partially—calculation support only, UI deferred)
- Real-time recalculation triggers (will be handled by React hooks consuming calculation store)

## System Architecture Alignment

**Component Location:** `src/lib/calculations/` (framework-agnostic calculation engine)

**Architecture Alignment:**
- All calculations use **big.js** for cent-level precision (ADR-003)
- Strategy implementations follow **Strategy Pattern** (ADR-004) with common `DebtStrategy` interface
- Results stored in **Zustand calculationStore** for UI consumption (ADR-005)
- Framework-agnostic design allows future extraction to Web Worker or Node.js if needed

**Data Flow:**
```
Dexie (accounts, flexi, income, expenses)
    │
    ▼
FinancialSnapshot (built from DB state)
    │
    ▼
Strategy Registry (8 strategies)
    │
    ▼
Projection Generator (month-by-month simulation)
    │
    ▼
StrategyProjection[] (comparison metrics)
    │
    ▼
Zustand calculationStore (UI consumption)
```

## Detailed Design

### Services and Modules

| Module | File Path | Responsibility | Inputs | Outputs |
|--------|-----------|----------------|--------|---------|
| Interest Calculator | `src/lib/calculations/interest.ts` | Daily/monthly interest formulas, prime linkage | balance, rate, type | Big (interest amount) |
| Projection Generator | `src/lib/calculations/projections.ts` | Month-by-month debt simulation | FinancialSnapshot, PaymentAllocator | MonthlyProjection[] |
| Strategy Registry | `src/lib/calculations/strategies/index.ts` | Strategy registration and lookup | — | DebtStrategy[] |
| Baseline Strategy | `src/lib/calculations/strategies/baseline.ts` | Minimum payments only | FinancialSnapshot | StrategyProjection |
| Snowball Strategy | `src/lib/calculations/strategies/snowball.ts` | Smallest balance first | FinancialSnapshot | StrategyProjection |
| Avalanche Strategy | `src/lib/calculations/strategies/avalanche.ts` | Highest rate first | FinancialSnapshot | StrategyProjection |
| Flexi Chunking | `src/lib/calculations/strategies/flexi-chunking.ts` | Regular lump sums via flexi | FinancialSnapshot | StrategyProjection |
| Aggressive Flexi | `src/lib/calculations/strategies/aggressive-flexi.ts` | Maximum flexi deposits | FinancialSnapshot | StrategyProjection |
| Velocity Banking | `src/lib/calculations/strategies/velocity-banking.ts` | Income parking in flexi | FinancialSnapshot | StrategyProjection |
| Hybrid Snowball | `src/lib/calculations/strategies/hybrid-snowball.ts` | Flexi + smallest balance | FinancialSnapshot | StrategyProjection |
| Hybrid Avalanche | `src/lib/calculations/strategies/hybrid-avalanche.ts` | Flexi + highest rate | FinancialSnapshot | StrategyProjection |
| Calculation Engine | `src/lib/calculations/engine.ts` | Orchestrates all strategies | FinancialSnapshot, StrategyConfig | StrategyProjection[] |
| Calculation Store | `src/store/calculationStore.ts` | UI state for results | — | isCalculating, results, error |

### Data Models and Contracts

**FinancialSnapshot** (Input to all strategies)
```typescript
interface FinancialSnapshot {
  accounts: DebtAccount[];           // All debt accounts from DB
  flexiFacility: FlexiFacility | null; // Optional flexi facility
  monthlyIncome: Big;                // Total monthly income
  monthlyExpenses: Big;              // Total monthly expenses
  availableSurplus: Big;             // Income - expenses - min payments
  snapshotDate: string;              // ISO date of snapshot
}
```

**DebtStrategy** (Strategy interface - ADR-004)
```typescript
interface DebtStrategy {
  id: string;                        // e.g., 'snowball', 'velocity-banking'
  name: string;                      // Display name
  description: string;               // Brief explanation
  effortLevel: 'low' | 'medium' | 'high';
  requiresFlexi: boolean;            // Strategy needs flexi facility

  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig
  ): StrategyProjection;

  allocatePayment(
    surplus: Big,
    accounts: DebtAccount[],
    flexi: FlexiFacility | null
  ): PaymentAllocation[];
}
```

**MonthlyProjection** (Single month in projection)
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

**StrategyProjection** (Full strategy result)
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

**StrategyConfig** (User configuration)
```typescript
interface StrategyConfig {
  chunkAmount?: string;              // Custom flexi chunk (default: full surplus)
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  targetAccountId?: number;          // Override target selection
}
```

### APIs and Interfaces

**Calculation Engine API** (`src/lib/calculations/engine.ts`)

```typescript
/**
 * Calculate all applicable strategies for a financial snapshot
 * Returns sorted by interest saved (best first)
 */
function calculateAllStrategies(
  snapshot: FinancialSnapshot,
  config?: StrategyConfig
): Result<StrategyProjection[], CalculationError>

/**
 * Calculate a single strategy
 */
function calculateStrategy(
  strategyId: string,
  snapshot: FinancialSnapshot,
  config?: StrategyConfig
): Result<StrategyProjection, CalculationError>

/**
 * Get baseline projection for comparison
 */
function calculateBaseline(
  snapshot: FinancialSnapshot
): StrategyProjection
```

**Strategy Hook** (`src/hooks/useStrategies.ts`)

```typescript
function useStrategies(): {
  isCalculating: boolean;
  strategies: StrategyProjection[] | null;
  error: string | null;
  calculate: () => Promise<void>;
  getStrategy: (id: string) => StrategyProjection | undefined;
}
```

### Workflows and Sequencing

**Calculation Flow (when user triggers "Calculate Strategies"):**

1. **Build Snapshot** - Query Dexie for current accounts, flexi, income, expenses
2. **Validate Data** - Ensure at least one account, positive surplus
3. **Set Loading State** - calculationStore.setCalculating(true)
4. **Execute Strategies** - Run all 8 strategies (skip flexi-based if no flexi)
5. **Compute Comparisons** - Calculate monthsSaved, interestSaved vs baseline
6. **Sort Results** - Order by interestSaved descending
7. **Store Results** - calculationStore.setResults(projections)
8. **Clear Loading** - calculationStore.setCalculating(false)

**Per-Strategy Calculation Flow:**

1. Initialize projection array
2. Clone accounts for simulation
3. For each month (1 to 360):
   a. Calculate interest for all accounts
   b. Apply minimum payments to all accounts
   c. Allocate surplus per strategy logic
   d. Record monthly snapshot
   e. Check if all debts = 0 → exit loop
4. Compile final StrategyProjection

## Non-Functional Requirements

### Performance

**NFR-P1: Calculation Performance**
- Target: All 8 strategies calculated in < 3 seconds
- Constraint: Up to 360 months × 10 accounts × 8 strategies
- Approach: Efficient big.js operations, early loop termination, no unnecessary allocations
- Fallback: If > 3s, consider Web Worker offloading (deferred optimization)

**Measurement:**
- Add timing logs in engine.ts: `logger.calc('All strategies', { duration: ms })`
- Profile with Chrome DevTools Performance tab

### Security

**NFR-S3: Input Validation**
- All balance, rate, and payment inputs validated via Zod schemas
- Reject negative values, rates > 100%, invalid dates
- Calculation functions throw descriptive errors for invalid state

**Data Privacy:**
- Calculations run entirely client-side (no data transmission)
- No logging of actual financial values (log metrics only)

### Reliability/Availability

**NFR-R1: Calculation Accuracy**
- All arithmetic via big.js (no floating-point errors)
- Results accurate to 2 decimal places (cent-level ZAR)
- Rounding errors < 0.1% over 360-month projections

**NFR-R3: Consistent Behavior**
- Same inputs always produce identical outputs
- Deterministic strategy ordering
- No reliance on Date.now() during calculation (use snapshot date)

### Observability

**Logging:**
- `[CALC]` prefix for calculation-related logs
- Log: strategy ID, duration, final month count, total interest
- No sensitive data in logs

**Error Tracking:**
- Result type captures calculation errors
- Toast notifications for user-facing errors
- Console errors for developer debugging

## Dependencies and Integrations

**Runtime Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| big.js | ^7.0.1 | Arbitrary precision decimals |
| zustand | ^5.0.8 | Calculation store state |
| dexie | ^4.2.1 | Database queries for snapshot |
| dexie-react-hooks | ^4.2.0 | useLiveQuery for reactivity |

**Internal Dependencies:**
| Module | Import Path | Purpose |
|--------|-------------|---------|
| DebtAccount | @/types/account | Account data type |
| FlexiFacility | @/types/flexi-facility | Flexi data type |
| Result | @/lib/utils/result | Error handling |
| logger | @/lib/utils/logger | Calculation logging |
| db | @/lib/db | Database instance |

**Development Dependencies:**
| Package | Version | Purpose |
|---------|---------|---------|
| vitest | ^4.0.14 | Unit testing |
| fake-indexeddb | ^6.2.5 | Database mocking |

## Acceptance Criteria (Authoritative)

**Story 4.1: Interest Calculation Functions** ✅ IMPLEMENTED
- AC1: Monthly interest formula: `balance × (rate / 12)` for standard loans
- AC2: Daily interest formula: `balance × (rate / 365)` for flexi
- AC3: Prime linkage: `effectiveRate = primeRate + margin`
- AC4: All calculations use big.js, accurate to 2 decimal places
- AC5: Unit tests verify against manual spreadsheet examples

**Story 4.2: Projection Generator**
- AC1: Generates month-by-month projection from snapshot and payment allocator
- AC2: Calculates per-account: starting balance, interest, payment, principal, ending balance
- AC3: Continues until all debts = 0 OR max 360 months reached
- AC4: Handles paid-off accounts (skip further calculations)
- AC5: Caps payments at remaining balance (no overpayment)
- AC6: Output is `MonthlyProjection[]` array

**Story 4.3: Baseline and Traditional Strategies**
- AC1: Baseline applies minimum payments only, no surplus allocation
- AC2: Snowball allocates surplus to smallest balance first, rolls on payoff
- AC3: Avalanche allocates surplus to highest rate first, rolls on payoff
- AC4: Each returns `StrategyProjection` with all required fields
- AC5: Effort levels: Baseline = low, Snowball = low, Avalanche = low

**Story 4.4: Flexi Chunking Strategies**
- AC1: Flexi Chunking models regular lump sums from flexi to highest-rate debt
- AC2: Aggressive Flexi models maximum deposits, minimum withdrawals
- AC3: Both correctly model flexi daily interest vs loan monthly interest
- AC4: Returns null/not applicable if no flexi facility
- AC5: Effort levels: Flexi Chunking = medium, Aggressive Flexi = high

**Story 4.5: Velocity Banking Strategy**
- AC1: Models income deposited to flexi, expenses paid from flexi
- AC2: Net effect: (income - expenses) reduces flexi balance daily
- AC3: Periodic chunks transferred to target debt
- AC4: Shows month-by-month flexi balance fluctuation
- AC5: Returns null if no flexi facility
- AC6: Effort level = high

**Story 4.6: Hybrid Strategies**
- AC1: Hybrid Flexi-Snowball combines flexi chunking + smallest balance targeting
- AC2: Hybrid Flexi-Avalanche combines flexi chunking + highest rate targeting
- AC3: Both return null if no flexi facility
- AC4: Effort levels = medium

**Story 4.7: Strategy Configuration Options**
- AC1: User can configure chunk amount (default: full surplus)
- AC2: User can configure payment frequency (monthly, bi-weekly, weekly)
- AC3: User can override target account selection
- AC4: Configuration persists in Dexie settings table
- AC5: Strategies recalculate when configuration changes

**Story 4.8: Strategy Calculation Orchestrator**
- AC1: Creates FinancialSnapshot from current database state
- AC2: Runs all 8 strategies (skip flexi-based if no flexi)
- AC3: Computes comparison metrics: monthsSaved, interestSaved vs baseline
- AC4: Returns `StrategyProjection[]` sorted by interestSaved descending
- AC5: Completes in < 3 seconds for 10 accounts
- AC6: Results stored in Zustand calculationStore
- AC7: Loading state shown during calculation

## Traceability Mapping

| AC | Spec Section | Component(s) | Test Idea |
|----|--------------|--------------|-----------|
| 4.1-AC1 | Interest Calculator | interest.ts | Test R100,000 @ 11.5% = R958.33/month |
| 4.1-AC2 | Interest Calculator | interest.ts | Test R50,000 @ 12% = R16.44/day |
| 4.1-AC3 | Interest Calculator | interest.ts | Test prime 11.75% + 2% = 13.75% |
| 4.2-AC1 | Projection Generator | projections.ts | Test 2-account scenario produces correct months |
| 4.2-AC3 | Projection Generator | projections.ts | Test max 360 months enforced |
| 4.2-AC5 | Projection Generator | projections.ts | Test final payment caps at balance |
| 4.3-AC1 | Baseline Strategy | baseline.ts | Test min payments only, no surplus |
| 4.3-AC2 | Snowball Strategy | snowball.ts | Test smallest balance targeted first |
| 4.3-AC3 | Avalanche Strategy | avalanche.ts | Test highest rate targeted first |
| 4.4-AC1 | Flexi Chunking | flexi-chunking.ts | Test lump sum from flexi to debt |
| 4.4-AC4 | Flexi Strategies | All flexi | Test returns null without flexi |
| 4.5-AC1 | Velocity Banking | velocity-banking.ts | Test income parking effect |
| 4.6-AC1 | Hybrid Snowball | hybrid-snowball.ts | Test flexi + smallest balance |
| 4.8-AC5 | Engine | engine.ts | Performance test < 3s |
| 4.8-AC6 | Calculation Store | calculationStore.ts | Test store updates |

## Risks, Assumptions, Open Questions

**Risks:**

1. **RISK: Performance degradation with complex portfolios**
   - Mitigation: Implement early termination, benchmark with 10-account scenarios
   - Contingency: Defer to Web Worker if > 5s

2. **RISK: Floating-point precision in long projections**
   - Mitigation: big.js for all arithmetic, round at each step
   - Validation: Compare 360-month projection totals against manual calculation

3. **RISK: Velocity banking model complexity**
   - Mitigation: Start with simplified monthly model, iterate based on validation
   - Acceptance: Model captures key "income parking" effect

**Assumptions:**

1. **ASSUMPTION:** Single flexi facility per user (validated in data model)
2. **ASSUMPTION:** Interest rates remain constant during projection (rate changes via SARB simulation deferred)
3. **ASSUMPTION:** User surplus available every month (no income variability modeling)
4. **ASSUMPTION:** All debts use same currency (ZAR)

**Open Questions:**

1. **QUESTION:** Should bi-weekly/weekly payment frequency model actual payment timing within month?
   - Current approach: Treat as monthly equivalent (bi-weekly = monthly × 26/12)
   - Revisit if validation shows significant discrepancy

2. **QUESTION:** How to handle negative surplus (expenses > income - min payments)?
   - Current approach: Strategies return "insufficient surplus" warning
   - Baseline still calculates (shows minimum payment scenario)

## Test Strategy Summary

**Test Levels:**

1. **Unit Tests** (70%): Individual calculation functions
   - Interest calculations with known inputs/outputs
   - Strategy allocation logic
   - Edge cases (zero balance, zero rate, paid-off accounts)

2. **Integration Tests** (20%): Strategy calculations
   - Full strategy calculation with sample snapshot
   - Orchestrator with multiple strategies
   - Store updates on calculation

3. **Manual Validation** (10%): Spreadsheet comparison
   - Export projection to CSV
   - Compare against manual Excel model
   - Verify < 0.1% variance

**Test Data:**

```typescript
// Sample test snapshot
const testSnapshot: FinancialSnapshot = {
  accounts: [
    { id: 1, name: 'Home Loan', balance: '1500000', rate: '0.115', minPayment: '15000', type: 'home_loan', interestType: 'monthly' },
    { id: 2, name: 'Car', balance: '250000', rate: '0.13', minPayment: '5500', type: 'vehicle_finance', interestType: 'monthly' },
    { id: 3, name: 'Credit Card', balance: '50000', rate: '0.20', minPayment: '1500', type: 'credit_card', interestType: 'monthly' },
  ],
  flexiFacility: { id: 1, creditLimit: '500000', currentBalance: '100000', rate: '0.1375' },
  monthlyIncome: new Big('85000'),
  monthlyExpenses: new Big('45000'),
  availableSurplus: new Big('18000'), // 85000 - 45000 - 22000 min payments
  snapshotDate: '2025-12-05'
};
```

**Coverage Targets:**
- Calculation functions: 90% line coverage
- Strategy implementations: 80% branch coverage
- Orchestrator: 75% coverage

**Test Files:**
- `tests/calculations/interest.test.ts` ✅ (exists)
- `tests/calculations/projections.test.ts` (to create)
- `tests/calculations/strategies/*.test.ts` (to create)
- `tests/calculations/engine.test.ts` (to create)
