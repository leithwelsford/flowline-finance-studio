import { Home, Car, Wallet, CreditCard, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/lib/format/currency';
import type { DebtAccount, AccountType } from '@/types/account';

const ACCOUNT_TYPE_ICONS: Record<AccountType, React.ReactNode> = {
  home_loan: <Home className="h-5 w-5" />,
  vehicle_finance: <Car className="h-5 w-5" />,
  personal_loan: <Wallet className="h-5 w-5" />,
  credit_card: <CreditCard className="h-5 w-5" />,
};

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  home_loan: 'Home Loan',
  vehicle_finance: 'Vehicle Finance',
  personal_loan: 'Personal Loan',
  credit_card: 'Credit Card',
};

interface AccountCardProps {
  account: DebtAccount;
  onEdit?: (account: DebtAccount) => void;
  onDelete?: (account: DebtAccount) => void;
}

export function AccountCard({ account, onEdit, onDelete }: AccountCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            {ACCOUNT_TYPE_ICONS[account.type]}
          </span>
          <h3 className="font-semibold text-lg">{account.name}</h3>
        </div>
        <Badge variant="secondary">{ACCOUNT_TYPE_LABELS[account.type]}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Current Balance</span>
            <span className="font-semibold text-lg">
              {formatCurrency(account.balance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Interest Rate</span>
            <span className="font-medium">
              {formatPercentage(account.interestRate, true)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Min. Payment</span>
            <span className="font-medium">
              {formatCurrency(account.minimumPayment)}
            </span>
          </div>
          {account.lender && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground text-sm">Lender</span>
              <span className="font-medium">{account.lender}</span>
            </div>
          )}
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit?.(account)}
          >
            <Pencil className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="flex-1 text-destructive hover:text-destructive"
            onClick={() => onDelete?.(account)}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
