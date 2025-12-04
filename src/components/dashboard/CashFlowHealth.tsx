import { CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import { HealthCard } from './HealthCard';
import { useFinancialHealth } from '@/hooks/useFinancialHealth';
import { formatCurrency } from '@/lib/format/currency';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import type { HealthStatus } from '@/types/financial-health';

/**
 * Map health status to corresponding icon component
 */
const statusIcons: Record<HealthStatus, React.ReactNode> = {
  healthy: <CheckCircle />,
  warning: <AlertTriangle />,
  critical: <XCircle />,
};

/**
 * Loading skeleton for CashFlowHealth card
 */
function CashFlowHealthSkeleton() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">Cash Flow Health</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Skeleton className="h-9 w-32 mb-2" />
        <Skeleton className="h-5 w-24 mb-2" />
        <Skeleton className="h-4 w-40" />
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no financial data exists
 */
function CashFlowHealthEmpty() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-teal-600 text-white py-4">
        <CardTitle className="text-lg font-medium">Cash Flow Health</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <p className="text-slate-500">
          Add income and expenses to see your cash flow health.
        </p>
      </CardContent>
    </Card>
  );
}

/**
 * CashFlowHealth - Displays cash flow health metrics
 *
 * Shows monthly surplus, health status indicator (Breathing/Tight/Drowning),
 * and debt consumption percentage. Part of Epic 3 "Three Numbers" dashboard.
 *
 * @example
 * ```tsx
 * <CashFlowHealth />
 * ```
 */
export function CashFlowHealth() {
  const { cashFlow, isLoading } = useFinancialHealth();

  if (isLoading) {
    return <CashFlowHealthSkeleton />;
  }

  if (!cashFlow) {
    return <CashFlowHealthEmpty />;
  }

  const icon = statusIcons[cashFlow.status];
  const subtitle = `${cashFlow.debtConsumptionPercent}% of income to debt`;

  return (
    <HealthCard
      title="Cash Flow Health"
      value={formatCurrency(cashFlow.availableSurplus)}
      status={cashFlow.status}
      statusLabel={cashFlow.statusLabel}
      icon={icon}
      subtitle={subtitle}
    />
  );
}
