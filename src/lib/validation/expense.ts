import { z } from 'zod';
import type { ExpenseCategory } from '@/types/expense';

/**
 * Expense categories enum for Zod validation
 */
export const expenseCategorySchema = z.enum([
  'housing',
  'transport',
  'food',
  'utilities',
  'insurance',
  'entertainment',
  'other',
]);

/**
 * Zod schema for expense form validation
 *
 * Input values:
 * - category: required ExpenseCategory enum value
 * - amount: numeric string >= 0
 * - description: optional string
 */
export const expenseFormSchema = z.object({
  category: expenseCategorySchema,
  amount: z
    .string()
    .min(1, 'Monthly amount is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Amount must be a non-negative number'
    ),
  description: z.string().optional(),
});

/**
 * Type inferred from the expense form schema
 */
export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

/**
 * Convert form values to database format
 */
export function formValuesToExpense(
  values: ExpenseFormValues
): { category: ExpenseCategory; amount: string; description?: string } {
  return {
    category: values.category,
    amount: values.amount,
    ...(values.description && { description: values.description }),
  };
}

/**
 * Convert database expense entry to form values
 */
export function expenseToFormValues<
  T extends { category: ExpenseCategory; amount: string; description?: string },
>(expense: T): ExpenseFormValues {
  return {
    category: expense.category,
    amount: expense.amount,
    description: expense.description,
  };
}
