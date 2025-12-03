import { CheckCircle, AlertTriangle, CreditCard, Wallet } from 'lucide-react';
import Big from 'big.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { SnapshotMetricCard } from './SnapshotMetricCard';
import { useFinancialSnapshot } from '@/hooks/useFinancialSnapshot';
import { formatCurrency } from '@/lib/format/currency';

/**
 * Financial snapshot summary panel
 *
 * Displays aggregated financial metrics including total debt, income,
 * expenses, minimum payments, available surplus, and flexi facility status.
 * Updates reactively via Dexie useLiveQuery hooks.
 */
export function FinancialSnapshot() {
  const { snapshot, isLoading } = useFinancialSnapshot();

  const isEmpty =
    snapshot.accountCount === 0 &&
    snapshot.totalMonthlyIncome === '0' &&
    snapshot.totalMonthlyExpenses === '0';

  // Determine surplus variant and icon
  const surplusValue = new Big(snapshot.availableSurplus);
  const surplusVariant = surplusValue.gt(0)
    ? 'positive'
    : surplusValue.lt(0)
      ? 'negative'
      : 'neutral';
  const SurplusIcon = surplusValue.gt(0)
    ? CheckCircle
    : surplusValue.lt(0)
      ? AlertTriangle
      : undefined;

  if (isLoading) {
    return (
      <Card data-testid="financial-snapshot">
        <CardHeader className="border-b border-teal-600/20 bg-teal-50/50">
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Wallet className="h-5 w-5" />
            Financial Snapshot
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="financial-snapshot">
      <CardHeader className="border-b border-teal-600/20 bg-teal-50/50">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <Wallet className="h-5 w-5" />
            Financial Snapshot
          </CardTitle>
          {snapshot.hasFlexi && (
            <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
              <CreditCard className="mr-1 h-3 w-3" />
              Flexi: {formatCurrency(snapshot.flexiAvailableCredit || '0')} available
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {isEmpty ? (
          <div className="text-center py-4" data-testid="empty-state">
            <p className="text-slate-600">
              Add accounts, income, and expenses to see your financial snapshot.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
            <SnapshotMetricCard
              label="Total Debt"
              value={formatCurrency(snapshot.totalDebt)}
            />
            <SnapshotMetricCard
              label="Total Monthly Income"
              value={formatCurrency(snapshot.totalMonthlyIncome)}
            />
            <SnapshotMetricCard
              label="Total Monthly Expenses"
              value={formatCurrency(snapshot.totalMonthlyExpenses)}
            />
            <SnapshotMetricCard
              label="Minimum Debt Payments"
              value={formatCurrency(snapshot.minimumDebtPayments)}
            />
            <SnapshotMetricCard
              label="Available Surplus"
              value={formatCurrency(snapshot.availableSurplus)}
              variant={surplusVariant}
              icon={SurplusIcon}
            />
            <SnapshotMetricCard
              label="Number of Accounts"
              value={String(snapshot.accountCount)}
              variant="neutral"
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
