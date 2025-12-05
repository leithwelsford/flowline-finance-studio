/**
 * Calculation utilities barrel export
 *
 * Provides interest calculation functions for debt accounts and flexi facilities.
 * All calculations use big.js for precision (ADR-003).
 */

// Interest calculation functions
export {
  SA_PRIME_RATE,
  calculateMonthlyInterest,
  calculateFlexiMonthlyInterest,
  calculateTotalMonthlyInterest,
  calculateDailyInterest,
  calculateMonthlyFromDaily,
  calculateEffectiveRate,
  calculateCompoundInterest,
  calculateTotalPayment,
} from './interest';

// Projection functions (Story 4.2)
export {
  generateProjection,
  createBaselineAllocator,
  buildSnapshot,
} from './projections';

// Type definitions
export type {
  InterestCalculationResult,
  DaysInMonthOptions,
  PrimeRateLinkage,
  CompoundingFrequency,
  TotalPaymentResult,
  // Projection types (Story 4.2)
  AccountSnapshot,
  MonthlyProjection,
  PaymentAllocation,
  PaymentAllocator,
  ProjectionConfig,
  FinancialSnapshot,
  SimulatedAccount,
  SimulatedFlexi,
} from './types';
