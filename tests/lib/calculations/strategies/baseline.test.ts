import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot } from '@/lib/calculations/types';

describe('baselineStrategy', () => {
  // Standard test snapshot for consistent testing
  const createTestSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '10000',
        interestRate: '0.12',
        minimumPayment: '500',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '10000',
    monthlyExpenses: '5000',
    availableSurplus: '4500', // Has surplus but baseline ignores it
    snapshotDate: '2024-01-01',
  });

  describe('AC-4.3.1: Baseline applies only minimum payments', () => {
    it('returns correct strategyId and name', () => {
      expect(baselineStrategy.id).toBe('baseline');
      expect(baselineStrategy.name).toBe('Baseline (Minimum Payments)');
    });

    it('applies only minimum payments with no surplus allocation', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      // Should have projections
      expect(result.monthlyProjections.length).toBeGreaterThan(0);

      // First month: only minimum payment applied despite surplus available
      const month1 = result.monthlyProjections[0];
      expect(month1.accounts[0].paymentApplied.toFixed(2)).toBe('500.00');
    });

    it('allocatePayment returns empty array (no surplus allocation)', () => {
      const surplus = new Big('4500');
      const accounts = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.12'),
          minimumPayment: new Big('500'),
          interestType: 'monthly' as const,
        },
      ];

      const allocations = baselineStrategy.allocatePayment(surplus, accounts, null);
      expect(allocations).toEqual([]);
    });
  });

  describe('AC-4.3.4: StrategyProjection has all required fields', () => {
    it('returns StrategyProjection with all required fields populated', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      // Required fields
      expect(result.strategyId).toBe('baseline');
      expect(result.strategyName).toBe('Baseline (Minimum Payments)');
      expect(result.effortLevel).toBe('low');
      expect(typeof result.debtFreeMonth).toBe('number');
      expect(result.debtFreeMonth).toBeGreaterThan(0);
      expect(typeof result.debtFreeDate).toBe('string');
      expect(result.debtFreeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(typeof result.monthsSaved).toBe('number');
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(Array.isArray(result.monthlyProjections)).toBe(true);
    });

    it('debtFreeMonth matches projection array length', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      expect(result.debtFreeMonth).toBe(result.monthlyProjections.length);
    });

    it('totalInterestPaid matches cumulative from final month', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      const finalMonth = result.monthlyProjections[result.monthlyProjections.length - 1];
      expect(result.totalInterestPaid.toFixed(2)).toBe(finalMonth.totalInterestPaid.toFixed(2));
    });

    it('totalPrincipalPaid matches cumulative from final month', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      const finalMonth = result.monthlyProjections[result.monthlyProjections.length - 1];
      expect(result.totalPrincipalPaid.toFixed(2)).toBe(finalMonth.totalPrincipalPaid.toFixed(2));
    });
  });

  describe('AC-4.3.5: Effort level is low', () => {
    it('has effortLevel set to low', () => {
      expect(baselineStrategy.effortLevel).toBe('low');
    });
  });

  describe('AC-4.3.6: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(baselineStrategy.id).toBeDefined();
      expect(baselineStrategy.name).toBeDefined();
      expect(baselineStrategy.description).toBeDefined();
      expect(baselineStrategy.effortLevel).toBeDefined();
      expect(baselineStrategy.requiresFlexi).toBe(false);
    });

    it('has calculate method', () => {
      expect(typeof baselineStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof baselineStrategy.allocatePayment).toBe('function');
    });
  });

  describe('baseline serves as comparison point', () => {
    it('returns 0 for monthsSaved when no baseline provided', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      expect(result.monthsSaved).toBe(0);
    });

    it('returns 0 for interestSaved when no baseline provided', () => {
      const snapshot = createTestSnapshot();
      const result = baselineStrategy.calculate(snapshot);

      expect(result.interestSaved.toFixed(2)).toBe('0.00');
    });
  });

  describe('multi-account scenario', () => {
    it('applies only minimum payments to all accounts', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.12',
            minimumPayment: '500',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000',
            interestRate: '0.18',
            minimumPayment: '200',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '15000',
        monthlyExpenses: '5000',
        availableSurplus: '9300', // Large surplus but baseline ignores it
        snapshotDate: '2024-01-01',
      };

      const result = baselineStrategy.calculate(snapshot);
      const month1 = result.monthlyProjections[0];

      // Account 1: only minimum payment (500)
      const acc1 = month1.accounts.find((a) => a.accountId === 1);
      expect(acc1?.paymentApplied.toFixed(2)).toBe('500.00');

      // Account 2: only minimum payment (200)
      const acc2 = month1.accounts.find((a) => a.accountId === 2);
      expect(acc2?.paymentApplied.toFixed(2)).toBe('200.00');
    });
  });
});
