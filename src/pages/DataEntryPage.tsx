import { useState } from 'react';
import { RefreshCw, List } from 'lucide-react';
import {
  AccountList,
  FlexiFacilitySection,
  IncomeSection,
  ExpenseSection,
  FinancialSnapshot,
  QuickBalanceUpdate,
} from '@/components/accounts';
import { Button } from '@/components/ui/button';

export function DataEntryPage() {
  const [showQuickUpdate, setShowQuickUpdate] = useState(false);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Data Entry</h1>
        <Button
          variant={showQuickUpdate ? 'default' : 'outline'}
          size="sm"
          onClick={() => setShowQuickUpdate(!showQuickUpdate)}
          className="gap-2"
        >
          {showQuickUpdate ? (
            <>
              <List className="h-4 w-4" />
              Full View
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4" />
              Update Balances
            </>
          )}
        </Button>
      </div>

      <section className="mb-8">
        <FinancialSnapshot />
      </section>

      {showQuickUpdate ? (
        <section className="mb-8">
          <QuickBalanceUpdate />
        </section>
      ) : (
        <>
          <section className="mb-8">
            <AccountList />
          </section>
          <section className="mb-8">
            <FlexiFacilitySection />
          </section>
          <section className="mb-8">
            <IncomeSection />
          </section>
          <section className="mb-8">
            <ExpenseSection />
          </section>
        </>
      )}
    </div>
  );
}
