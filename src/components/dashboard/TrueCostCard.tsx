import { AlertTriangle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useTrueCost } from '@/hooks/useTrueCost';
import { formatCurrency } from '@/lib/format/currency';

/**
 * Loading skeleton for TrueCostCard
 */
function TrueCostCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">True Cost of Debt</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-5 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no debt accounts exist
 */
function TrueCostCardEmpty() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">True Cost of Debt</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-500">
          Add debt accounts to see how much interest you're paying.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * TrueCostCard - Displays true cost of debt metrics
 *
 * Shows monthly interest charges, annual interest projection, and
 * interest-to-income ratio. Displays warning when ratio exceeds 20%.
 * Interest values shown in red for honest truth-telling (per UX spec).
 *
 * Part of Epic 3 "Three Numbers" dashboard (slot 3).
 *
 * @example
 * ```tsx
 * <TrueCostCard />
 * ```
 */
export function TrueCostCard() {
  const { trueCost, isLoading } = useTrueCost();

  if (isLoading) {
    return <TrueCostCardSkeleton />;
  }

  if (!trueCost) {
    return <TrueCostCardEmpty />;
  }

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">True Cost of Debt</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* Monthly Interest */}
          <div className="flex justify-between">
            <span className="text-slate-600">Monthly Interest</span>
            <span className="font-semibold text-red-500">
              {formatCurrency(trueCost.monthlyInterest)}
            </span>
          </div>

          {/* Annual Interest */}
          <div className="flex justify-between">
            <span className="text-slate-600">Annual Interest</span>
            <span className="font-semibold text-red-500">
              {formatCurrency(trueCost.annualInterest)}
            </span>
          </div>

          {/* Interest-to-Income Ratio */}
          <div className="flex justify-between">
            <span className="text-slate-600">Interest-to-Income</span>
            <span className="font-semibold">{trueCost.interestToIncomeRatio}%</span>
          </div>

          {/* High Debt Burden Warning */}
          {trueCost.isHighBurden && (
            <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-2 rounded">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">High debt burden</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
