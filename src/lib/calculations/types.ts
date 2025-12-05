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
