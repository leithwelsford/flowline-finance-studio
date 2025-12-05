/**
 * Type definitions for interest calculation functions
 *
 * All monetary values use strings for big.js precision (ADR-003).
 * Rates are stored as decimals (0.115 = 11.5%).
 */
import type Big from 'big.js';

/**
 * Result of an interest calculation
 */
export interface InterestCalculationResult {
  /** Calculated interest amount as Big for composability */
  interest: Big;
  /** Effective rate used (optional, for prime linkage calculations) */
  effectiveRate?: Big;
}

/**
 * Options for monthly approximation from daily interest
 */
export interface DaysInMonthOptions {
  /** Number of days in the month (28, 29, 30, or 31) */
  days: number;
}

/**
 * Configuration for prime rate linkage calculation
 */
export interface PrimeRateLinkage {
  /** Base prime rate as decimal string (e.g., "0.1175" for 11.75%) */
  primeRate: string;
  /** Margin above prime as decimal string (e.g., "0.02" for 2%) */
  margin: string;
}

/**
 * Compounding frequency for interest calculations
 */
export type CompoundingFrequency = 'daily' | 'monthly';

/**
 * Result of a total payment calculation
 */
export interface TotalPaymentResult {
  /** Total amount paid over the period */
  totalPaid: Big;
  /** Total interest paid over the period */
  totalInterest: Big;
}

// =============================================================================
// Projection Types (Story 4.2)
// =============================================================================

/**
 * Snapshot of a single account's state for one month during projection
 */
export interface AccountSnapshot {
  /** Account identifier */
  accountId: number;
  /** Balance at start of month */
  startBalance: Big;
  /** Interest charged this month */
  interestCharged: Big;
  /** Total payment applied this month (minimum + extra) */
  paymentApplied: Big;
  /** Principal portion of payment (payment - interest) */
  principalPaid: Big;
  /** Balance at end of month (start + interest - payment) */
  endBalance: Big;
}

/**
 * State of all accounts and totals for one month during projection
 */
export interface MonthlyProjection {
  /** Month number (1-based: 1, 2, 3, ...) */
  month: number;
  /** ISO date string for this month */
  date: string;
  /** Per-account snapshots for this month */
  accounts: AccountSnapshot[];
  /** Flexi facility balance if applicable */
  flexiBalance?: Big;
  /** Sum of all account end balances */
  totalDebt: Big;
  /** Cumulative interest paid up to this month */
  totalInterestPaid: Big;
  /** Cumulative principal paid up to this month */
  totalPrincipalPaid: Big;
}

/**
 * Payment allocation to a specific account
 */
export interface PaymentAllocation {
  /** Account identifier */
  accountId: number;
  /** Amount to allocate to this account */
  amount: Big;
}

/**
 * Working copy of a debt account for simulation (mutable during projection)
 */
export interface SimulatedAccount {
  /** Account identifier */
  id: number;
  /** Current balance (mutated during projection) */
  balance: Big;
  /** Annual interest rate as decimal */
  interestRate: Big;
  /** Minimum monthly payment */
  minimumPayment: Big;
  /** Interest calculation type */
  interestType: 'monthly' | 'daily';
}

/**
 * Working copy of a flexi facility for simulation (mutable during projection)
 */
export interface SimulatedFlexi {
  /** Current balance (mutated during projection) */
  balance: Big;
  /** Annual interest rate as decimal */
  interestRate: Big;
}

/**
 * Function type for allocating surplus payments across accounts
 * Strategies implement this to define how extra payments are distributed
 */
export type PaymentAllocator = (
  surplus: Big,
  accounts: SimulatedAccount[],
  flexi: SimulatedFlexi | null
) => PaymentAllocation[];

/**
 * Configuration options for projection generation
 */
export interface ProjectionConfig {
  /** Maximum months to project (default: 360 = 30 years) */
  maxMonths?: number;
  /** Start date for projection as ISO string (default: current date) */
  startDate?: string;
}

/**
 * Financial snapshot - input to projection generator
 */
export interface FinancialSnapshot {
  /** Array of debt accounts */
  accounts: { id: number; balance: string; interestRate: string; minimumPayment: string; interestType: 'monthly' | 'daily' }[];
  /** Flexi facility (or null if none) */
  flexiFacility: { currentBalance: string; interestRate: string } | null;
  /** Monthly income as string */
  monthlyIncome: string;
  /** Monthly expenses as string */
  monthlyExpenses: string;
  /** Available surplus (income - expenses - minPayments) as string */
  availableSurplus: string;
  /** Snapshot date as ISO string */
  snapshotDate: string;
}

// =============================================================================
// Strategy Types (Story 4.3)
// =============================================================================

/**
 * Effort level indicator for strategies
 * - low: Simple rules, no active management (baseline, snowball, avalanche)
 * - medium: Some active management required (flexi chunking)
 * - high: Active management and monitoring (velocity banking, hybrids)
 */
export type EffortLevel = 'low' | 'medium' | 'high';

/**
 * Configuration options for strategy calculation
 */
export interface StrategyConfig {
  /** Maximum months to project (default: 360 = 30 years) */
  maxMonths?: number;
  /** Start date for projection as ISO string */
  startDate?: string;
  /** Extra monthly payment amount (for traditional strategies) */
  extraPayment?: string;
}

/**
 * Result of a strategy calculation - complete projection with metadata
 */
export interface StrategyProjection {
  /** Unique strategy identifier */
  strategyId: string;
  /** Human-readable strategy name */
  strategyName: string;
  /** Effort level required for this strategy */
  effortLevel: EffortLevel;
  /** Month number when debt-free (1-based) */
  debtFreeMonth: number;
  /** ISO date string when debt-free */
  debtFreeDate: string;
  /** Total interest paid over the payoff period */
  totalInterestPaid: Big;
  /** Total principal paid (should equal initial debt) */
  totalPrincipalPaid: Big;
  /** Months saved compared to baseline (0 for baseline itself) */
  monthsSaved: number;
  /** Interest saved compared to baseline (0 for baseline itself) */
  interestSaved: Big;
  /** Month-by-month projection data */
  monthlyProjections: MonthlyProjection[];
}

/**
 * Interface for debt reduction strategies (Strategy Pattern - ADR-004)
 *
 * All strategies implement this interface to ensure consistent behavior
 * and enable polymorphic strategy comparison.
 */
export interface DebtStrategy {
  /** Unique strategy identifier */
  id: string;
  /** Human-readable strategy name */
  name: string;
  /** Description of how the strategy works */
  description: string;
  /** Effort level required to execute this strategy */
  effortLevel: EffortLevel;
  /** Whether this strategy requires a flexi facility */
  requiresFlexi: boolean;

  /**
   * Calculate the full strategy projection
   *
   * @param snapshot - Current financial state
   * @param config - Optional configuration
   * @param baseline - Optional baseline projection for comparison metrics
   * @returns Complete strategy projection with all metrics
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection;

  /**
   * Allocate surplus payment across accounts for a single month
   *
   * This is called by the projection generator to determine how extra
   * payments should be distributed. Each strategy implements its own logic.
   *
   * @param surplus - Available surplus after minimum payments
   * @param accounts - Current account states (with balances)
   * @param flexi - Flexi facility state (or null)
   * @returns Array of payment allocations
   */
  allocatePayment(
    surplus: Big,
    accounts: SimulatedAccount[],
    flexi: SimulatedFlexi | null
  ): PaymentAllocation[];
}
