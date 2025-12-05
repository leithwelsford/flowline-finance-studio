import { z } from 'zod';

/**
 * Payment frequency enum for validation
 */
export const paymentFrequencySchema = z.enum(['monthly', 'bi-weekly', 'weekly']);

/**
 * Zod schema for strategy configuration form validation
 *
 * Validates:
 * - chunkAmount: optional, if present must be >= 0 (ZAR currency string)
 * - paymentFrequency: must be one of 'monthly', 'bi-weekly', 'weekly'
 * - targetAccountId: optional, if present must be a valid positive integer
 */
export const strategyConfigFormSchema = z.object({
  chunkAmount: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (val === undefined || val === '' || val === null) return true;
        const num = parseFloat(val);
        return !isNaN(num) && num >= 0;
      },
      'Chunk amount must be a non-negative number if provided'
    )
    .transform((val) => (val === '' ? undefined : val)),
  paymentFrequency: paymentFrequencySchema,
  targetAccountId: z
    .union([z.number().int().positive(), z.null()])
    .optional()
    .transform((val) => val ?? null),
});

/**
 * Type inferred from the strategy config form schema
 */
export type StrategyConfigFormValues = z.infer<typeof strategyConfigFormSchema>;

/**
 * Convert form values to database format (StrategyConfigData)
 *
 * Transforms:
 * - chunkAmount: empty string or undefined → null
 * - targetAccountId: undefined → null
 */
export function formValuesToStrategyConfig(
  values: StrategyConfigFormValues
): {
  chunkAmount: string | null;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  targetAccountId: number | null;
} {
  return {
    chunkAmount: values.chunkAmount || null,
    paymentFrequency: values.paymentFrequency,
    targetAccountId: values.targetAccountId ?? null,
  };
}

/**
 * Convert database strategy config to form values
 *
 * Transforms:
 * - chunkAmount: null → empty string
 * - targetAccountId: null → null (kept for Select component)
 * - undefined config → default values
 */
export function strategyConfigToFormValues(config?: {
  chunkAmount: string | null;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  targetAccountId: number | null;
}): {
  chunkAmount: string;
  paymentFrequency: 'monthly' | 'bi-weekly' | 'weekly';
  targetAccountId: number | null;
} {
  if (!config) {
    return {
      chunkAmount: '',
      paymentFrequency: 'monthly',
      targetAccountId: null,
    };
  }
  return {
    chunkAmount: config.chunkAmount ?? '',
    paymentFrequency: config.paymentFrequency,
    targetAccountId: config.targetAccountId,
  };
}
