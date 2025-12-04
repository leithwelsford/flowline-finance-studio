import { useMemo } from 'react';
import Big from 'big.js';
import { useFinancialSnapshot } from './useFinancialSnapshot';
import type { IncomeExpenseMetrics } from '@/types/income-expense';

/**
 * Return type for useIncomeExpense hook
 */
export interface UseIncomeExpenseReturn {
  /** Computed income vs expense metrics */
  incomeExpense: IncomeExpenseMetrics | null;
  /** Whether underlying data is still loading */
  isLoading: boolean;
  /** Error message if calculation failed */
  error: string | null;
}

/**
 * Calculate income vs expense metrics
 *
 * @param totalIncome - Total monthly income as string
 * @param totalExpenses - Total monthly expenses as string
 * @returns IncomeExpenseMetrics with all calculated values
 */
function calculateIncomeExpenseMetrics(
  totalIncome: string,
  totalExpenses: string
): IncomeExpenseMetrics {
  const income = new Big(totalIncome || '0');
  const expenses = new Big(totalExpenses || '0');

  const discretionaryAmount = income.minus(expenses);

  // Handle edge case: no income (avoid division by zero)
  if (income.eq(0)) {
    return {
      totalIncome: income.toString(),
      totalExpenses: expenses.toString(),
      discretionaryAmount: discretionaryAmount.toString(),
      savingsRate: '0',
    };
  }

  // Savings rate = (Income - Expenses) / Income × 100
  const savingsRate = discretionaryAmount.div(income).times(100);

  return {
    totalIncome: income.toString(),
    totalExpenses: expenses.toString(),
    discretionaryAmount: discretionaryAmount.toString(),
    savingsRate: savingsRate.toFixed(1),
  };
}

/**
 * Hook for computing income vs expense metrics
 *
 * Composes from useFinancialSnapshot to derive discretionary amount
 * and savings rate. All monetary calculations use big.js for precision (ADR-003).
 *
 * @example
 * ```tsx
 * const { incomeExpense, isLoading, error } = useIncomeExpense();
 *
 * if (isLoading) return <Skeleton />;
 * if (!incomeExpense) return <EmptyState />;
 *
 * return (
 *   <div>
 *     <p>Income: {formatCurrency(incomeExpense.totalIncome)}</p>
 *     <p>Savings Rate: {incomeExpense.savingsRate}%</p>
 *   </div>
 * );
 * ```
 */
export function useIncomeExpense(): UseIncomeExpenseReturn {
  const { snapshot, isLoading } = useFinancialSnapshot();

  const incomeExpense = useMemo<IncomeExpenseMetrics | null>(() => {
    // Return null if no data yet
    if (
      snapshot.totalMonthlyIncome === '0' &&
      snapshot.totalMonthlyExpenses === '0'
    ) {
      return null;
    }

    try {
      return calculateIncomeExpenseMetrics(
        snapshot.totalMonthlyIncome,
        snapshot.totalMonthlyExpenses
      );
    } catch {
      return null;
    }
  }, [snapshot.totalMonthlyIncome, snapshot.totalMonthlyExpenses]);

  return {
    incomeExpense,
    isLoading,
    error: null,
  };
}
