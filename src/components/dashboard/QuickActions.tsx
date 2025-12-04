import { RefreshCw, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/uiStore';
import { useAccounts } from '@/hooks/useAccounts';

/**
 * QuickActions - Quick action buttons for dashboard navigation
 *
 * Provides buttons for common actions:
 * - "Update Balances" - navigates to Data Entry page
 * - "View Full Comparison" - navigates to Compare page (disabled if no accounts)
 *
 * @example
 * ```tsx
 * <QuickActions />
 * ```
 */
export function QuickActions() {
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);
  const { accounts } = useAccounts();
  const hasAccounts = accounts.length > 0;

  return (
    <div className="flex flex-wrap gap-3" data-testid="quick-actions">
      <Button
        onClick={() => setCurrentPage('data-entry')}
        className="transition-transform hover:scale-[1.02]"
      >
        <RefreshCw className="h-4 w-4" />
        Update Balances
      </Button>
      <Button
        variant="secondary"
        onClick={() => setCurrentPage('compare')}
        disabled={!hasAccounts}
        className="transition-transform hover:scale-[1.02]"
        title={!hasAccounts ? 'Add accounts first to compare strategies' : undefined}
      >
        <BarChart3 className="h-4 w-4" />
        View Full Comparison
      </Button>
    </div>
  );
}
