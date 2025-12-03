import {
  AccountList,
  FlexiFacilitySection,
  IncomeSection,
  ExpenseSection,
  FinancialSnapshot,
} from '@/components/accounts';

export function DataEntryPage() {
  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Data Entry</h1>
      <section className="mb-8">
        <FinancialSnapshot />
      </section>
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
    </div>
  );
}
