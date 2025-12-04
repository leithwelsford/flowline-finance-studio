import Big from 'big.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ProportionBar } from './ProportionBar';
import { useIncomeExpense } from '@/hooks/useIncomeExpense';
import { formatCurrency } from '@/lib/format/currency';
import { cn } from '@/lib/utils';

/**
 * Loading skeleton for IncomeExpenseCard
 */
function IncomeExpenseCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">Income vs Expenditure</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-24" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no income/expense data exists
 */
function IncomeExpenseCardEmpty() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">Income vs Expenditure</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-500">
          Add income and expenses to see how your spending compares.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * IncomeExpenseCard - Displays income vs expenditure comparison
 *
 * Shows total monthly income, expenses, discretionary amount, and savings rate.
 * Includes a visual proportion bar showing income allocation.
 * Savings rate is color-coded: green for positive, red for negative.
 *
 * Part of Epic 3 "Three Numbers" dashboard (slot 2).
 *
 * @example
 * ```tsx
 * <IncomeExpenseCard />
 * ```
 */
export function IncomeExpenseCard() {
  const { incomeExpense, isLoading } = useIncomeExpense();

  if (isLoading) {
    return <IncomeExpenseCardSkeleton />;
  }

  if (!incomeExpense) {
    return <IncomeExpenseCardEmpty />;
  }

  // Determine savings rate color: green if positive, red if negative
  const savingsRateValue = new Big(incomeExpense.savingsRate);
  const savingsRateColor = savingsRateValue.gte(0)
    ? 'text-green-500'
    : 'text-red-500';

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">Income vs Expenditure</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Total Income */}
          <div className="flex justify-between">
            <span className="text-slate-600">Total Income</span>
            <span className="font-semibold">{formatCurrency(incomeExpense.totalIncome)}</span>
          </div>

          {/* Total Expenses */}
          <div className="flex justify-between">
            <span className="text-slate-600">Total Expenses</span>
            <span className="font-semibold">{formatCurrency(incomeExpense.totalExpenses)}</span>
          </div>

          {/* Proportion Bar */}
          <ProportionBar
            income={incomeExpense.totalIncome}
            expenses={incomeExpense.totalExpenses}
          />

          {/* Discretionary Amount */}
          <div className="flex justify-between">
            <span className="text-slate-600">Discretionary</span>
            <span className="font-semibold">{formatCurrency(incomeExpense.discretionaryAmount)}</span>
          </div>

          {/* Savings Rate */}
          <div className="flex justify-between">
            <span className="text-slate-600">Savings Rate</span>
            <span className={cn('font-semibold', savingsRateColor)}>
              {incomeExpense.savingsRate}%
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
