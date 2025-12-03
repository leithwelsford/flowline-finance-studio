import {
  Home,
  Car,
  UtensilsCrossed,
  Zap,
  Shield,
  Clapperboard,
  MoreHorizontal,
} from 'lucide-react';
import { ExpenseCard } from './ExpenseCard';
import { formatCurrency } from '@/lib/format/currency';
import type { ExpenseEntry, ExpenseCategory } from '@/types/expense';

/**
 * Category icon mapping
 */
const CATEGORY_ICONS: Record<ExpenseCategory, React.ComponentType<{ className?: string }>> = {
  housing: Home,
  transport: Car,
  food: UtensilsCrossed,
  utilities: Zap,
  insurance: Shield,
  entertainment: Clapperboard,
  other: MoreHorizontal,
};

/**
 * Category label mapping
 */
const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  transport: 'Transport',
  food: 'Food',
  utilities: 'Utilities',
  insurance: 'Insurance',
  entertainment: 'Entertainment',
  other: 'Other',
};

/**
 * Category order for consistent display
 */
const CATEGORY_ORDER: ExpenseCategory[] = [
  'housing',
  'transport',
  'food',
  'utilities',
  'insurance',
  'entertainment',
  'other',
];

interface ExpenseListProps {
  expenses: ExpenseEntry[];
  expensesByCategory: Map<ExpenseCategory, string>;
  totalMonthlyExpenses: string;
  onEdit?: (expense: ExpenseEntry) => void;
  onDelete?: (expense: ExpenseEntry) => void;
}

export function ExpenseList({
  expenses,
  expensesByCategory,
  totalMonthlyExpenses,
  onEdit,
  onDelete,
}: ExpenseListProps) {
  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No expenses added yet
      </div>
    );
  }

  // Group expenses by category
  const groupedExpenses = new Map<ExpenseCategory, ExpenseEntry[]>();
  for (const expense of expenses) {
    const existing = groupedExpenses.get(expense.category) || [];
    groupedExpenses.set(expense.category, [...existing, expense]);
  }

  // Get ordered categories that have expenses
  const orderedCategories = CATEGORY_ORDER.filter((cat) => groupedExpenses.has(cat));

  return (
    <div className="space-y-6">
      {orderedCategories.map((category) => {
        const categoryExpenses = groupedExpenses.get(category) || [];
        const categoryTotal = expensesByCategory.get(category) || '0';
        const IconComponent = CATEGORY_ICONS[category];
        const categoryLabel = CATEGORY_LABELS[category];

        return (
          <div key={category} className="space-y-3">
            {/* Category Header */}
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <IconComponent className="h-5 w-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">{categoryLabel}</h3>
                <span className="text-sm text-muted-foreground">
                  ({categoryExpenses.length} {categoryExpenses.length === 1 ? 'item' : 'items'})
                </span>
              </div>
              <span className="font-semibold text-red-600">
                {formatCurrency(categoryTotal)}
              </span>
            </div>

            {/* Expense Cards in this category */}
            <div className="grid gap-3 pl-4">
              {categoryExpenses.map((expense) => (
                <ExpenseCard
                  key={expense.id}
                  expense={expense}
                  onEdit={() => onEdit?.(expense)}
                  onDelete={() => onDelete?.(expense)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {/* Total Monthly Expenses */}
      <div className="flex justify-between items-center p-4 bg-muted rounded-lg">
        <span className="font-semibold text-lg">Total Monthly Expenses</span>
        <span className="font-bold text-xl text-red-600">
          {formatCurrency(totalMonthlyExpenses)}
        </span>
      </div>
    </div>
  );
}
