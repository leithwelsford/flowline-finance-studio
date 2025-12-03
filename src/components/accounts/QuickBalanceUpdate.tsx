import { useCallback } from 'react';
import { RefreshCw, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BalanceUpdateRow } from './BalanceUpdateRow';
import { useAccounts } from '@/hooks/useAccounts';
import { useFlexiFacility } from '@/hooks/useFlexiFacility';

/**
 * QuickBalanceUpdate component
 *
 * Displays a streamlined view of all accounts and flexi facility
 * with inline balance editing and auto-save functionality.
 * Fulfills FR5 and FR51 requirements for quick weekly balance updates.
 */
export function QuickBalanceUpdate() {
  const { accounts, isLoading: accountsLoading, updateAccountBalance } = useAccounts();
  const { facility, isLoading: flexiLoading, updateFlexiBalance } = useFlexiFacility();

  const isLoading = accountsLoading || flexiLoading;

  /**
   * Handle saving account balance
   */
  const handleAccountSave = useCallback(
    async (id: number, newBalance: string) => {
      const result = await updateAccountBalance(id, newBalance);
      if (!result.success) {
        throw result.error;
      }
    },
    [updateAccountBalance]
  );

  /**
   * Handle saving flexi facility balance
   */
  const handleFlexiSave = useCallback(
    async (_id: number, newBalance: string) => {
      const result = await updateFlexiBalance(newBalance);
      if (!result.success) {
        throw result.error;
      }
    },
    [updateFlexiBalance]
  );

  const isEmpty = accounts.length === 0 && !facility;

  if (isLoading) {
    return (
      <Card data-testid="quick-balance-update">
        <CardHeader className="border-b border-teal-600/20 bg-teal-50/50">
          <CardTitle className="flex items-center gap-2 text-teal-700">
            <RefreshCw className="h-5 w-5" />
            Quick Balance Update
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-slate-600">Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-testid="quick-balance-update">
      <CardHeader className="border-b border-teal-600/20 bg-teal-50/50">
        <CardTitle className="flex items-center gap-2 text-teal-700">
          <RefreshCw className="h-5 w-5" />
          Quick Balance Update
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        {isEmpty ? (
          <div className="text-center py-4" data-testid="empty-state">
            <p className="text-slate-600">
              Add accounts or a flexi facility to update balances.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {/* Debt accounts section */}
            {accounts.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3">
                  Debt Accounts
                </h3>
                <div className="space-y-1">
                  {accounts.map((account) => (
                    <BalanceUpdateRow
                      key={account.id}
                      id={account.id!}
                      name={account.name}
                      type={account.type}
                      currentBalance={account.balance}
                      lastBalanceUpdated={account.lastBalanceUpdated}
                      onSave={handleAccountSave}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Flexi facility section */}
            {facility && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Flexi Facility
                </h3>
                <BalanceUpdateRow
                  id={facility.id!}
                  name={facility.name}
                  type="flexi"
                  currentBalance={facility.currentBalance}
                  lastBalanceUpdated={facility.lastBalanceUpdated}
                  onSave={handleFlexiSave}
                />
              </div>
            )}

            {/* Help text */}
            <p className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-100">
              Edit balances directly and click away or press Enter to save. Changes auto-save immediately.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
