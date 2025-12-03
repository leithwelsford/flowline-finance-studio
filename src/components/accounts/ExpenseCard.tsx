import { Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format/currency';
import type { ExpenseEntry } from '@/types/expense';

interface ExpenseCardProps {
  expense: ExpenseEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * Individual expense card displayed within a category group.
 * Shows amount, optional description, and action buttons.
 * Category label is not shown since cards are already grouped by category.
 */
export function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  return (
    <Card>
      <CardContent className="pt-4">
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Monthly Amount</span>
            <span className="font-semibold text-lg text-red-600">
              {formatCurrency(expense.amount)}
            </span>
          </div>
          {expense.description && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Description</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {expense.description}
              </span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button variant="outline" size="sm" className="flex-1" onClick={onEdit}>
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
