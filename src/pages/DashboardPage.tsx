import { CashFlowHealth, IncomeExpenseCard } from '@/components/dashboard';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CashFlowHealth />
        <IncomeExpenseCard />
        {/* Placeholder slot for Story 3.3: True Cost of Debt */}
      </div>
    </div>
  );
}
