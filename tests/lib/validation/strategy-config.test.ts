/**
 * Strategy Config Validation Tests (AC-4.7.9)
 *
 * Tests for Zod validation schema and form value converters
 */
import { describe, it, expect } from 'vitest';
import {
  strategyConfigFormSchema,
  paymentFrequencySchema,
  formValuesToStrategyConfig,
  strategyConfigToFormValues,
} from '@/lib/validation/strategy-config';
import type { StrategyConfigData } from '@/types/strategy-config';

describe('Strategy Config Validation (AC-4.7.9)', () => {
  describe('paymentFrequencySchema', () => {
    it('accepts "monthly"', () => {
      const result = paymentFrequencySchema.safeParse('monthly');
      expect(result.success).toBe(true);
    });

    it('accepts "bi-weekly"', () => {
      const result = paymentFrequencySchema.safeParse('bi-weekly');
      expect(result.success).toBe(true);
    });

    it('accepts "weekly"', () => {
      const result = paymentFrequencySchema.safeParse('weekly');
      expect(result.success).toBe(true);
    });

    it('rejects invalid frequency', () => {
      const result = paymentFrequencySchema.safeParse('daily');
      expect(result.success).toBe(false);
    });
  });

  describe('strategyConfigFormSchema', () => {
    describe('chunkAmount validation', () => {
      it('accepts empty string (uses full surplus)', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('accepts valid positive number string', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '5000',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('accepts decimal amounts', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '1500.50',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('rejects negative amounts', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '-100',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(false);
      });

      it('rejects non-numeric strings', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: 'abc',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(false);
      });

      it('accepts zero amount', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '0',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });
    });

    describe('paymentFrequency validation', () => {
      it('accepts monthly', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('accepts bi-weekly', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'bi-weekly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('accepts weekly', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'weekly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('rejects invalid frequency', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'quarterly',
          targetAccountId: null,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('targetAccountId validation', () => {
      it('accepts null (use strategy default)', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });

      it('accepts positive integer', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: 5,
        });
        expect(result.success).toBe(true);
      });

      it('rejects negative integer', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: -1,
        });
        expect(result.success).toBe(false);
      });

      it('rejects zero', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: 0,
        });
        expect(result.success).toBe(false);
      });

      it('rejects decimal numbers', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: 1.5,
        });
        expect(result.success).toBe(false);
      });
    });

    describe('complete form validation', () => {
      it('validates complete valid form', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '3000',
          paymentFrequency: 'bi-weekly',
          targetAccountId: 2,
        });
        expect(result.success).toBe(true);
      });

      it('validates form with all defaults', () => {
        const result = strategyConfigFormSchema.safeParse({
          chunkAmount: '',
          paymentFrequency: 'monthly',
          targetAccountId: null,
        });
        expect(result.success).toBe(true);
      });
    });
  });

  describe('formValuesToStrategyConfig', () => {
    it('converts empty chunkAmount to null', () => {
      const result = formValuesToStrategyConfig({
        chunkAmount: '',
        paymentFrequency: 'monthly',
        targetAccountId: null,
      });

      expect(result.chunkAmount).toBeNull();
    });

    it('preserves chunkAmount string value', () => {
      const result = formValuesToStrategyConfig({
        chunkAmount: '5000',
        paymentFrequency: 'monthly',
        targetAccountId: null,
      });

      expect(result.chunkAmount).toBe('5000');
    });

    it('preserves payment frequency', () => {
      const result = formValuesToStrategyConfig({
        chunkAmount: '',
        paymentFrequency: 'bi-weekly',
        targetAccountId: null,
      });

      expect(result.paymentFrequency).toBe('bi-weekly');
    });

    it('preserves targetAccountId', () => {
      const result = formValuesToStrategyConfig({
        chunkAmount: '',
        paymentFrequency: 'monthly',
        targetAccountId: 3,
      });

      expect(result.targetAccountId).toBe(3);
    });

    it('handles complete conversion', () => {
      const result = formValuesToStrategyConfig({
        chunkAmount: '2500.50',
        paymentFrequency: 'weekly',
        targetAccountId: 7,
      });

      expect(result).toEqual({
        chunkAmount: '2500.50',
        paymentFrequency: 'weekly',
        targetAccountId: 7,
      });
    });
  });

  describe('strategyConfigToFormValues', () => {
    it('converts null chunkAmount to empty string', () => {
      const config: StrategyConfigData = {
        chunkAmount: null,
        paymentFrequency: 'monthly',
        targetAccountId: null,
      };

      const result = strategyConfigToFormValues(config);

      expect(result.chunkAmount).toBe('');
    });

    it('preserves chunkAmount string value', () => {
      const config: StrategyConfigData = {
        chunkAmount: '3000',
        paymentFrequency: 'monthly',
        targetAccountId: null,
      };

      const result = strategyConfigToFormValues(config);

      expect(result.chunkAmount).toBe('3000');
    });

    it('preserves payment frequency', () => {
      const config: StrategyConfigData = {
        chunkAmount: null,
        paymentFrequency: 'weekly',
        targetAccountId: null,
      };

      const result = strategyConfigToFormValues(config);

      expect(result.paymentFrequency).toBe('weekly');
    });

    it('preserves targetAccountId', () => {
      const config: StrategyConfigData = {
        chunkAmount: null,
        paymentFrequency: 'monthly',
        targetAccountId: 5,
      };

      const result = strategyConfigToFormValues(config);

      expect(result.targetAccountId).toBe(5);
    });

    it('handles undefined config with defaults', () => {
      const result = strategyConfigToFormValues(undefined);

      expect(result).toEqual({
        chunkAmount: '',
        paymentFrequency: 'monthly',
        targetAccountId: null,
      });
    });

    it('round-trip conversion preserves data', () => {
      const original: StrategyConfigData = {
        chunkAmount: '1500.75',
        paymentFrequency: 'bi-weekly',
        targetAccountId: 4,
      };

      const formValues = strategyConfigToFormValues(original);
      const backToConfig = formValuesToStrategyConfig(formValues);

      expect(backToConfig).toEqual(original);
    });

    it('round-trip conversion preserves null values', () => {
      const original: StrategyConfigData = {
        chunkAmount: null,
        paymentFrequency: 'monthly',
        targetAccountId: null,
      };

      const formValues = strategyConfigToFormValues(original);
      const backToConfig = formValuesToStrategyConfig(formValues);

      expect(backToConfig).toEqual(original);
    });
  });
});
