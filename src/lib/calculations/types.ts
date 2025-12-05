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
