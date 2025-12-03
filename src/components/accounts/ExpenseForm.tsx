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
  expenseFormSchema,
  formValuesToExpense,
  expenseToFormValues,
  type ExpenseFormValues,
} from '@/lib/validation/expense';
import { useExpenses, type NewExpenseData } from '@/hooks/useExpenses';
import type { ExpenseEntry, ExpenseCategory } from '@/types/expense';

/**
 * Expense category options for the dropdown
 */
const EXPENSE_CATEGORIES: { value: ExpenseCategory; label: string }[] = [
  { value: 'housing', label: 'Housing' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'utilities', label: 'Utilities' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'other', label: 'Other' },
];

interface ExpenseFormProps {
  expense?: ExpenseEntry;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ExpenseForm({ expense, onSuccess, onCancel }: ExpenseFormProps) {
  const { addExpense, updateExpense } = useExpenses();
  const isEditMode = !!expense;

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: expense
      ? expenseToFormValues(expense)
      : {
          category: undefined,
          amount: '',
          description: '',
        },
  });

  const onSubmit = async (values: ExpenseFormValues) => {
    const expenseData = {
      ...formValuesToExpense(values),
      date: new Date().toISOString().split('T')[0],
    } as NewExpenseData;

    if (isEditMode && expense?.id) {
      const result = await updateExpense(expense.id, expenseData);
      if (result.success) {
        toast.success('Expense updated');
        onSuccess?.();
      } else {
        toast.error('Failed to update expense');
      }
    } else {
      const result = await addExpense(expenseData);
      if (result.success) {
        toast.success('Expense saved');
        onSuccess?.();
      } else {
        toast.error('Failed to save expense');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category *</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {EXPENSE_CATEGORIES.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Monthly Amount (ZAR) *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="e.g., 12000"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., Monthly rent payment"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 pt-4">
          <Button type="submit" className="flex-1">
            {isEditMode ? 'Update Expense' : 'Save Expense'}
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
