import Big from 'big.js';
import { formatCurrency } from '@/lib/format/currency';

/**
 * Props for the ProportionBar component
 */
export interface ProportionBarProps {
  /** Total income as string (for big.js) */
  income: string;
  /** Total expenses as string (for big.js) */
  expenses: string;
}

/**
 * ProportionBar - Horizontal stacked bar showing income vs expense proportions
 *
 * Displays a visual representation of how much of income goes to expenses.
 * Uses teal for income segment and slate for expense segment per UX spec.
 *
 * When expenses exceed income, shows 100% expense bar.
 *
 * @example
 * ```tsx
 * <ProportionBar income="10000" expenses="6000" />
 * // Renders bar with 40% teal (discretionary) and 60% slate (expenses)
 * ```
 */
export function ProportionBar({ income, expenses }: ProportionBarProps) {
  // Calculate percentages using big.js for precision
  const incomeValue = new Big(income || '0');
  const expenseValue = new Big(expenses || '0');

  // Handle edge case: no income
  if (incomeValue.eq(0)) {
    return (
      <div className="w-full">
        <div
          className="w-full h-4 rounded-full bg-slate-200"
          role="img"
          aria-label="No income data available"
        />
        <div className="text-xs text-slate-500 mt-1 text-center">
          No income data
        </div>
      </div>
    );
  }

  // Calculate expense percentage of income (capped at 100%)
  const expensePercent = expenseValue.gt(incomeValue)
    ? 100
    : expenseValue.div(incomeValue).times(100).toNumber();

  // Discretionary is the remaining portion
  const discretionaryPercent = 100 - expensePercent;

  return (
    <div className="w-full">
      <div
        className="w-full h-4 rounded-full overflow-hidden bg-slate-200 flex"
        role="img"
        aria-label={`Income: ${formatCurrency(income)}, Expenses: ${formatCurrency(expenses)}`}
      >
        {/* Discretionary segment (income - expenses) */}
        {discretionaryPercent > 0 && (
          <div
            className="h-full bg-teal-500"
            style={{ width: `${discretionaryPercent}%` }}
            aria-label={`Discretionary: ${discretionaryPercent.toFixed(1)}%`}
          />
        )}
        {/* Expense segment */}
        <div
          className="h-full bg-slate-400"
          style={{ width: `${expensePercent}%` }}
          aria-label={`Expenses: ${expensePercent.toFixed(1)}%`}
        />
      </div>
      <div className="flex justify-between text-xs text-slate-500 mt-1">
        <span>Discretionary: {discretionaryPercent.toFixed(0)}%</span>
        <span>Expenses: {expensePercent.toFixed(0)}%</span>
      </div>
    </div>
  );
}
