import { CashFlowHealth } from '@/components/dashboard';

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-slate-900">Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CashFlowHealth />
        {/* Placeholder slots for future cards (Stories 3.2, 3.3) */}
      </div>
    </div>
  );
}
