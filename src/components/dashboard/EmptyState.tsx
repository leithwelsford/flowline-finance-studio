import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUIStore } from '@/store/uiStore';

/**
 * EmptyState - Friendly empty state for dashboard when no accounts exist
 *
 * Displays a welcoming message encouraging the user to add their first account.
 * Uses "Hope" emotional design principle - showing the path forward, not criticism.
 *
 * @example
 * ```tsx
 * <EmptyState />
 * ```
 */
export function EmptyState() {
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);

  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      data-testid="dashboard-empty-state"
    >
      <Wallet className="h-16 w-16 text-slate-300 mb-4" />
      <h2 className="text-xl font-semibold text-slate-700 mb-2">
        Let's get started!
      </h2>
      <p className="text-slate-500 mb-6 max-w-md">
        Add your first account to see your financial health dashboard
      </p>
      <Button onClick={() => setCurrentPage('data-entry')}>
        Add Your First Account
      </Button>
    </div>
  );
}
