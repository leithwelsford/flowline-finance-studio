import { Wallet, Pencil, Trash2, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatCurrency } from '@/lib/format/currency';
import type { IncomeEntry } from '@/types/income';

/**
 * Format payment date with ordinal suffix
 * e.g., 1 -> "1st of month", 25 -> "25th of month"
 */
function formatPaymentDate(day?: number): string {
  if (!day) return '';
  const suffix =
    day === 1 || day === 21 || day === 31
      ? 'st'
      : day === 2 || day === 22
        ? 'nd'
        : day === 3 || day === 23
          ? 'rd'
          : 'th';
  return `${day}${suffix} of month`;
}

interface IncomeCardProps {
  income: IncomeEntry;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function IncomeCard({ income, onEdit, onDelete }: IncomeCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            <Wallet className="h-5 w-5" />
          </span>
          <h3 className="font-semibold text-lg">{income.source}</h3>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Monthly Amount</span>
            <span className="font-semibold text-lg text-green-600">
              {formatCurrency(income.amount)}
            </span>
          </div>
          {income.paymentDate && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Payment Date
              </span>
              <span className="font-medium">{formatPaymentDate(income.paymentDate)}</span>
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
