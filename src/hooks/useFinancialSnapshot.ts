import { useMemo } from 'react';
import Big from 'big.js';
import { useAccounts } from './useAccounts';
import { useIncome } from './useIncome';
import { useExpenses } from './useExpenses';
import { useFlexiFacility } from './useFlexiFacility';
import type { FinancialSnapshot } from '@/types/financial-snapshot';

/**
 * Return type for useFinancialSnapshot hook
 */
export interface UseFinancialSnapshotReturn {
  /** Aggregated financial snapshot data */
  snapshot: FinancialSnapshot;
  /** Whether any underlying data is still loading */
  isLoading: boolean;
  /** Whether available surplus is positive (healthy) */
  isHealthy: boolean;
}

/**
 * Hook for computing aggregated financial snapshot
 *
 * Composes from useAccounts, useIncome, useExpenses, and useFlexiFacility
 * to provide a reactive summary of the user's financial situation.
 * All monetary calculations use big.js for precision.
 *
 * @example
 * ```tsx
 * const { snapshot, isLoading, isHealthy } = useFinancialSnapshot();
 *
 * return (
 *   <div>
 *     <p>Total Debt: {formatCurrency(snapshot.totalDebt)}</p>
 *     <p>Surplus: {formatCurrency(snapshot.availableSurplus)}</p>
 *     {isHealthy ? <CheckIcon /> : <WarningIcon />}
 *   </div>
 * );
 * ```
 */
export function useFinancialSnapshot(): UseFinancialSnapshotReturn {
  const { accounts, isLoading: accountsLoading, totalDebt, totalMinPayments } = useAccounts();
  const { isLoading: incomeLoading, totalMonthlyIncome } = useIncome();
  const { isLoading: expensesLoading, totalMonthlyExpenses } = useExpenses();
  const { facility, isLoading: flexiLoading, availableCredit } = useFlexiFacility();

  const isLoading = accountsLoading || incomeLoading || expensesLoading || flexiLoading;

  const availableSurplus = useMemo(() => {
    try {
      return new Big(totalMonthlyIncome)
        .minus(new Big(totalMonthlyExpenses))
        .minus(new Big(totalMinPayments))
        .toString();
    } catch {
      return '0';
    }
  }, [totalMonthlyIncome, totalMonthlyExpenses, totalMinPayments]);

  const isHealthy = useMemo(() => {
    try {
      return new Big(availableSurplus).gt(0);
    } catch {
      return false;
    }
  }, [availableSurplus]);

  const snapshot: FinancialSnapshot = useMemo(
    () => ({
      totalDebt,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      minimumDebtPayments: totalMinPayments,
      availableSurplus,
      accountCount: accounts.length,
      hasFlexi: facility !== null,
      flexiAvailableCredit: facility !== null ? availableCredit : undefined,
    }),
    [
      totalDebt,
      totalMonthlyIncome,
      totalMonthlyExpenses,
      totalMinPayments,
      availableSurplus,
      accounts.length,
      facility,
      availableCredit,
    ]
  );

  return {
    snapshot,
    isLoading,
    isHealthy,
  };
}
