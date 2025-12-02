import { z } from 'zod';

/**
 * Flexi facility type enum for validation
 */
export const flexiFacilityTypeSchema = z.enum(['fnb_flexi', 'standard_bank_access']);

/**
 * Zod schema for flexi facility form validation
 *
 * Input values:
 * - creditLimit: numeric string >= 0
 * - currentBalance: numeric string (can be negative for available credit)
 * - interestRate: percentage string 0-100 (converted to decimal on save)
 */
export const flexiFacilityFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Facility name is required')
    .max(100, 'Facility name must be 100 characters or less'),
  type: flexiFacilityTypeSchema,
  creditLimit: z
    .string()
    .min(1, 'Credit limit is required')
    .refine(
      (val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 0,
      'Credit limit must be a non-negative number'
    ),
  currentBalance: z
    .string()
    .min(1, 'Current balance is required')
    .refine(
      (val) => !isNaN(parseFloat(val)),
      'Current balance must be a valid number'
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
});

/**
 * Type inferred from the flexi facility form schema
 */
export type FlexiFacilityFormValues = z.infer<typeof flexiFacilityFormSchema>;

/**
 * Convert form values to database format
 * - Converts interest rate from percentage to decimal
 */
export function formValuesToFlexiFacility(
  values: FlexiFacilityFormValues
): Omit<FlexiFacilityFormValues, 'interestRate'> & { interestRate: string } {
  const rate = parseFloat(values.interestRate);
  return {
    ...values,
    interestRate: (rate / 100).toString(),
  };
}

/**
 * Convert database flexi facility to form values
 * - Converts interest rate from decimal to percentage
 */
export function flexiFacilityToFormValues<T extends { interestRate: string }>(facility: T): T {
  const rate = parseFloat(facility.interestRate);
  return {
    ...facility,
    interestRate: (rate * 100).toString(),
  };
}
