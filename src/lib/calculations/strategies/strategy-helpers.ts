/**
 * Helper functions for building strategy projections
 *
 * Provides common utilities used by all debt reduction strategies
 * to build consistent StrategyProjection results.
 */
import Big from 'big.js';
import { addMonths, format } from 'date-fns';
import type {
  DebtStrategy,
  MonthlyProjection,
  StrategyProjection,
  SimulatedAccount,
  StrategyConfig,
  PaymentFrequency,
} from '../types';

/**
 * Payments per year for each frequency
 */
const PAYMENTS_PER_YEAR: Record<PaymentFrequency, number> = {
  'monthly': 12,
  'bi-weekly': 26,
  'weekly': 52,
};

/**
 * Apply target account override to sorted accounts
 *
 * If a targetAccountId is specified and the account exists with positive balance,
 * it becomes the first target. Otherwise, fall back to the default sorting.
 *
 * @param accounts - Active accounts with positive balances
 * @param targetAccountId - Optional account ID to prioritize
 * @param defaultSorter - Function that sorts accounts when no override applies
 * @returns Accounts array with target first (if valid), otherwise default sorted
 */
export function applyTargetOverride(
  accounts: SimulatedAccount[],
  targetAccountId: number | null | undefined,
  defaultSorter: (accounts: SimulatedAccount[]) => SimulatedAccount[]
): SimulatedAccount[] {
  // No override - use strategy default sorting
  if (targetAccountId === null || targetAccountId === undefined) {
    return defaultSorter(accounts);
  }

  // Find target account
  const targetIndex = accounts.findIndex((a) => a.id === targetAccountId);

  // Target not found or paid off - fall back to strategy default
  if (targetIndex === -1 || accounts[targetIndex].balance.lte(0)) {
    return defaultSorter(accounts);
  }

  // Put target first, then apply default sorting to the rest
  const target = accounts[targetIndex];
  const others = accounts.filter((_, i) => i !== targetIndex);
  return [target, ...defaultSorter(others)];
}

/**
 * Calculate effective monthly surplus based on payment frequency
 *
 * For bi-weekly (26/yr) or weekly (52/yr) payments, the annual total is higher
 * than monthly (12/yr). This function adjusts the monthly surplus to reflect
 * the effective monthly contribution.
 *
 * @param monthlySurplus - Base monthly surplus amount
 * @param paymentFrequency - Payment frequency (default: 'monthly')
 * @returns Adjusted effective monthly surplus
 */
export function calculateEffectiveMonthlySurplus(
  monthlySurplus: Big,
  paymentFrequency: PaymentFrequency = 'monthly'
): Big {
  if (paymentFrequency === 'monthly') {
    return monthlySurplus;
  }

  // For non-monthly frequencies:
  // - User contributes monthlySurplus per period (bi-weekly/weekly amount)
  // - Annual contribution = period amount × periods per year
  // - Effective monthly = annual / 12
  //
  // Example: R1000 bi-weekly
  // - Annual = R1000 × 26 = R26,000
  // - Effective monthly = R26,000 / 12 = R2,166.67
  //
  // This is 2.167x the base bi-weekly amount per month
  const paymentsPerYear = PAYMENTS_PER_YEAR[paymentFrequency];
  const annualTotal = monthlySurplus.times(paymentsPerYear);
  return annualTotal.div(12).round(2, Big.roundHalfUp);
}

/**
 * Apply chunk amount limit to surplus
 *
 * If a custom chunk amount is configured and is less than the available surplus,
 * use the chunk amount instead. This allows users to control their contribution size.
 *
 * @param surplus - Available surplus for allocation
 * @param chunkAmount - Optional custom chunk amount (string or null)
 * @returns Surplus amount to use (capped at chunk amount if set)
 */
