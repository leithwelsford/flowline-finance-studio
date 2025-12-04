import { useMemo } from 'react';
import Big from 'big.js';
import { useFinancialSnapshot } from './useFinancialSnapshot';
import type { CashFlowHealth, HealthStatus } from '@/types/financial-health';

/**
 * Return type for useFinancialHealth hook
 */
export interface UseFinancialHealthReturn {
  /** Computed cash flow health metrics */
  cashFlow: CashFlowHealth | null;
  /** Whether underlying data is still loading */
  isLoading: boolean;
  /** Error message if calculation failed */
  error: string | null;
}

/**
 * Calculate cash flow health status from financial data
 *
 * Status determination:
 * - surplus > 10% of income → 'healthy' → "Breathing"
 * - surplus 0-10% of income → 'warning' → "Tight"
 * - surplus < 0 → 'critical' → "Drowning"
 * - no income → 'critical' → "No Income"
 */
function calculateCashFlowHealth(
  totalIncome: string,
  totalExpenses: string,
  totalMinimumPayments: string
): CashFlowHealth {
  const income = new Big(totalIncome || '0');
  const expenses = new Big(totalExpenses || '0');
  const minPayments = new Big(totalMinimumPayments || '0');

  const surplus = income.minus(expenses).minus(minPayments);

  // Handle edge case: no income
  if (income.eq(0)) {
    return {
      availableSurplus: surplus.toString(),
      status: 'critical',
      statusLabel: 'No Income',
      debtConsumptionPercent: '0',
    };
  }

  const surplusPercent = surplus.div(income).times(100);
  const debtConsumptionPercent = minPayments.div(income).times(100);

  let status: HealthStatus;
  let statusLabel: string;

  if (surplusPercent.gt(10)) {
    status = 'healthy';
    statusLabel = 'Breathing';
  } else if (surplusPercent.gte(0)) {
    status = 'warning';
    statusLabel = 'Tight';
  } else {
    status = 'critical';
    statusLabel = 'Drowning';
  }

  return {
    availableSurplus: surplus.toString(),
    status,
    statusLabel,
    debtConsumptionPercent: debtConsumptionPercent.toFixed(1),
  };
}

/**
 * Hook for computing cash flow health metrics
 *
 * Composes from useFinancialSnapshot to derive health status,
 * surplus percentage, and debt consumption metrics.
 * All monetary calculations use big.js for precision (ADR-003).
 *
 * @example
 * ```tsx
 * const { cashFlow, isLoading, error } = useFinancialHealth();
 *
 * if (isLoading) return <Skeleton />;
 * if (!cashFlow) return <EmptyState />;
 *
 * return (
 *   <HealthCard
 *     value={formatCurrency(cashFlow.availableSurplus)}
 *     status={cashFlow.status}
 *     statusLabel={cashFlow.statusLabel}
 *   />
 * );
 * ```
 */
export function useFinancialHealth(): UseFinancialHealthReturn {
  const { snapshot, isLoading } = useFinancialSnapshot();

  const cashFlow = useMemo<CashFlowHealth | null>(() => {
    // Return null if no data yet
    if (
      snapshot.totalMonthlyIncome === '0' &&
      snapshot.totalMonthlyExpenses === '0' &&
      snapshot.minimumDebtPayments === '0'
    ) {
      return null;
    }

    try {
      return calculateCashFlowHealth(
        snapshot.totalMonthlyIncome,
        snapshot.totalMonthlyExpenses,
        snapshot.minimumDebtPayments
      );
    } catch {
      return null;
    }
  }, [
    snapshot.totalMonthlyIncome,
    snapshot.totalMonthlyExpenses,
    snapshot.minimumDebtPayments,
  ]);

  return {
    cashFlow,
    isLoading,
    error: null,
  };
}
