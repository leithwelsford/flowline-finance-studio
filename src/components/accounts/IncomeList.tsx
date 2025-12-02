import { IncomeCard } from './IncomeCard';
import { formatCurrency } from '@/lib/format/currency';
import type { IncomeEntry } from '@/types/income';

interface IncomeListProps {
  incomeEntries: IncomeEntry[];
  totalMonthlyIncome: string;
  onEdit?: (income: IncomeEntry) => void;
  onDelete?: (income: IncomeEntry) => void;
}

export function IncomeList({
  incomeEntries,
  totalMonthlyIncome,
  onEdit,
  onDelete,
}: IncomeListProps) {
  if (incomeEntries.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No income sources added yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {incomeEntries.map((income) => (
          <IncomeCard
            key={income.id}
            income={income}
            onEdit={() => onEdit?.(income)}
            onDelete={() => onDelete?.(income)}
          />
        ))}
      </div>

      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
        <span className="font-semibold text-lg">Total Monthly Income</span>
        <span className="font-bold text-xl text-green-600">
          {formatCurrency(totalMonthlyIncome)}
        </span>
      </div>
    </div>
  );
}
