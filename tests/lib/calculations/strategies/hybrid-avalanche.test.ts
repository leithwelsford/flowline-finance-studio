import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { hybridAvalancheStrategy } from '@/lib/calculations/strategies/hybrid-avalanche';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount, SimulatedFlexi } from '@/lib/calculations/types';

describe('hybridAvalancheStrategy', () => {
  /**
   * Test snapshot with flexi facility - debt portfolio where smallest balance != highest rate
   * This is critical for testing avalanche targeting vs snowball targeting
   */
  const createSnapshotWithFlexi = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '100000',
        interestRate: '0.115', // 11.5% - Home loan (lowest rate)
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '50000',
        interestRate: '0.20', // 20% - Credit card (highest rate)
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
   * Snapshot specifically designed to show avalanche vs snowball difference
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
      expect(hybridAvalancheStrategy.id).toBe('hybrid-flexi-avalanche');
    });

    it('returns correct strategyName', () => {
      expect(hybridAvalancheStrategy.name).toBe('Hybrid Flexi-Avalanche');
    });

    it('has effortLevel set to medium (AC-4.6.5)', () => {
      expect(hybridAvalancheStrategy.effortLevel).toBe('medium');
    });

    it('has requiresFlexi set to true', () => {
      expect(hybridAvalancheStrategy.requiresFlexi).toBe(true);
    });

    it('has a description', () => {
      expect(hybridAvalancheStrategy.description).toBeDefined();
      expect(hybridAvalancheStrategy.description.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.2: Combines flexi chunking with avalanche targeting', () => {
    it('targets highest interest rate first regardless of balance', () => {
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
          interestRate: new Big('0.10'), // Lowest rate, smallest balance
          minimumPayment: new Big('300'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('20000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = hybridAvalancheStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(1); // Highest rate (22%)
      expect(allocations[0].amount.toFixed(2)).toBe('15200.00');
    });

    it('generates valid projection with avalanche targeting', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Should have valid projection structure
      expect(result.strategyId).toBe('hybrid-flexi-avalanche');
      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.3: Parks surplus in flexi, chunks to highest rate', () => {
    it('allocates full surplus to highest rate debt', () => {
      const surplus = new Big('10000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('5000'), // Smallest but lower rate
          interestRate: new Big('0.12'),
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('100000'), // Largest but highest rate
          interestRate: new Big('0.18'),
          minimumPayment: new Big('2000'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('30000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = hybridAvalancheStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(2); // Highest rate
      expect(allocations[0].amount.eq(surplus)).toBe(true);
    });

    it('highest rate account receives extra payments in projection', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Account 2 (20% rate) is highest - should receive payments above minimum
      const month1 = result.monthlyProjections[0];
      const highestRateAccount = month1.accounts.find((a) => a.accountId === 2);

      // Payment should exceed minimum (R1100) due to surplus allocation
      expect(highestRateAccount?.paymentApplied.gt(new Big('1100'))).toBe(true);
    });
  });

  describe('AC-4.6.4: Rolls payment to next highest rate when debt paid off', () => {
    it('targets next highest rate after first is paid off', () => {
      // Balances that show clear avalanche ordering
      const avalancheSnapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '50000',
            interestRate: '0.10', // 10% - Lowest rate
            minimumPayment: '1000',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '8000',
            interestRate: '0.15', // 15% - Middle rate
            minimumPayment: '160',
            interestType: 'monthly',
          },
          {
            id: 3,
            balance: '3000',
            interestRate: '0.22', // 22% - Highest rate, will be paid first
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

      const result = hybridAvalancheStrategy.calculate(avalancheSnapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Find when highest rate (id=3, 22%) is paid off
      const highestRatePaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 3)?.endBalance.eq(0)
      );

      // Find when middle rate (id=2, 15%) is paid off
      const middleRatePaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 2)?.endBalance.eq(0)
      );

      // Find when lowest rate (id=1, 10%) is paid off
      const lowestRatePaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 1)?.endBalance.eq(0)
      );

      // Highest rate should be paid off first
      expect(highestRatePaidOffMonth).toBeGreaterThan(-1);

      // Middle rate (15%) should be paid after highest rate (22%)
      if (middleRatePaidOffMonth > -1) {
        expect(middleRatePaidOffMonth).toBeGreaterThanOrEqual(highestRatePaidOffMonth);
      }

      // Lowest rate (10%) should be paid last
      if (lowestRatePaidOffMonth > -1 && middleRatePaidOffMonth > -1) {
        expect(lowestRatePaidOffMonth).toBeGreaterThanOrEqual(middleRatePaidOffMonth);
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
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('does not throw error when no flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();

      expect(() => hybridAvalancheStrategy.calculate(snapshot)).not.toThrow();
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
      const allocations = hybridAvalancheStrategy.allocatePayment(new Big('1000'), accounts, null);
      expect(allocations).toEqual([]);
    });
  });

  describe('AC-4.6.7: Returns complete StrategyProjection', () => {
    it('returns all required fields', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.strategyId).toBe('hybrid-flexi-avalanche');
      expect(result.strategyName).toBe('Hybrid Flexi-Avalanche');
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
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.debtFreeMonth).toBeGreaterThan(0);
    });

    it('debtFreeDate is a valid ISO date string', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.debtFreeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('monthlyProjections is not empty', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.6.8: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(hybridAvalancheStrategy.id).toBeDefined();
      expect(hybridAvalancheStrategy.name).toBeDefined();
      expect(hybridAvalancheStrategy.description).toBeDefined();
      expect(hybridAvalancheStrategy.effortLevel).toBeDefined();
      expect(hybridAvalancheStrategy.requiresFlexi).toBe(true);
    });

    it('has calculate method', () => {
      expect(typeof hybridAvalancheStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof hybridAvalancheStrategy.allocatePayment).toBe('function');
    });

    it('calculate returns StrategyProjection or null', () => {
      const snapshotWithFlexi = createSnapshotWithFlexi();
      const snapshotWithoutFlexi = createSnapshotWithoutFlexi();

      const resultWithFlexi = hybridAvalancheStrategy.calculate(snapshotWithFlexi);
      const resultWithoutFlexi = hybridAvalancheStrategy.calculate(snapshotWithoutFlexi);

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

      const allocations = hybridAvalancheStrategy.allocatePayment(surplus, accounts, flexi);

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

      const allocations = hybridAvalancheStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations[0].amount).toBeInstanceOf(Big);
    });

    it('projection values are Big instances', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(result.monthlyProjections[0].totalDebt).toBeInstanceOf(Big);
    });

    it('handles cent-level precision (2 decimal places)', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = hybridAvalancheStrategy.calculate(snapshot);

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
      const allocations = hybridAvalancheStrategy.allocatePayment(new Big(0), [], flexi);
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

      const allocations = hybridAvalancheStrategy.allocatePayment(new Big('1000'), accounts, flexi);
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

      const allocations = hybridAvalancheStrategy.allocatePayment(new Big('-500'), accounts, flexi);
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

      const allocations = hybridAvalancheStrategy.allocatePayment(new Big('1000'), accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(1);
    });

    it('handles accounts with equal rates', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('5000'), // Smaller balance
          interestRate: new Big('0.15'), // Same rate
          minimumPayment: new Big('100'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('50000'), // Larger balance
          interestRate: new Big('0.15'), // Same rate
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('5000'),
        interestRate: new Big('0.12'),
      };

      const allocations = hybridAvalancheStrategy.allocatePayment(new Big('1000'), accounts, flexi);

      // Should pick one of them (implementation detail - just verify it works)
      expect(allocations.length).toBe(1);
      expect([1, 2]).toContain(allocations[0].accountId);
    });
  });

  describe('Comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridAvalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;

      expect(hybridResult.monthsSaved).toBe(baseline.debtFreeMonth - hybridResult.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridAvalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;

      expect(hybridResult.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(hybridResult.totalInterestPaid).toFixed(2)
      );
    });

    it('pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const hybridResult = hybridAvalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(hybridResult).not.toBeNull();
      if (hybridResult === null) return;
      if (baseline === null) return;

      expect(hybridResult.monthsSaved).toBeGreaterThanOrEqual(0);
      expect(hybridResult.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
    });
  });
});
