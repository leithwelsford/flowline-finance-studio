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
  incomeFormSchema,
  formValuesToIncome,
  incomeToFormValues,
  type IncomeFormValues,
} from '@/lib/validation/income';
import { useIncome, type NewIncomeData } from '@/hooks/useIncome';
import type { IncomeEntry } from '@/types/income';

interface IncomeFormProps {
  income?: IncomeEntry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function IncomeForm({ income, onSuccess, onCancel }: IncomeFormProps) {
  const { addIncome, updateIncome } = useIncome();
  const isEditMode = !!income;

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeFormSchema),
    defaultValues: income
      ? incomeToFormValues(income)
      : {
          source: '',
          amount: '',
          paymentDate: undefined,
        },
  });

  const onSubmit = async (values: IncomeFormValues) => {
    const incomeData = formValuesToIncome(values) as NewIncomeData;

    if (isEditMode && income?.id) {
      const result = await updateIncome(income.id, incomeData);
      if (result.success) {
        toast.success('Income source updated');
        onSuccess?.();
      } else {
        toast.error('Failed to update income source');
      }
    } else {
      const result = await addIncome(incomeData);
      if (result.success) {
        toast.success('Income source saved');
        onSuccess?.();
      } else {
        toast.error('Failed to save income source');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="source"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Income Source *</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Salary, Rental Income" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Amount (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 45000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="paymentDate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Date (Day of Month)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="1"
                  max="31"
                  step="1"
                  placeholder="e.g., 25"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => {
                    const value = e.target.value;
                    const numValue = value === '' ? undefined : parseInt(value, 10);
                    field.onChange(isNaN(numValue as number) ? undefined : numValue);
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditMode ? 'Update Income' : 'Save Income'}
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
