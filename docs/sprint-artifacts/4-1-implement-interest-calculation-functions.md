# Story 4.1: Implement Interest Calculation Functions

Status: ready-for-dev

## Story

As a **developer**,
I want **accurate interest calculation functions**,
so that **all strategy projections are mathematically correct**.

## Acceptance Criteria

1. **AC-4.1.1:** Given a debt account with monthly compounding, when I calculate monthly interest, then the formula used is: `monthlyInterest = balance × (annualRate / 12)` with cent-level accuracy (2 decimal places in ZAR)

2. **AC-4.1.2:** Given a flexi facility with daily compounding, when I calculate daily interest, then the formula used is: `dailyInterest = balance × (annualRate / 365)` and monthly approximation is: `monthlyInterest = dailyInterest × daysInMonth`

3. **AC-4.1.3:** Given an account linked to SA prime rate, when I calculate interest with prime linkage, then the effective rate = prime rate + margin (e.g., prime + 2% margin = 13.75% total if prime is 11.75%)

4. **AC-4.1.4:** All calculations use big.js for arbitrary precision decimal arithmetic, preventing floating-point errors

5. **AC-4.1.5:** Results are accurate to 2 decimal places (cent-level in ZAR) with no accumulated rounding errors

6. **AC-4.1.6:** Unit tests verify calculations against manual spreadsheet examples with known inputs/outputs:
   - R100,000 at 11.5% annual = R958.33/month interest
   - R50,000 flexi at 12% annual = R16.44/day interest (assuming 365 days)
   - Prime (11.75%) + 2% margin = 13.75% effective rate

7. **AC-4.1.7:** Functions are pure, deterministic, and framework-agnostic (can be used outside React context)

## Tasks / Subtasks

- [ ] Task 1: Create calculation types file (AC: 7)
  - [ ] Create `src/lib/calculations/types.ts`
  - [ ] Define `InterestCalculationResult` interface: { interest: Big, effectiveRate: Big }
  - [ ] Define `DaysInMonthOptions` interface for monthly approximation config
  - [ ] Define `PrimeRateLinkage` interface: { primeRate: string, margin: string }
  - [ ] Export all types with barrel export

- [ ] Task 2: Implement monthly interest calculation (AC: 1, 4, 5)
  - [ ] Create `src/lib/calculations/interest.ts`
  - [ ] Implement `calculateMonthlyInterest(balance: string, annualRate: string): Big`
  - [ ] Use big.js for all arithmetic: `Big(balance).times(Big(annualRate).div(12))`
  - [ ] Round to 2 decimal places: `.round(2, Big.roundHalfUp)`
  - [ ] Validate inputs: balance >= 0, rate >= 0, rate <= 1 (decimal format)
  - [ ] Return Big instance for composability

- [ ] Task 3: Implement daily interest calculation (AC: 2, 4, 5)
  - [ ] Add `calculateDailyInterest(balance: string, annualRate: string): Big`
  - [ ] Formula: `Big(balance).times(Big(annualRate).div(365))`
  - [ ] Round to 2 decimal places
  - [ ] Add `calculateMonthlyFromDaily(dailyInterest: Big, daysInMonth: number): Big`
  - [ ] Support configurable days in month (28, 29, 30, 31)
  - [ ] Default to 30 days for approximation

- [ ] Task 4: Implement effective rate calculation with prime linkage (AC: 3, 4)
  - [ ] Add `calculateEffectiveRate(primeRate: string, margin: string): Big`
  - [ ] Formula: `Big(primeRate).plus(Big(margin))`
  - [ ] Add `SA_PRIME_RATE` constant (current: 0.1175 = 11.75%)
  - [ ] Allow override for SARB rate change simulation
  - [ ] Validate: combined rate should not exceed 100% (1.0)

