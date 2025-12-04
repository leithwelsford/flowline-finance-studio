import { useMemo } from 'react';
import Big from 'big.js';
import { useAccounts } from './useAccounts';
import { useFlexiFacility } from './useFlexiFacility';
import { useFinancialSnapshot } from './useFinancialSnapshot';
import { calculateTotalMonthlyInterest } from '@/lib/calculations/interest';
import type { TrueCostMetrics } from '@/types/true-cost';

/**
 * Return type for useTrueCost hook
 */
export interface UseTrueCostReturn {
  /** Computed true cost of debt metrics */
  trueCost: TrueCostMetrics | null;
  /** Whether underlying data is still loading */
  isLoading: boolean;
  /** Error message if calculation failed */
  error: string | null;
}

/**
 * High debt burden threshold percentage
 */
const HIGH_BURDEN_THRESHOLD = 20;

/**
 * Hook for computing true cost of debt metrics
 *
 * Composes from useAccounts, useFlexiFacility, and useFinancialSnapshot
 * to derive monthly interest, annual interest, and interest-to-income ratio.
 * All monetary calculations use big.js for precision (ADR-003).
 *
 * @example
 * ```tsx
 * const { trueCost, isLoading, error } = useTrueCost();
 *
 * if (isLoading) return <Skeleton />;
 * if (!trueCost) return <EmptyState />;
 *
 * return (
 *   <div>
 *     <p>Monthly Interest: {formatCurrency(trueCost.monthlyInterest)}</p>
 *     {trueCost.isHighBurden && <Warning>High debt burden</Warning>}
 *   </div>
 * );
 * ```
 */
export function useTrueCost(): UseTrueCostReturn {
  const { accounts, isLoading: accountsLoading } = useAccounts();
  const { facility, isLoading: flexiLoading } = useFlexiFacility();
  const { snapshot, isLoading: snapshotLoading } = useFinancialSnapshot();

  const isLoading = accountsLoading || flexiLoading || snapshotLoading;

  const trueCost = useMemo<TrueCostMetrics | null>(() => {
    // Return null if no accounts and no flexi facility
    if (accounts.length === 0 && !facility) {
      return null;
    }

    try {
      // Calculate monthly interest across all accounts
      const monthlyInterest = calculateTotalMonthlyInterest(accounts, facility);

      // Annual interest = monthly × 12
      const annualInterest = monthlyInterest.times(12);

      // Interest-to-income ratio
      const monthlyIncome = new Big(snapshot.totalMonthlyIncome || '0');
      let ratio: Big;

      if (monthlyIncome.eq(0)) {
        // Handle edge case: no income - return 0 (avoid division by zero)
        ratio = new Big(0);
      } else {
        ratio = monthlyInterest.div(monthlyIncome).times(100);
      }

      const isHighBurden = ratio.gt(HIGH_BURDEN_THRESHOLD);

      return {
        monthlyInterest: monthlyInterest.toFixed(2),
        annualInterest: annualInterest.toFixed(2),
        interestToIncomeRatio: ratio.toFixed(1),
        isHighBurden,
      };
    } catch {
      return null;
    }
  }, [accounts, facility, snapshot.totalMonthlyIncome]);

  return {
    trueCost,
    isLoading,
    error: null,
  };
}
