import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  accountFormSchema,
  formValuesToAccount,
  accountToFormValues,
  type AccountFormValues,
} from '@/lib/validation/account';
import { useAccounts, type NewAccountData } from '@/hooks/useAccounts';
import type { DebtAccount } from '@/types/account';

const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  home_loan: 'Home Loan',
  vehicle_finance: 'Vehicle Finance',
  personal_loan: 'Personal Loan',
  credit_card: 'Credit Card',
};

interface AccountFormProps {
  account?: DebtAccount;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountForm({ account, onSuccess, onCancel }: AccountFormProps) {
  const { addAccount, updateAccount } = useAccounts();
  const isEditMode = !!account;

  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: account
      ? (accountToFormValues(account) as AccountFormValues)
      : {
          name: '',
          type: 'home_loan',
          balance: '',
          interestRate: '',
          minimumPayment: '',
          lender: '',
          interestType: 'monthly',
        },
  });

  const onSubmit = async (values: AccountFormValues) => {
    const accountData = formValuesToAccount(values) as NewAccountData;

    if (isEditMode && account?.id) {
      const result = await updateAccount(account.id, accountData);
      if (result.success) {
        toast.success('Account updated');
        onSuccess?.();
      } else {
        toast.error('Failed to update account');
      }
    } else {
      const result = await addAccount(accountData);
      if (result.success) {
        toast.success('Account saved');
        onSuccess?.();
      } else {
        toast.error('Failed to save account');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Home Loan - ABSA" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Account Type *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.entries(ACCOUNT_TYPE_LABELS).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="balance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Balance (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 500000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="interestRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Annual Interest Rate (%) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  placeholder="e.g., 11.5"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="minimumPayment"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Monthly Payment (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 5000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="lender"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lender Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., ABSA, Standard Bank" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditMode ? 'Update Account' : 'Save Account'}
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
}