- [ ] Task 5: Implement compound interest helpers (AC: 4, 5)
  - [ ] Add `calculateCompoundInterest(principal: string, rate: string, periods: number, compoundingFrequency: 'daily' | 'monthly'): Big`
  - [ ] Daily: `P × (1 + r/365)^n - P`
  - [ ] Monthly: `P × (1 + r/12)^n - P`
  - [ ] Use big.js `.pow()` for exponentiation
  - [ ] Add `calculateTotalPayment(principal: string, rate: string, monthlyPayment: string, months: number): { totalPaid: Big, totalInterest: Big }`

- [ ] Task 6: Create barrel export for calculations (AC: 7)
  - [ ] Create `src/lib/calculations/index.ts`
  - [ ] Export all functions from `interest.ts`
  - [ ] Export all types from `types.ts`
  - [ ] Ensure clean public API

- [ ] Task 7: Write unit tests for monthly interest (AC: 1, 6)
  - [ ] Create `tests/calculations/interest.test.ts`
  - [ ] Test: R100,000 at 11.5% annual = R958.33/month
  - [ ] Test: R500,000 at 11.75% annual = R4,895.83/month
  - [ ] Test: R0 balance = R0 interest
  - [ ] Test: 0% rate = R0 interest
  - [ ] Test: Edge case with very small balance (R1.00)
  - [ ] Test: Edge case with high rate (24% = 0.24)

- [ ] Task 8: Write unit tests for daily interest (AC: 2, 6)
  - [ ] Test: R50,000 at 12% annual = R16.44/day
  - [ ] Test: Monthly approximation: R16.44 × 30 = R493.15/month
  - [ ] Test: Varying days in month (28, 29, 30, 31)
  - [ ] Test: R100,000 flexi at 13.75% (prime + 2%) = R37.67/day

- [ ] Task 9: Write unit tests for effective rate (AC: 3, 6)
  - [ ] Test: Prime (11.75%) + 2% margin = 13.75%
  - [ ] Test: Prime (11.75%) + 0% margin = 11.75%
  - [ ] Test: Prime (11.75%) + 3.5% margin = 15.25%
  - [ ] Test: Rate change simulation: 12.00% + 2% = 14.00%

- [ ] Task 10: Write precision and edge case tests (AC: 4, 5)
  - [ ] Test: Floating-point precision: 0.1 + 0.2 handling
  - [ ] Test: Large balance precision: R10,000,000 calculations
  - [ ] Test: Small rate precision: 0.001% (0.00001)
  - [ ] Test: Cumulative calculations over 12 months don't drift
  - [ ] Test: Result is Big instance with proper methods available

- [ ] Task 11: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all new tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite
  - [ ] Document any known limitations or assumptions

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   ├── calculations/           # FR9-23: Calculation Engine
│   │   ├── types.ts            # NEW: Strategy interfaces, projection types
│   │   ├── interest.ts         # NEW: FR9-11: Interest formulas
│   │   └── index.ts            # NEW: Barrel exports
```

**ADR-003 (big.js for Financial Calculations):**
> Context: JavaScript floating-point math causes precision errors (0.1 + 0.2 ≠ 0.3).
> Decision: Use big.js for all monetary calculations.
> Consequences: Cent-level accuracy guaranteed. Slightly more verbose code. String storage for precision preservation. 6KB bundle size impact.

**Data Types (from architecture):**
```typescript
// Monetary values: string for big.js precision
// Dates: ISO string
// Rates: decimal (0.115 = 11.5%)
```

### Interest Calculation Formulas

**Monthly Interest (Standard Loans - FR10):**
```typescript
// Simple interest per month (used for amortization schedules)
monthlyInterest = balance × (annualRate / 12)

// Example: R100,000 at 11.5% annual
// = R100,000 × (0.115 / 12)
// = R100,000 × 0.009583333...
// = R958.33
```

**Daily Interest (Flexi Facilities - FR9):**
```typescript
// Daily compounding (FNB Flexi Option, Standard Bank Access Bond)
dailyInterest = balance × (annualRate / 365)

// Example: R50,000 at 12% annual
// = R50,000 × (0.12 / 365)
// = R50,000 × 0.000328767...
// = R16.44/day

