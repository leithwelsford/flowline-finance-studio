import { Landmark, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatPercentage } from '@/lib/format/currency';
import type { FlexiFacility, FlexiFacilityType } from '@/types/flexi-facility';
import Big from 'big.js';

const FACILITY_TYPE_LABELS: Record<FlexiFacilityType, string> = {
  fnb_flexi: 'FNB Flexi Option',
  standard_bank_access: 'Standard Bank Access Bond',
};

interface FlexiFacilityCardProps {
  facility: FlexiFacility;
  availableCredit: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function FlexiFacilityCard({
  facility,
  availableCredit,
  onEdit,
  onDelete,
}: FlexiFacilityCardProps) {
  const isNegativeAvailable = new Big(availableCredit).lt(0);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">
            <Landmark className="h-5 w-5" />
          </span>
          <h3 className="font-semibold text-lg">{facility.name}</h3>
        </div>
        <Badge variant="secondary">{FACILITY_TYPE_LABELS[facility.type]}</Badge>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Credit Limit</span>
            <span className="font-semibold text-lg">
              {formatCurrency(facility.creditLimit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Current Balance</span>
            <span className="font-medium">{formatCurrency(facility.currentBalance)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Available Credit</span>
            <span
              className={`font-semibold ${isNegativeAvailable ? 'text-destructive' : 'text-green-600'}`}
            >
              {formatCurrency(availableCredit)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground text-sm">Interest Rate</span>
            <span className="font-medium">
              {formatPercentage(facility.interestRate, true)}
            </span>
          </div>
        </div>
        <div className="flex gap-2 mt-4 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onEdit}
          >
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
