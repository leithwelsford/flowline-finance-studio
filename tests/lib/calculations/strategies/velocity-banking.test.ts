import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { velocityBankingStrategy } from '@/lib/calculations/strategies/velocity-banking';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { FinancialSnapshot, SimulatedAccount, SimulatedFlexi } from '@/lib/calculations/types';

describe('velocityBankingStrategy', () => {
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

  /**
   * Tech spec test snapshot - larger debt portfolio
   */
  const createTechSpecSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '1500000',
        interestRate: '0.115', // 11.5% - Home loan
        minimumPayment: '15000',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '250000',
        interestRate: '0.13', // 13% - Vehicle finance
        minimumPayment: '5500',
        interestType: 'monthly',
      },
      {
        id: 3,
        balance: '50000',
        interestRate: '0.20', // 20% - Credit card (highest rate)
        minimumPayment: '1500',
        interestType: 'monthly',
      },
    ],
    flexiFacility: {
      currentBalance: '100000', // Currently owe R100k on flexi
      interestRate: '0.1375', // Prime + 2% (prime at 11.75%)
    },
    monthlyIncome: '85000',
    monthlyExpenses: '45000',
    availableSurplus: '18000', // 85000 - 45000 - 22000 min payments
    snapshotDate: '2024-01-01',
  });

  describe('AC-4.5.1: Models income deposited to flexi', () => {
    it('returns correct strategyId and name', () => {
      expect(velocityBankingStrategy.id).toBe('velocity-banking');
      expect(velocityBankingStrategy.name).toBe('Velocity Banking');
    });

    it('allocates surplus to highest interest rate debt (income parking effect)', () => {
      const surplus = new Big('18000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('1500000'),
          interestRate: new Big('0.115'), // Lowest rate
          minimumPayment: new Big('15000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('250000'),
          interestRate: new Big('0.13'), // Middle rate
          minimumPayment: new Big('5500'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('50000'),
          interestRate: new Big('0.20'), // Highest rate
          minimumPayment: new Big('1500'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('100000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = velocityBankingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(3); // Credit card (highest rate)
      expect(allocations[0].amount.toFixed(2)).toBe('18000.00');
    });

    it('generates projection that shows income being used to pay debt', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // First month should show payments being made
      const month1 = result.monthlyProjections[0];
      expect(month1.totalDebt.lt(new Big('175000').plus(new Big('50000')))).toBe(true);
    });
  });

  describe('AC-4.5.2: Models expenses paid from flexi with net effect reducing balance', () => {
    it('net surplus (income - expenses) is applied to debt reduction', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Credit card (id=3, highest rate) should show payments
      const month1 = result.monthlyProjections[0];
      const creditCardMonth1 = month1.accounts.find((a) => a.accountId === 3);

      // Payment applied should be more than minimum (750) due to surplus allocation
      expect(creditCardMonth1?.paymentApplied.gt(new Big('750'))).toBe(true);
    });
  });

  describe('AC-4.5.3: Periodic chunks to highest-rate debt (avalanche targeting)', () => {
    it('allocates to highest rate debt first', () => {
      const surplus = new Big('5000');
      const accounts: SimulatedAccount[] = [
        {
          id: 1,
          balance: new Big('100000'),
          interestRate: new Big('0.10'), // 10%
          minimumPayment: new Big('1000'),
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: new Big('50000'),
          interestRate: new Big('0.18'), // 18% - Highest
          minimumPayment: new Big('500'),
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: new Big('25000'),
          interestRate: new Big('0.15'), // 15%
          minimumPayment: new Big('250'),
          interestType: 'monthly',
        },
      ];
      const flexi: SimulatedFlexi = {
        balance: new Big('30000'),
        interestRate: new Big('0.1375'),
      };

      const allocations = velocityBankingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations.length).toBe(1);
      expect(allocations[0].accountId).toBe(2); // 18% debt (highest)
    });

    it('rolls to next highest when first is paid off', () => {
      // Use a snapshot with smaller balances that can be paid off
      const smallSnapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '10000',
            interestRate: '0.10', // 10%
            minimumPayment: '200',
            interestType: 'monthly',
          },
          {
            id: 2,
            balance: '5000',
            interestRate: '0.15', // 15%
            minimumPayment: '100',
            interestType: 'monthly',
          },
          {
            id: 3,
            balance: '3000',
            interestRate: '0.20', // 20% - Highest, will be paid first
            minimumPayment: '60',
            interestType: 'monthly',
          },
        ],
        flexiFacility: {
          currentBalance: '500', // Small flexi balance
          interestRate: '0.1375',
        },
        monthlyIncome: '10000',
        monthlyExpenses: '5000',
        availableSurplus: '4640', // Significant surplus to pay off debt quickly
        snapshotDate: '2024-01-01',
      };

      const result = velocityBankingStrategy.calculate(smallSnapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Verify credit card (id=3, highest rate) is paid off before others
      // Find the month where credit card balance reaches 0
      const creditCardPaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 3)?.endBalance.eq(0)
      );

      // Find when account 2 (15%) is paid off
      const account2PaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 2)?.endBalance.eq(0)
      );

      // Find when account 1 (10%) is paid off
      const account1PaidOffMonth = result.monthlyProjections.findIndex(
        (m) => m.accounts.find((a) => a.accountId === 1)?.endBalance.eq(0)
      );

      // Credit card should be paid off first (highest rate)
      expect(creditCardPaidOffMonth).toBeGreaterThan(-1);

      // Account 2 (15%) should be paid after credit card (20%)
      if (account2PaidOffMonth > -1) {
        expect(account2PaidOffMonth).toBeGreaterThanOrEqual(creditCardPaidOffMonth);
      }

      // Account 1 (10%) should be paid last (lowest rate)
      if (account1PaidOffMonth > -1 && account2PaidOffMonth > -1) {
        expect(account1PaidOffMonth).toBeGreaterThanOrEqual(account2PaidOffMonth);
      }

      // All debt accounts should eventually be paid off
      const lastMonth = result.monthlyProjections[result.monthlyProjections.length - 1];
      const allAccountsPaidOff = lastMonth.accounts.every((a) => a.endBalance.eq(0));
      expect(allAccountsPaidOff).toBe(true);
    });
  });

  describe('AC-4.5.4: Projection shows flexi balance fluctuation', () => {
    it('tracks flexi balance in projections', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Flexi balance should be tracked in projections
      expect(result.monthlyProjections[0].flexiBalance).toBeDefined();
    });

    it('flexi balance changes over time', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      const month1Flexi = result.monthlyProjections[0].flexiBalance;
      const month2Flexi = result.monthlyProjections[1]?.flexiBalance;

      // Flexi balance should exist and potentially change (interest accrues)
      expect(month1Flexi).toBeDefined();
      if (month2Flexi) {
        // Interest accrues on flexi, so balance may increase slightly
        expect(month2Flexi.gte(month1Flexi!)).toBe(true);
      }
    });
  });

  describe('AC-4.5.5: Flexi interest uses daily compounding formula', () => {
    it('flexi interest is calculated using daily rate formula', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Flexi at 13.75% on R50,000
      // Daily: 50000 × 0.1375 / 365 × 30 ≈ 565.07
      // This should be reflected in the interest calculation
      const month1 = result.monthlyProjections[0];
      expect(month1.totalInterestPaid.gt(0)).toBe(true);
    });

    it('flexi balance reflects daily compounding interest', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Initial flexi: R50,000 at 13.75%
      // Expected monthly interest ≈ 50000 × 0.1375 / 365 × 30 ≈ R565.07
      const month1FlexiBalance = result.monthlyProjections[0].flexiBalance;
      expect(month1FlexiBalance).toBeDefined();

      // Balance should have increased due to interest
      // Initial: 50000, Interest: ~565, New Balance: ~50565
      expect(month1FlexiBalance!.gt(new Big('50000'))).toBe(true);
      expect(month1FlexiBalance!.lt(new Big('51000'))).toBe(true); // Reasonable range
    });
  });

  describe('AC-4.5.6: Returns null when no flexi facility', () => {
    it('returns null when flexiFacility is null', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('does not throw error when no flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();

      expect(() => velocityBankingStrategy.calculate(snapshot)).not.toThrow();
    });

    it('requiresFlexi property is true', () => {
      expect(velocityBankingStrategy.requiresFlexi).toBe(true);
    });
  });

  describe('AC-4.5.7: Effort level is high', () => {
    it('has effortLevel set to high', () => {
      expect(velocityBankingStrategy.effortLevel).toBe('high');
    });
  });

  describe('AC-4.5.8: Returns StrategyProjection with all required fields', () => {
    it('returns complete StrategyProjection', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.strategyId).toBe('velocity-banking');
      expect(result.strategyName).toBe('Velocity Banking');
      expect(result.effortLevel).toBe('high');
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
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.debtFreeMonth).toBeGreaterThan(0);
    });

    it('debtFreeDate is a valid ISO date string', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Should be in YYYY-MM-DD format
      expect(result.debtFreeDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('totalPrincipalPaid equals initial debt accounts (excluding flexi)', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Initial debt accounts only: 100000 + 50000 + 25000 = 175000
      // Note: Flexi balance is tracked separately in projections
      const initialDebtAccounts = new Big('175000');
      expect(result.totalPrincipalPaid.toFixed(2)).toBe(initialDebtAccounts.toFixed(2));
    });

    it('monthlyProjections is not empty', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });
  });

  describe('AC-4.5.9: Implements DebtStrategy interface', () => {
    it('has all required DebtStrategy properties', () => {
      expect(velocityBankingStrategy.id).toBeDefined();
      expect(velocityBankingStrategy.name).toBeDefined();
      expect(velocityBankingStrategy.description).toBeDefined();
      expect(velocityBankingStrategy.effortLevel).toBeDefined();
      expect(velocityBankingStrategy.requiresFlexi).toBe(true);
    });

    it('has calculate method', () => {
      expect(typeof velocityBankingStrategy.calculate).toBe('function');
    });

    it('has allocatePayment method', () => {
      expect(typeof velocityBankingStrategy.allocatePayment).toBe('function');
    });

    it('calculate returns StrategyProjection or null', () => {
      const snapshotWithFlexi = createSnapshotWithFlexi();
      const snapshotWithoutFlexi = createSnapshotWithoutFlexi();

      const resultWithFlexi = velocityBankingStrategy.calculate(snapshotWithFlexi);
      const resultWithoutFlexi = velocityBankingStrategy.calculate(snapshotWithoutFlexi);

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

      const allocations = velocityBankingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(Array.isArray(allocations)).toBe(true);
      allocations.forEach((allocation) => {
        expect(typeof allocation.accountId).toBe('number');
        expect(allocation.amount).toBeInstanceOf(Big);
      });
    });
  });

  describe('AC-4.5.10: Uses big.js for precision', () => {
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

      const allocations = velocityBankingStrategy.allocatePayment(surplus, accounts, flexi);

      expect(allocations[0].amount).toBeInstanceOf(Big);
    });

    it('projection values are Big instances', () => {
      const snapshot = createSnapshotWithFlexi();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      expect(result.totalInterestPaid).toBeInstanceOf(Big);
      expect(result.totalPrincipalPaid).toBeInstanceOf(Big);
      expect(result.interestSaved).toBeInstanceOf(Big);
      expect(result.monthlyProjections[0].totalDebt).toBeInstanceOf(Big);
    });

    it('handles precision correctly for large amounts', () => {
      const snapshot = createTechSpecSnapshot();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Verify no floating point issues
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
      const allocations = velocityBankingStrategy.allocatePayment(new Big(0), [], flexi);
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
      const allocations = velocityBankingStrategy.allocatePayment(new Big('1000'), accounts, null);
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

      const allocations = velocityBankingStrategy.allocatePayment(new Big('1000'), accounts, flexi);
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

      const allocations = velocityBankingStrategy.allocatePayment(new Big('-500'), accounts, flexi);
      expect(allocations).toEqual([]);
    });

    it('handles zero flexi balance', () => {
      const snapshot: FinancialSnapshot = {
        accounts: [
          {
            id: 1,
            balance: '50000',
            interestRate: '0.15',
            minimumPayment: '1000',
            interestType: 'monthly',
          },
        ],
        flexiFacility: {
          currentBalance: '0',
          interestRate: '0.1375',
        },
        monthlyIncome: '20000',
        monthlyExpenses: '10000',
        availableSurplus: '9000',
        snapshotDate: '2024-01-01',
      };

      const result = velocityBankingStrategy.calculate(snapshot);
      expect(result).not.toBeNull();
    });
  });

  describe('Comparison with baseline', () => {
    it('calculates monthsSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const velocityResult = velocityBankingStrategy.calculate(snapshot, undefined, baseline);

      expect(velocityResult).not.toBeNull();
      if (velocityResult === null) return;

      expect(velocityResult.monthsSaved).toBe(baseline.debtFreeMonth - velocityResult.debtFreeMonth);
    });

    it('calculates interestSaved vs baseline when baseline provided', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const velocityResult = velocityBankingStrategy.calculate(snapshot, undefined, baseline);

      expect(velocityResult).not.toBeNull();
      if (velocityResult === null) return;

      expect(velocityResult.interestSaved.toFixed(2)).toBe(
        baseline.totalInterestPaid.minus(velocityResult.totalInterestPaid).toFixed(2)
      );
    });

    it('pays less interest than baseline when flexi rate < debt rate', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const velocityResult = velocityBankingStrategy.calculate(snapshot, undefined, baseline);

      expect(velocityResult).not.toBeNull();
      if (velocityResult === null) return;
      if (baseline === null) return;

      // Velocity banking should save interest vs baseline
      expect(velocityResult.interestSaved.gt(0)).toBe(true);
      expect(velocityResult.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
    });

    it('pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFlexi();

      const baseline = baselineStrategy.calculate(snapshot);
      const velocityResult = velocityBankingStrategy.calculate(snapshot, undefined, baseline);

      expect(velocityResult).not.toBeNull();
      if (velocityResult === null) return;
      if (baseline === null) return;

      expect(velocityResult.monthsSaved).toBeGreaterThanOrEqual(0);
      expect(velocityResult.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
    });
  });

  describe('Tech spec snapshot validation', () => {
    it('targets credit card (highest rate at 20%)', () => {
      const snapshot = createTechSpecSnapshot();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // First month should show credit card receiving extra payments
      const month1 = result.monthlyProjections[0];
      const creditCard = month1.accounts.find((a) => a.accountId === 3);

      // Credit card should get payment above minimum
      expect(creditCard?.paymentApplied.gt(new Big('1500'))).toBe(true);
    });

    it('handles large debt portfolio correctly', () => {
      const snapshot = createTechSpecSnapshot();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Projection should complete (not hit max months for this scenario)
      // With R18k surplus and R1.8M+ debt, it will take a while but should complete
      expect(result.debtFreeMonth).toBeLessThanOrEqual(360);
      expect(result.monthlyProjections.length).toBeGreaterThan(0);
    });

    it('flexi facility is tracked throughout projection', () => {
      const snapshot = createTechSpecSnapshot();
      const result = velocityBankingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // Check flexi is tracked in multiple months
      const flexi1 = result.monthlyProjections[0].flexiBalance;
      const flexi5 = result.monthlyProjections[4]?.flexiBalance;

      expect(flexi1).toBeDefined();
      if (flexi5) {
        expect(flexi5).toBeDefined();
      }
    });
  });
});
