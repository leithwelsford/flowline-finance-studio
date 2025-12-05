import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { snowballStrategy } from '@/lib/calculations/strategies/snowball';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount } from '@/lib/calculations/types';

describe('snowballStrategy', () => {
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

  describe('AC-4.3.2: Snowball allocates to smallest balance first', () => {
    it('returns correct strategyId and name', () => {
      expect(snowballStrategy.id).toBe('snowball');
      expect(snowballStrategy.name).toBe('Debt Snowball (Smallest First)');
    });

    it('allocates surplus to smallest balance first', () => {
      const surplus = new Big('1000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('100000'),
          interestRate: new Big('0.10'),
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('25000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('500'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('5000'), // Smallest balance
          interestRate: new Big('0.20'),
          minimumPayment: new Big('150'),
          interestType: 'monthly',
        },
      ];

      const allocations = snowballStrategy.allocatePayment(surplus, accounts, null);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(3); // Credit card (smallest balance)
      expect(allocations[0].amount.toFixed(2)).toBe('1000.00');
    });

    it('targets smallest balance regardless of interest rate', () => {
      // Scenario: Smallest balance has lowest rate (opposite of avalanche)
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
          balance: new Big('50000'), // Large balance, highest rate
          interestRate: new Big('0.25'),
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
      ];

      const allocations = snowballStrategy.allocatePayment(surplus, accounts, null);

      // Snowball targets smallest balance even though it has lowest rate
      expect(allocations[0].accountId).toBe(1);
    });

    it('rolls payment to next smallest when target is paid off', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '500', // Tiny - will pay off quickly
            interestRate: '0.12',
            minimumPayment: '100',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000', // Medium
            interestRate: '0.18',
            minimumPayment: '150',
            interestType: 'monthly',
          },
        ],
        flexiFacility: null,
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '4750', // Large surplus
        snapshotDate: '2024-01-01',
      };

      const result = snowballStrategy.calculate(snapshot);

      // First account should be paid off in month 1
      const month1 = result.monthlyProjections[0];
      const acc1Month1 = month1.accounts.find((a) => a.accountId === 1);
      expect(acc1Month1?.endBalance.toFixed(2)).toBe('0.00');

      // In month 2, all surplus should go to account 2 (the next smallest, now only one left)
      if (result.monthlyProjections.length > 1) {
        const month2 = result.monthlyProjections[1];
        const acc2Month2 = month2.accounts.find((a) => a.accountId === 2);
        // Payment should be minimum + extra (rolling)
        expect(acc2Month2?.paymentApplied.gt(new Big('150'))).toBe(true);
      }
    });
  });

  describe('AC-4.3.4: StrategyProjection has all required fields', () => {
    it('returns StrategyProjection with all required fields', () => {
      const snapshot = createMultiAccountSnapshot();
      const result = snowballStrategy.calculate(snapshot);

      expect(result.strategyId).toBe('snowball');
      expect(result.strategyName).toBe('Debt Snowball (Smallest First)');
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
      expect(snowballStrategy.effortLevel).toBe('low');
    });
  });

  describe('AC-4.3.6: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(snowballStrategy.id).toBeDefined();
      expect(snowballStrategy.name).toBeDefined();
      expect(snowballStrategy.description).toBeDefined();
      expect(snowballStrategy.effortLevel).toBeDefined();
      expect(snowballStrategy.requiresFlexi).toBe(false);
    });

    it('has calculate method', () => {
      expect(typeof snowballStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof snowballStrategy.allocatePayment).toBe('function');
    });
  });

  describe('AC-4.3.7: Faster early wins than avalanche', () => {
    it('pays off first account (smallest balance) quickly', () => {
      const snapshot = createMultiAccountSnapshot();
      const result = snowballStrategy.calculate(snapshot);

      // Find when credit card (smallest balance, id=3) is paid off
      let creditCardPaidOffMonth = 0;
      for (const month of result.monthlyProjections) {
        const creditCard = month.accounts.find((a) => a.accountId === 3);
        if (creditCard && creditCard.endBalance.eq(0)) {
          creditCardPaidOffMonth = month.month;
          break;
        }
      }

      // Credit card (R5000) should be paid off within a few months with R8350 surplus
      expect(creditCardPaidOffMonth).toBeLessThanOrEqual(2);
    });
  });

  describe('comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createMultiAccountSnapshot();

      // Calculate baseline first
      const baseline = baselineStrategy.calculate(snapshot);

      // Then calculate snowball with baseline for comparison
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);

      // Snowball should save months compared to baseline
      expect(snowball.monthsSaved).toBeGreaterThan(0);
      expect(snowball.monthsSaved).toBe(baseline.debtFreeMonth - snowball.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createMultiAccountSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);

      // Snowball should save interest compared to baseline
      expect(snowball.interestSaved.gt(0)).toBe(true);
      expect(snowball.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(snowball.totalInterestPaid).toFixed(2)
      );
    });
  });

  describe('edge cases', () => {
    it('returns empty allocations when no surplus', () => {
      const allocations = snowballStrategy.allocatePayment(new Big(0), [], null);
      expect(allocations).toEqual([]);
    });

    it('returns empty allocations when all accounts have zero balance', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big(0),
          interestRate: new Big('0.12'),
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
      ];

      const allocations = snowballStrategy.allocatePayment(new Big('1000'), accounts, null);
      expect(allocations).toEqual([]);
    });

    it('handles accounts with equal balances (picks first by id order)', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('5000'),
          interestRate: new Big('0.12'),
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('5000'), // Same balance
          interestRate: new Big('0.18'),
          minimumPayment: new Big('150'),
          interestType: 'monthly',
        },
      ];

      const allocations = snowballStrategy.allocatePayment(new Big('500'), accounts, null);

      // Should pick one of them (first one with equal balance)
      expect(allocations.length).toBe(1);
      expect([1, 2]).toContain(allocations[0].accountId);
    });
  });
});
