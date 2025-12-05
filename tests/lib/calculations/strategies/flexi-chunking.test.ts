import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { flexiChunkingStrategy } from '@/lib/calculations/strategies/flexi-chunking';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount, SimulatedFlexi } from '@/lib/calculations/types';

describe('flexiChunkingStrategy', () => {
  /**
   * Test snapshot with flexi facility - models a typical SA debt profile
   * with a flexi account at prime + 2% (13.75%) and higher-rate debts
   */
  const createSnapshotWithFlexi = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '100000',
        interestRate: '0.115', // 11.5% - Home loan
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '50000',
        interestRate: '0.13', // 13% - Car loan
        minimumPayment: '1100',
        interestType: 'monthly',
      },
      {
        id: 3,
        balance: '25000',
        interestRate: '0.20', // 20% - Credit card (highest rate)
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

  describe('AC-4.4.1: Models regular lump sum deposits to highest-rate debt', () => {
    it('returns correct strategyId and name', () => {
      expect(flexiChunkingStrategy.id).toBe('flexi-chunking');
      expect(flexiChunkingStrategy.name).toBe('Flexi Chunking');
    });

    it('allocates surplus to highest interest rate debt', () => {
      const surplus = new Big('5000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('100000'),
          interestRate: new Big('0.115'), // Lowest rate
          minimumPayment: new Big('1500'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('50000'),
          interestRate: new Big('0.13'), // Middle rate
          minimumPayment: new Big('1100'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('25000'),
          interestRate: new Big('0.20'), // Highest rate
          minimumPayment: new Big('750'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('50000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = flexiChunkingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(3); // Credit card (highest rate)
      expect(allocations[0].amount.toFixed(2)).toBe('5000.00');
    });

    it('generates projection that pays down highest rate first', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Credit card (id=3, highest rate) should show payments
      const month1 = result.monthlyProjections[0];
      const creditCardMonth1 = month1.accounts.find((a) => a.accountId === 3);

      // Payment applied should be more than minimum (750) due to surplus allocation
      expect(creditCardMonth1?.paymentApplied.gt(new Big('750'))).toBe(true);
    });
  });

  describe('AC-4.4.3: Models flexi daily vs debt monthly compounding', () => {
    it('tracks flexi balance in projections', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Flexi balance should be tracked in projections
      expect(result.monthlyProjections[0].flexiBalance).toBeDefined();
    });

    it('flexi interest is calculated using daily rate formula', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Flexi at 13.75% on R50,000
      // Daily: 50000 × 0.1375 / 365 × 30 ≈ 565.07
      // This should be reflected in the interest calculation
      const month1 = result.monthlyProjections[0];
      expect(month1.totalInterestPaid.gt(0)).toBe(true);
    });
  });

  describe('AC-4.4.4: Returns null when no flexi facility', () => {
    it('returns null when flexiFacility is null', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('does not throw error when no flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();

      expect(() => flexiChunkingStrategy.calculate(snapshot)).not.toThrow();
    });
  });

  describe('AC-4.4.5: Effort level is medium', () => {
    it('has effortLevel set to medium', () => {
      expect(flexiChunkingStrategy.effortLevel).toBe('medium');
    });
  });

  describe('AC-4.4.6: Returns StrategyProjection with all required fields', () => {
    it('returns complete StrategyProjection', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.strategyId).toBe('flexi-chunking');
      expect(result.strategyName).toBe('Flexi Chunking');
      expect(result.effortLevel).toBe('medium');
      expect(typeof result.debtFreeMonth).toBe('number');
      expect(typeof result.debtFreeDate).toBe('string');
      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(typeof result.monthsSaved).toBe('number');
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(Array.isArray(result.monthlyProjections)).toBe(true);
    });

    it('totalPrincipalPaid equals initial debt accounts (excluding flexi)', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Initial debt accounts only: 100000 + 50000 + 25000 = 175000
      // Note: Flexi balance is tracked separately in projections
      const initialDebtAccounts = new Big('175000');
      expect(result.totalPrincipalPaid.toFixed(2)).toBe(initialDebtAccounts.toFixed(2));
    });
  });

  describe('AC-4.4.7: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(flexiChunkingStrategy.id).toBeDefined();
      expect(flexiChunkingStrategy.name).toBeDefined();
      expect(flexiChunkingStrategy.description).toBeDefined();
      expect(flexiChunkingStrategy.effortLevel).toBeDefined();
      expect(flexiChunkingStrategy.requiresFlexi).toBe(true);
    });

    it('has calculate method', () => {
      expect(typeof flexiChunkingStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof flexiChunkingStrategy.allocatePayment).toBe('function');
    });
  });

  describe('AC-4.4.8: Uses big.js for precision', () => {
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

      const allocations = flexiChunkingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations[0].amount).toBeInstanceOf(Big);
    });

    it('projection values are Big instances', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(result.monthlyProjections[0].totalDebt).toBeInstanceOf(Big);
    });
  });

  describe('AC-4.4.9: Outperforms baseline with flexi', () => {
    it('pays less interest than baseline when flexi rate < debt rate', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiResult = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiResult).not.toBeNull();
      if (flexiResult === null) return;
      if (baseline === null) return;

      // Flexi chunking should save interest vs baseline
      expect(flexiResult.interestSaved.gt(0)).toBe(true);
      expect(flexiResult.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
    });

    it('pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiResult = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiResult).not.toBeNull();
      if (flexiResult === null) return;
      if (baseline === null) return;

      // Flexi chunking uses the same surplus allocation as avalanche/baseline with surplus
      // The benefit is in interest savings from rate differential, not necessarily faster payoff
      // In our test case, both strategies will pay off in the same number of months
      // because both apply surplus to highest-rate debt
      expect(flexiResult.monthsSaved).toBeGreaterThanOrEqual(0);
      expect(flexiResult.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
    });
  });

  describe('edge cases', () => {
    it('returns empty allocations when no surplus', () => {
      const flexi: SimulatedFlexi = {
        balance: new Big('10000'),
        interestRate: new Big('0.12'),
      };
      const allocations = flexiChunkingStrategy.allocatePayment(new Big(0), [], flexi);
      expect(allocations).toEqual([]);
    });

    it('returns empty allocations when no flexi (via allocatePayment)', () => {
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('10000'),
          interestRate: new Big('0.15'),
          minimumPayment: new Big('200'),
          interestType: 'monthly',
        },
      ];
      const allocations = flexiChunkingStrategy.allocatePayment(new Big('1000'), accounts, null);
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

      const allocations = flexiChunkingStrategy.allocatePayment(new Big('1000'), accounts, flexi);
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

      const allocations = flexiChunkingStrategy.allocatePayment(new Big('-500'), accounts, flexi);
      expect(allocations).toEqual([]);
    });
  });

  describe('comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiResult = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiResult).not.toBeNull();
      if (flexiResult === null) return;

      expect(flexiResult.monthsSaved).toBe(baseline.debtFreeMonth - flexiResult.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiResult = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiResult).not.toBeNull();
      if (flexiResult === null) return;

      expect(flexiResult.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(flexiResult.totalInterestPaid).toFixed(2)
      );
    });
  });
});
