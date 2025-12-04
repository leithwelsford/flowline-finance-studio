import {
  DashboardHeader,
  ThreeNumbersGrid,
  QuickActions,
  EmptyState,
} from '@/components/dashboard';
import { useAccounts } from '@/hooks/useAccounts';

/**
 * DashboardPage - Primary landing page with financial health overview
 *
 * Shows the Three Numbers Grid (CashFlowHealth, IncomeExpenseCard, TrueCostCard)
 * when accounts exist, or an EmptyState when no accounts are present.
 *
 * This is the default page shown when the application loads.
 *
 * @example
 * ```tsx
 * <DashboardPage />
 * ```
 */
export function DashboardPage() {
  const { accounts, isLoading } = useAccounts();
  const hasAccounts = accounts.length > 0;

  return (
    <div className="space-y-6" data-testid="dashboard-page">
      <DashboardHeader />

      {isLoading ? (
        <ThreeNumbersGrid isLoading />
      ) : hasAccounts ? (
        <>
          <ThreeNumbersGrid />
          <QuickActions />
        </>
      ) : (
        <EmptyState />
      )}
    </div>
  );
}
