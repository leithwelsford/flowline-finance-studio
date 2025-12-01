import { z } from 'zod';

/**
 * Account types enum for validation
 */
export const accountTypeSchema = z.enum([
  'home_loan',
  'vehicle_finance',
  'personal_loan',
  'credit_card',
]);

/**
 * Interest type enum for validation
 */
export const interestTypeSchema = z.enum(['monthly', 'daily']);

/**
 * Zod schema for account form validation
 *
 * Input values:
 * - balance, minimumPayment: numeric strings >= 0
 * - interestRate: percentage string 0-100 (converted to decimal on save)
 */
export const accountFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Account name is required')
    .max(100, 'Account name must be 100 characters or less'),
  type: accountTypeSchema,
  balance: z
    .string()
    .min(1, 'Current balance is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Balance must be a non-negative number'
    ),
  interestRate: z
    .string()
    .min(1, 'Interest rate is required')
    .refine(
      (val) => {
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0 && num <= 100;
      },
      'Interest rate must be between 0 and 100'
    ),
  minimumPayment: z
    .string()
    .min(1, 'Minimum payment is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Minimum payment must be a non-negative number'
    ),
  lender: z.string().max(100, 'Lender name must be 100 characters or less'),
  interestType: interestTypeSchema,
});

/**
 * Type inferred from the account form schema
 */
export type AccountFormValues = z.infer<typeof accountFormSchema>;

/**
 * Convert form values to database format
 * - Converts interest rate from percentage to decimal
 */
export function formValuesToAccount(values: AccountFormValues): Omit<AccountFormValues, 'interestRate'> & { interestRate: string } {
  const rate = parseFloat(values.interestRate);
  return {
    ...values,
    interestRate: (rate / 100).toString(),
  };
}

/**
 * Convert database account to form values
 * - Converts interest rate from decimal to percentage
 */
export function accountToFormValues<T extends { interestRate: string }>(account: T): T {
  const rate = parseFloat(account.interestRate);
  return {
    ...account,
    interestRate: (rate * 100).toString(),
  };
}