// Monthly approximation
monthlyInterest = dailyInterest × daysInMonth
// = R16.44 × 30 = R493.15 (approx)
```

**Prime Rate Linkage (FR11):**
```typescript
// SA loans often quoted as "prime + X%"
effectiveRate = primeRate + margin

// Example: Prime (11.75%) + 2% margin
// = 0.1175 + 0.02
// = 0.1375 (13.75%)

// Current SA Prime Rate (as of 2025): 11.75% (0.1175)
// This may change with SARB announcements
```

### big.js Usage Patterns

**From architecture patterns:**
```typescript
import Big from 'big.js';

// Configure rounding mode (important for consistency)
Big.RM = Big.roundHalfUp; // Standard banker's rounding

// Create from string to preserve precision
const balance = Big('100000.00');
const rate = Big('0.115');

// Perform calculation
const monthlyInterest = balance.times(rate.div(12));

// Round to cents
const rounded = monthlyInterest.round(2);

// Convert back to string for storage
const result = rounded.toString(); // "958.33"
```

**Error Prevention:**
```typescript
// WRONG: Floating point issues
const wrong = 100000 * (0.115 / 12); // 958.3333333333334

// CORRECT: big.js precision
const correct = Big('100000').times(Big('0.115').div(12)).round(2);
// Result: Big("958.33")
```

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/types.ts` - Type definitions
- `src/lib/calculations/interest.ts` - Interest calculation functions
- `src/lib/calculations/index.ts` - Barrel exports
- `tests/calculations/interest.test.ts` - Unit tests

**Dependencies Already Installed:**
- `big.js` - Available per package.json
- `@types/big.js` - TypeScript types available

### Testing Strategy

**Test Values (manually verified):**

| Scenario | Balance | Rate | Result |
|----------|---------|------|--------|
| Monthly loan | R100,000 | 11.5% | R958.33/month |
| Monthly loan | R500,000 | 11.75% | R4,895.83/month |
| Daily flexi | R50,000 | 12% | R16.44/day |
| Daily → monthly | R16.44 | × 30 | R493.15/month |
| Prime + margin | 11.75% + 2% | - | 13.75% |

**Precision Tests:**
- Verify 0.1 + 0.2 = 0.3 (not 0.30000000000000004)
- Verify 12-month cumulative interest doesn't drift from expected
- Verify R10,000,000 × 0.00001 calculates correctly

### Learnings from Previous Story

**From Story 3.4 (Status: done)**

- **big.js pattern established** in hooks (useCashFlowHealth, useIncomeExpense, useTrueCost) - use same patterns
- **834/835 tests passing** - maintain test hygiene
- **Bundle size: 641KB** - big.js already included, no additional size impact
- **TypeScript strict mode** - ensure proper typing for new functions
- **barrel export pattern** - follow existing patterns in `src/lib/format/index.ts`
- **Test organization** - place in `tests/calculations/` directory

**Files Available from Previous Stories:**
- `src/types/account.ts` - DebtAccount, FlexiFacility types (have interestRate field)
- `src/lib/format/currency.ts` - formatCurrency for display
- `src/lib/utils/result.ts` - Result type for error handling

**Review Notes from Story 3.4:**
- All acceptance criteria verified complete
- Advisory: Bundle size at 641KB - within threshold
- No unresolved action items affecting this story

[Source: docs/sprint-artifacts/3-4-assemble-dashboard-page-with-three-numbers-grid.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-4.1] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR9] - Daily interest calculation requirement
- [Source: docs/prd.md#FR10] - Monthly interest calculation requirement
- [Source: docs/prd.md#FR11] - Prime rate linkage requirement
- [Source: docs/architecture.md#ADR-003] - big.js decision for financial precision
- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#Core-Interfaces] - Data type patterns

## Dev Agent Record

### Context Reference

- [4-1-implement-interest-calculation-functions.context.xml](4-1-implement-interest-calculation-functions.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Story drafted with full context from Epic 4 definition, PRD (FR9-11), Architecture (ADR-003, big.js patterns), and Story 3.4 learnings | SM Agent (Bob) |
| 2025-12-04 | Story context generated, status changed to ready-for-dev | SM Agent (Bob) |
