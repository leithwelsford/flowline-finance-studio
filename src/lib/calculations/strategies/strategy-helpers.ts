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
} from '../types';

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
