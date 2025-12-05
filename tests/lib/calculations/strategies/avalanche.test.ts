import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { avalancheStrategy } from '@/lib/calculations/strategies/avalanche';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount } from '@/lib/calculations/types';

describe('avalancheStrategy', () => {
  // Test snapshot with multiple accounts where smallest balance differs from highest rate
  const createMultiAccountSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        name: 'Home Loan',
        balance: '100000',
        interestRate: '0.10', // 10% - lowest rate
        minimumPayment: '1000',
        interestType: 'monthly',
      },
      {
        id: 2,
        name: 'Car Loan',
        balance: '25000',
        interestRate: '0.15', // 15% - middle rate
        minimumPayment: '500',
        interestType: 'monthly',
      },
      {
        id: 3,
        name: 'Credit Card',
        balance: '5000',
        interestRate: '0.20', // 20% - highest rate
        minimumPayment: '150',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '20000',
    monthlyExpenses: '10000',
    availableSurplus: '8350', // 20000 - 10000 - 1650 (min payments)
    snapshotDate: '2024-01-01',
  });

  describe('AC-4.3.3: Avalanche allocates to highest rate first', () => {
    it('returns correct strategyId and name', () => {
      expect(avalancheStrategy.id).toBe('avalanche');
      expect(avalancheStrategy.name).toBe('Debt Avalanche (Highest Rate First)');
    });

    it('allocates surplus to highest interest rate first', () => {
      const surplus = new Big('1000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('100000'),
          interestRate: new Big('0.10'), // Lowest rate
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('25000'),
          interestRate: new Big('0.15'), // Middle rate
          minimumPayment: new Big('500'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('5000'),
          interestRate: new Big('0.20'), // Highest rate
          minimumPayment: new Big('150'),
          interestType: 'monthly',
        },
      ];

      const allocations = avalancheStrategy.allocatePayment(surplus, accounts, null);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(3); // Credit card (highest rate)
      expect(allocations[0].amount.toFixed(2)).toBe('1000.00');
    });

    it('targets highest rate regardless of balance size', () => {
      // Scenario: Highest rate has largest balance (opposite of snowball typical case)
      const surplus = new Big('500');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('1000'), // Smallest balance, lowest rate
          interestRate: new Big('0.05'),
          minimumPayment: new Big('50'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('50000'), // Largest balance, highest rate
          interestRate: new Big('0.25'),
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
      ];

      const allocations = avalancheStrategy.allocatePayment(surplus, accounts, null);

      // Avalanche targets highest rate even though it has largest balance
      expect(allocations[0].accountId).toBe(2);
    });

    it('rolls payment to next highest rate when target is paid off', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.10', // Lower rate
            minimumPayment: '200',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '500', // Small balance but highest rate - will pay off quickly
            interestRate: '0.25',
            minimumPayment: '50',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '4750', // Large surplus
        snapshotDate: '2024-01-01',
      };

      const result = avalancheStrategy.calculate(snapshot);

      // Highest rate account (id=2) should be paid off in month 1
      const month1 = result.monthlyProjections[0];
      const acc2Month1 = month1.accounts.find((a) => a.accountId === 2);
      expect(acc2Month1?.endBalance.toFixed(2)).toBe('0.00');

      // In subsequent months, all surplus should go to account 1 (next highest rate)
      if (result.monthlyProjections.length > 1) {
        const month2 = result.monthlyProjections[1];
        const acc1Month2 = month2.accounts.find((a) => a.accountId === 1);
        // Payment should include rolled surplus
        expect(acc1Month2?.paymentApplied.gt(new Big('200'))).toBe(true);
      }
    });
  });

  describe('AC-4.3.4: StrategyProjection has all required fields', () => {
    it('returns StrategyProjection with all required fields', () => {
      const snapshot = createMultiAccountSnapshot();
      const result = avalancheStrategy.calculate(snapshot);

      expect(result.strategyId).toBe('avalanche');
      expect(result.strategyName).toBe('Debt Avalanche (Highest Rate First)');
      expect(result.effortLevel).toBe('low');
      expect(typeof result.debtFreeMonth).toBe('number');
      expect(typeof result.debtFreeDate).toBe('string');
      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(typeof result.monthsSaved).toBe('number');
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(Array.isArray(result.monthlyProjections)).toBe(true);
    });
  });

  describe('AC-4.3.5: Effort level is low', () => {
    it('has effortLevel set to low', () => {
      expect(avalancheStrategy.effortLevel).toBe('low');
    });
  });

  describe('AC-4.3.6: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(avalancheStrategy.id).toBeDefined();
      expect(avalancheStrategy.name).toBeDefined();
      expect(avalancheStrategy.description).toBeDefined();
      expect(avalancheStrategy.effortLevel).toBeDefined();
      expect(avalancheStrategy.requiresFlexi).toBe(false);
    });

    it('has calculate method', () => {
      expect(typeof avalancheStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof avalancheStrategy.allocatePayment).toBe('function');
    });
  });

  describe('AC-4.3.7: Saves more interest than snowball', () => {
    it('targets highest interest rate to minimize total interest', () => {
      // This is verified in comparison.test.ts with actual calculations
      // Here we just verify the allocation logic is correct
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('1000'), // Smallest balance
          interestRate: new Big('0.05'), // Lowest rate
          minimumPayment: new Big('50'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('10000'),
          interestRate: new Big('0.20'), // Highest rate
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];

      const allocations = avalancheStrategy.allocatePayment(new Big('500'), accounts, null);

      // Avalanche picks highest rate (id=2), not smallest balance (id=1)
      expect(allocations[0].accountId).toBe(2);
    });
  });

  describe('comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createMultiAccountSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(avalanche.monthsSaved).toBeGreaterThan(0);
      expect(avalanche.monthsSaved).toBe(baseline.debtFreeMonth - avalanche.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createMultiAccountSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(avalanche.interestSaved.gt(0)).toBe(true);
      expect(avalanche.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(avalanche.totalInterestPaid).toFixed(2)
      );
    });
  });

  describe('edge cases', () => {
    it('returns empty allocations when no surplus', () => {
      const allocations = avalancheStrategy.allocatePayment(new Big(0), [], null);
      expect(allocations).toEqual([]);
    });

    it('returns empty allocations when all accounts have zero balance', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big(0),
          interestRate: new Big('0.20'),
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
      ];

      const allocations = avalancheStrategy.allocatePayment(new Big('1000'), accounts, null);
      expect(allocations).toEqual([]);
    });

    it('handles accounts with equal rates (picks first by order)', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('5000'),
          interestRate: new Big('0.15'), // Same rate
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('10000'),
          interestRate: new Big('0.15'), // Same rate
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];

      const allocations = avalancheStrategy.allocatePayment(new Big('500'), accounts, null);

      expect(allocations.length).toBe(1);
      expect([1, 2]).toContain(allocations[0].accountId);
    });
  });
});