export function applyChunkAmountLimit(
  surplus: Big,
  chunkAmount: string | null | undefined
): Big {
  // No chunk limit - use full surplus
  if (chunkAmount === null || chunkAmount === undefined) {
    return surplus;
  }

  try {
    const chunk = new Big(chunkAmount);
    // Use the smaller of chunk amount or available surplus
    return chunk.lt(surplus) ? chunk : surplus;
  } catch {
    // Invalid chunk amount - use full surplus
    return surplus;
  }
}

/**
 * Get the effective surplus for allocation based on config
 *
 * Combines payment frequency adjustment with optional chunk amount limit.
 * This is the main entry point for strategies to get the surplus amount
 * they should allocate.
 *
 * @param baseSurplus - Base monthly surplus from financial snapshot
 * @param config - Strategy configuration options
 * @returns Effective surplus amount to allocate
 */
export function getEffectiveSurplus(
  baseSurplus: Big,
  config?: StrategyConfig
): Big {
  // Step 1: Adjust for payment frequency
  const frequencyAdjusted = calculateEffectiveMonthlySurplus(
    baseSurplus,
    config?.paymentFrequency ?? 'monthly'
  );

  // Step 2: Apply chunk amount limit if configured
  return applyChunkAmountLimit(frequencyAdjusted, config?.chunkAmount);
}

/**
 * Build a StrategyProjection from raw projection data
 *
 * Calculates derived metrics (debtFreeMonth, totals, savings vs baseline)
 * from the monthly projection array.
 *
 * @param strategy - The strategy that generated this projection
 * @param projections - Array of monthly projections
 * @param startDate - ISO date string for projection start
 * @param baseline - Optional baseline projection for comparison metrics
 * @returns Complete StrategyProjection with all calculated fields
 */
export function buildStrategyProjection(
  strategy: DebtStrategy,
  projections: MonthlyProjection[],
  startDate: string,
  baseline?: StrategyProjection
): StrategyProjection {
  // Handle edge case of no projections
  if (projections.length === 0) {
    return {
      strategyId: strategy.id,
      strategyName: strategy.name,
      effortLevel: strategy.effortLevel,
      debtFreeMonth: 0,
      debtFreeDate: startDate,
      totalInterestPaid: new Big(0),
      totalPrincipalPaid: new Big(0),
      monthsSaved: 0,
      interestSaved: new Big(0),
      monthlyProjections: [],
    };
  }

  // Get final month data
  const finalMonth = projections[projections.length - 1];
  const debtFreeMonth = finalMonth.month;

  // Calculate debt-free date by adding months to start date
  const baseDate = new Date(startDate);
  const debtFreeDate = format(addMonths(baseDate, debtFreeMonth - 1), 'yyyy-MM-dd');

  // Total interest and principal come from cumulative values in final month
  const totalInterestPaid = finalMonth.totalInterestPaid;
  const totalPrincipalPaid = finalMonth.totalPrincipalPaid;

  // Calculate savings vs baseline (0 if no baseline provided)
  let monthsSaved = 0;
  let interestSaved = new Big(0);

  if (baseline) {
    monthsSaved = baseline.debtFreeMonth - debtFreeMonth;
    interestSaved = baseline.totalInterestPaid.minus(totalInterestPaid);

    // Ensure non-negative (baseline should always be worse or equal)
    if (monthsSaved < 0) monthsSaved = 0;
    if (interestSaved.lt(0)) interestSaved = new Big(0);
  }

  return {
    strategyId: strategy.id,
    strategyName: strategy.name,
    effortLevel: strategy.effortLevel,
    debtFreeMonth,
    debtFreeDate,
    totalInterestPaid,
    totalPrincipalPaid,
    monthsSaved,
    interestSaved,
    monthlyProjections: projections,
  };
}

/**
 * Calculate initial total debt from a financial snapshot's accounts
 *
 * @param accounts - Array of account data with balance strings
 * @returns Total debt as Big
 */
export function calculateInitialDebt(
  accounts: { balance: string }[]
): Big {
  return accounts.reduce(
    (sum, acc) => sum.plus(new Big(acc.balance || '0')),
    new Big(0)
  );
}
