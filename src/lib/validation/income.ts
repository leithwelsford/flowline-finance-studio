import { z } from 'zod';

/**
 * Zod schema for income form validation
 *
 * Input values:
 * - source: required string, min 1 character
 * - amount: numeric string >= 0
 * - paymentDate: optional number 1-31
 */
export const incomeFormSchema = z.object({
  source: z
    .string()
    .min(1, 'Income source is required')
    .max(100, 'Income source must be 100 characters or less'),
  amount: z
    .string()
    .min(1, 'Monthly amount is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Amount must be a non-negative number'
    ),
  paymentDate: z
    .number()
    .int()
    .min(1, 'Payment date must be between 1 and 31')
    .max(31, 'Payment date must be between 1 and 31')
    .optional(),
});

/**
 * Type inferred from the income form schema
 */
export type IncomeFormValues = z.infer<typeof incomeFormSchema>;

/**
 * Convert form values to database format
 */
export function formValuesToIncome(
  values: IncomeFormValues
): { source: string; amount: string; paymentDate?: number } {
  return {
    source: values.source,
    amount: values.amount,
    ...(values.paymentDate !== undefined && { paymentDate: values.paymentDate }),
  };
}

/**
 * Convert database income entry to form values
 */
export function incomeToFormValues<T extends { source: string; amount: string; paymentDate?: number }>(
  income: T
): IncomeFormValues {
  return {
    source: income.source,
    amount: income.amount,
    paymentDate: income.paymentDate,
  };
}
