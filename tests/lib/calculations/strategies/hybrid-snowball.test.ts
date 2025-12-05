import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { hybridSnowballStrategy } from '@/lib/calculations/strategies/hybrid-snowball';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount, SimulatedFlexi } from '@/lib/calculations/types';

describe('hybridSnowballStrategy', () => {
  /**
   * Test snapshot with flexi facility - debt portfolio where smallest balance != highest rate
   * This is critical for testing snowball targeting vs avalanche targeting
   */
  const createSnapshotWithFlexi = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '100000',
        interestRate: '0.115', // 11.5% - Home loan (largest)
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '50000',
        interestRate: '0.20', // 20% - Credit card (highest rate, medium balance)
        minimumPayment: '1100',
        interestType: 'monthly',
      },
      {
        id: 3,
        balance: '25000',
        interestRate: '0.13', // 13% - Personal loan (smallest balance)
        minimumPayment: '750',
        interestType: 'monthly',
      },
    ],
    flexiFacility: {
      currentBalance: '50000', // Owes R50k on flexi
      interestRate: '0.1375', // 13.75% (prime + 2%)
    },
    monthlyIncome: '45000',
    monthlyExpenses: '25000',
    availableSurplus: '16650', // 45000 - 25000 - 3350 (min payments)
    snapshotDate: '2024-01-01',
  });

  /**
   * Test snapshot without flexi facility
   */
  const createSnapshotWithoutFlexi = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '50000',
        interestRate: '0.15',
        minimumPayment: '1000',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '20000',
    monthlyExpenses: '10000',
    availableSurplus: '9000',
    snapshotDate: '2024-01-01',
  });

  /**
   * Snapshot specifically designed to show snowball vs avalanche difference
   * Smallest balance has lowest rate, highest rate has largest balance
   */
  const createDifferentTargetSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '150000',
        interestRate: '0.22', // 22% - Highest rate, largest balance
        minimumPayment: '3000',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '75000',
        interestRate: '0.15', // 15% - Middle rate, middle balance
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 3,
        balance: '15000',
        interestRate: '0.10', // 10% - Lowest rate, smallest balance
        minimumPayment: '300',
        interestType: 'monthly',
      },
    ],
    flexiFacility: {
      currentBalance: '20000',
      interestRate: '0.1375',
    },
    monthlyIncome: '50000',
    monthlyExpenses: '30000',
    availableSurplus: '15200', // 50000 - 30000 - 4800 (min payments)
    snapshotDate: '2024-01-01',
  });

  describe('Strategy metadata', () => {
    it('returns correct strategyId', () => {
      expect(hybridSnowballStrategy.id).toBe('hybrid-flexi-snowball');
    });

    it('returns correct strategyName', () => {
      expect(hybridSnowballStrategy.name).toBe('Hybrid Flexi-Snowball');
    });

    it('has effortLevel set to medium (AC-4.6.5)', () => {
      expect(hybridSnowballStrategy.effortLevel).toBe('medium');
    });

    it('has requiresFlexi set to true', () => {
      expect(hybridSnowballStrategy.requiresFlexi).toBe(true);
    });

    it('has a description', () => {
      expect(hybridSnowballStrategy.description).toBeDefined();
      expect(hybridSnowballStrategy.description.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.1: Combines flexi chunking with snowball targeting', () => {
    it('targets smallest balance first regardless of interest rate', () => {
      const snapshot = createDifferentTargetSnapshot();
      const surplus = new Big('15200');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('150000'),
          interestRate: new Big('0.22'), // Highest rate, largest balance
          minimumPayment: new Big('3000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('75000'),
          interestRate: new Big('0.15'), // Middle rate, middle balance
          minimumPayment: new Big('1500'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('15000'),
          interestRate: new Big('0.10'), // Lowest rate, SMALLEST balance
          minimumPayment: new Big('300'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('20000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(3); // Smallest balance (R15k)
      expect(allocations[0].amount.toFixed(2)).toBe('15200.00');
    });

    it('generates valid projection with snowball targeting', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Should have valid projection structure
      expect(result.strategyId).toBe('hybrid-flexi-snowball');
      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.3: Parks surplus in flexi, chunks to smallest balance', () => {
    it('allocates full surplus to smallest balance debt', () => {
      const surplus = new Big('10000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('100000'),
          interestRate: new Big('0.12'),
          minimumPayment: new Big('2000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('5000'), // Smallest
          interestRate: new Big('0.18'),
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('30000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(2); // Smallest balance
      expect(allocations[0].amount.eq(surplus)).toBe(true);
    });

    it('smallest balance receives extra payments in projection', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Account 3 (R25k) is smallest - should receive payments above minimum
      const month1 = result.monthlyProjections[0];
      const smallestAccount = month1.accounts.find((a) => a.accountId === 3);

      // Payment should exceed minimum (R750) due to surplus allocation
      expect(smallestAccount?.paymentApplied.gt(new Big('750'))).toBe(true);
    });
  });

  describe('AC-4.6.4: Rolls payment to next smallest when debt paid off', () => {
    it('targets next smallest balance after first is paid off', () => {
      // Small balances that can be paid off quickly
      const smallSnapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '50000',
            interestRate: '0.12', // 12%
            minimumPayment: '1000',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '8000',
            interestRate: '0.18', // 18% - but second smallest
            minimumPayment: '160',
            interestType: 'monthly',
          },
          {
            id: 3,
            balance: '3000',
            interestRate: '0.10', // 10% - smallest, will be paid first
            minimumPayment: '60',
            interestType: 'monthly',
          },
        ],
        flexiFacility: {
          currentBalance: '500',
          interestRate: '0.1375',
        },
        monthlyIncome: '15000',
        monthlyExpenses: '8000',
        availableSurplus: '5780', // Significant surplus
        snapshotDate: '2024-01-01',
      };

      const result = hybridSnowballStrategy.calculate(smallSnapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Find when smallest (id=3, R3k) is paid off
      const smallestPaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 3)?.endBalance.eq(0)
      );

      // Find when second smallest (id=2, R8k) is paid off
      const secondSmallestPaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 2)?.endBalance.eq(0)
      );

      // Find when largest (id=1, R50k) is paid off
      const largestPaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 1)?.endBalance.eq(0)
      );

      // Smallest should be paid off first
      expect(smallestPaidOffMonth).toBeGreaterThan(-1);

      // Second smallest should be paid after smallest
      if (secondSmallestPaidOffMonth > -1) {
        expect(secondSmallestPaidOffMonth).toBeGreaterThanOrEqual(smallestPaidOffMonth);
      }

      // Largest should be paid last
      if (largestPaidOffMonth > -1 && secondSmallestPaidOffMonth > -1) {
        expect(largestPaidOffMonth).toBeGreaterThanOrEqual(secondSmallestPaidOffMonth);
      }

      // All should eventually be paid off
      const lastMonth = result.monthlyProjections[result.monthlyProjections.length - 1];
      const allPaidOff = lastMonth.accounts.every((a) => a.endBalance.eq(0));
      expect(allPaidOff).toBe(true);
    });
  });

  describe('AC-4.6.6: Returns null when no flexi facility', () => {
    it('returns null when flexiFacility is null', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('does not throw error when no flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();

      expect(() => hybridSnowballStrategy.calculate(snapshot)).not.toThrow();
    });

    it('allocatePayment returns empty when flexi is null', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const allocations = hybridSnowballStrategy.allocatePayment(new Big('1000'), accounts, null);
      expect(allocations).toEqual([]);
    });
  });

  describe('AC-4.6.7: Returns complete StrategyProjection', () => {
    it('returns all required fields', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.strategyId).toBe('hybrid-flexi-snowball');
      expect(result.strategyName).toBe('Hybrid Flexi-Snowball');
      expect(result.effortLevel).toBe('medium');
      expect(typeof result.debtFreeMonth).toBe('number');
      expect(typeof result.debtFreeDate).toBe('string');
      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(typeof result.monthsSaved).toBe('number');
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(Array.isArray(result.monthlyProjections)).toBe(true);
    });

    it('debtFreeMonth is a positive number', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.debtFreeMonth).toBeGreaterThan(0);
    });

    it('debtFreeDate is a valid ISO date string', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.debtFreeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('monthlyProjections is not empty', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.8: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(hybridSnowballStrategy.id).toBeDefined();
      expect(hybridSnowballStrategy.name).toBeDefined();
      expect(hybridSnowballStrategy.description).toBeDefined();
      expect(hybridSnowballStrategy.effortLevel).toBeDefined();
      expect(hybridSnowballStrategy.requiresFlexi).toBe(true);
    });

    it('has calculate method', () => {
      expect(typeof hybridSnowballStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof hybridSnowballStrategy.allocatePayment).toBe('function');
    });

    it('calculate returns StrategyProjection or null', () => {
      const snapshotWithFlexi = createSnapshotWithFlexi();
      const snapshotWithoutFlexi = createSnapshotWithoutFlexi();

      const resultWithFlexi = hybridSnowballStrategy.calculate(snapshotWithFlexi);
      const resultWithoutFlexi = hybridSnowballStrategy.calculate(snapshotWithoutFlexi);

      expect(resultWithFlexi).not.toBeNull();
      expect(resultWithoutFlexi).toBeNull();
    });

    it('allocatePayment returns PaymentAllocation array', () => {
      const surplus = new Big('5000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(surplus, accounts, flexi);

      expect(Array.isArray(allocations)).toBe(true);
      allocations.forEach((allocation) => {
        expect(typeof allocation.accountId).toBe('number');
        expect(allocation.amount).toBeInstanceOf(Big);
      });
    });
  });

  describe('AC-4.6.9: Uses big.js for precision', () => {
    it('allocations return Big instances', () => {
      const surplus = new Big('1000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations[0].amount).toBeInstanceOf(Big);
    });

    it('projection values are Big instances', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(result.monthlyProjections[0].totalDebt).toBeInstanceOf(Big);
    });

    it('handles cent-level precision (2 decimal places)', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridSnowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      const totalInterest = result.totalInterestPaid.toFixed(2);
      expect(totalInterest).toMatch(/^\d+\.\d{2}$/);
    });
  });

  describe('Edge cases', () => {
    it('returns empty allocations when no surplus', () => {
      const flexi: SimulatedFlexi = {
        balance: new Big('10000'),
        interestRate: new Big('0.12'),
      };
      const allocations = hybridSnowballStrategy.allocatePayment(new Big(0), [], flexi);
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
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(new Big('1000'), accounts, flexi);
      expect(allocations).toEqual([]);
    });

    it('handles negative surplus gracefully', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(new Big('-500'), accounts, flexi);
      expect(allocations).toEqual([]);
    });

    it('handles single account correctly', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(new Big('1000'), accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(1);
    });

    it('handles accounts with equal balances', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.20'), // Higher rate
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('10000'), // Same balance
          interestRate: new Big('0.10'), // Lower rate
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridSnowballStrategy.allocatePayment(new Big('1000'), accounts, flexi);

      // Should pick one of them (implementation detail - just verify it works)
      expect(allocations.length).toBe(1);
      expect([1, 2]).toContain(allocations[0].accountId);
    });
  });

  describe('Comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridSnowballStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;

      expect(hybridResult.monthsSaved).toBe(baseline.debtFreeMonth - hybridResult.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridSnowballStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;

      expect(hybridResult.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(hybridResult.totalInterestPaid).toFixed(2)
      );
    });

    it('pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridSnowballStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;
      if (baseline === null) return;

      expect(hybridResult.monthsSaved).toBeGreaterThanOrEqual(0);
      expect(hybridResult.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
    });
  });
});
