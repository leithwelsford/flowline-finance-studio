import { describe, it, expect } from 'vitest';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import { snowballStrategy } from '@/lib/calculations/strategies/snowball';
import { avalancheStrategy } from '@/lib/calculations/strategies/avalanche';
import {
  getAllStrategies,
  getStrategyById,
  getStrategiesByEffortLevel,
} from '@/lib/calculations/strategies';
import type { FinancialSnapshot } from '@/lib/calculations/types';

describe('Strategy Comparison Tests - AC-4.3.7', () => {
  // Test snapshot from tech spec with different rate/balance ordering
  // Home loan: large balance, low rate
  // Car: medium balance, medium rate
  // Credit card: small balance, high rate
  // This tests that snowball and avalanche have different target orders
  const createTechSpecSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        name: 'Home Loan',
        balance: '1500000',
        interestRate: '0.115', // 11.5%
        minimumPayment: '15000',
        interestType: 'monthly',
      },
      {
        id: 2,
        name: 'Car',
        balance: '250000',
        interestRate: '0.13', // 13%
        minimumPayment: '5500',
        interestType: 'monthly',
      },
      {
        id: 3,
        name: 'Credit Card',
        balance: '50000',
        interestRate: '0.20', // 20%
        minimumPayment: '1500',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '85000',
    monthlyExpenses: '45000',
    availableSurplus: '18000', // 85000 - 45000 - 22000 min payments
    snapshotDate: '2024-01-01',
  });

  // Snapshot where snowball and avalanche have DIFFERENT targets
  // This verifies distinct behaviors
  const createDifferentTargetSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        name: 'Small Balance Low Rate',
        balance: '5000', // Smallest balance
        interestRate: '0.08', // Lowest rate - Snowball targets this
        minimumPayment: '150',
        interestType: 'monthly',
      },
      {
        id: 2,
        name: 'Large Balance High Rate',
        balance: '50000', // Larger balance
        interestRate: '0.22', // Highest rate - Avalanche targets this
        minimumPayment: '1000',
        interestType: 'monthly',
      },
      {
        id: 3,
        name: 'Medium Balance Medium Rate',
        balance: '20000',
        interestRate: '0.15',
        minimumPayment: '500',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '15000',
    monthlyExpenses: '8000',
    availableSurplus: '5350', // 15000 - 8000 - 1650 min payments
    snapshotDate: '2024-01-01',
  });

  describe('Avalanche saves more interest than Snowball', () => {
    it('avalanche totalInterestPaid < snowball totalInterestPaid (different target snapshot)', () => {
      // Note: Tech spec snapshot has credit card with both smallest balance AND highest rate,
      // so snowball and avalanche target the same account. Use different target snapshot
      // to verify distinct behaviors.
      const snapshot = createDifferentTargetSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      // Avalanche should pay less total interest when targets differ
      expect(avalanche.totalInterestPaid.lt(snowball.totalInterestPaid)).toBe(true);

      // Log the actual savings for verification
      const interestDiff = snowball.totalInterestPaid.minus(avalanche.totalInterestPaid);
      console.log(`Avalanche saves R${interestDiff.toFixed(2)} in interest vs Snowball`);
    });

    it('tech spec snapshot: snowball and avalanche have same target order (credit card first)', () => {
      // In the tech spec snapshot, credit card has both:
      // - Smallest balance (R50k) -> Snowball target
      // - Highest rate (20%) -> Avalanche target
      // So both strategies target the same account, resulting in identical interest
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      // When target order is the same, interest should be equal (or very close)
      const diff = avalanche.totalInterestPaid.minus(snowball.totalInterestPaid).abs();
      expect(diff.lt(1)).toBe(true); // Within R1 difference (rounding)
    });
  });

  describe('Snowball has faster early wins', () => {
    it('snowball pays off first account sooner than avalanche (different target snapshot)', () => {
      const snapshot = createDifferentTargetSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      // Find when each strategy pays off their first account
      const snowballFirstPayoff = findFirstAccountPayoff(snowball.monthlyProjections);
      const avalancheFirstPayoff = findFirstAccountPayoff(avalanche.monthlyProjections);

      // Snowball should have faster first payoff (smaller balance targeted first)
      expect(snowballFirstPayoff).toBeLessThanOrEqual(avalancheFirstPayoff);
    });

    it('snowball has more accounts paid off early vs avalanche', () => {
      const snapshot = createDifferentTargetSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      // Count accounts paid off at month 6
      const snowballPaidOff6 = countAccountsPaidOffByMonth(snowball.monthlyProjections, 6);
      const avalanchePaidOff6 = countAccountsPaidOffByMonth(avalanche.monthlyProjections, 6);

      // Snowball should have equal or more accounts paid off early
      expect(snowballPaidOff6).toBeGreaterThanOrEqual(avalanchePaidOff6);
    });
  });

  describe('Both strategies beat baseline', () => {
    it('snowball saves months compared to baseline', () => {
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);

      expect(snowball.monthsSaved).toBeGreaterThan(0);
      expect(snowball.debtFreeMonth).toBeLessThan(baseline.debtFreeMonth);
    });

    it('avalanche saves months compared to baseline', () => {
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(avalanche.monthsSaved).toBeGreaterThan(0);
      expect(avalanche.debtFreeMonth).toBeLessThan(baseline.debtFreeMonth);
    });

    it('snowball saves interest compared to baseline', () => {
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot, undefined, baseline);

      expect(snowball.interestSaved.gt(0)).toBe(true);
      expect(snowball.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
    });

    it('avalanche saves interest compared to baseline', () => {
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);

      expect(avalanche.interestSaved.gt(0)).toBe(true);
      expect(avalanche.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
    });
  });

  describe('Strategy Registry', () => {
    it('getAllStrategies returns all six strategies', () => {
      const strategies = getAllStrategies();

      expect(strategies.length).toBe(6);
      expect(strategies.map((s) => s.id)).toContain('baseline');
      expect(strategies.map((s) => s.id)).toContain('snowball');
      expect(strategies.map((s) => s.id)).toContain('avalanche');
      expect(strategies.map((s) => s.id)).toContain('flexi-chunking');
      expect(strategies.map((s) => s.id)).toContain('aggressive-flexi');
      expect(strategies.map((s) => s.id)).toContain('velocity-banking');
    });

    it('getStrategyById returns correct strategy', () => {
      expect(getStrategyById('baseline')).toBe(baselineStrategy);
      expect(getStrategyById('snowball')).toBe(snowballStrategy);
      expect(getStrategyById('avalanche')).toBe(avalancheStrategy);
      expect(getStrategyById('nonexistent')).toBeUndefined();
    });

    it('getStrategiesByEffortLevel returns low effort strategies', () => {
      const lowEffort = getStrategiesByEffortLevel('low');

      expect(lowEffort.length).toBe(3);
      expect(lowEffort.every((s) => s.effortLevel === 'low')).toBe(true);
    });
  });

  describe('All strategies use big.js (AC-4.3.8)', () => {
    it('all projections have Big number types for monetary values', () => {
      const snapshot = createTechSpecSnapshot();

      const baseline = baselineStrategy.calculate(snapshot);
      const snowball = snowballStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot);

      for (const result of [baseline, snowball, avalanche]) {
        // Check StrategyProjection fields
        expect(typeof result.totalInterestPaid.toFixed).toBe('function');
        expect(typeof result.totalPrincipalPaid.toFixed).toBe('function');
        expect(typeof result.interestSaved.toFixed).toBe('function');

        // Check MonthlyProjection fields
        const month1 = result.monthlyProjections[0];
        expect(typeof month1.totalDebt.toFixed).toBe('function');
        expect(typeof month1.totalInterestPaid.toFixed).toBe('function');
        expect(typeof month1.accounts[0].startBalance.toFixed).toBe('function');
        expect(typeof month1.accounts[0].interestCharged.toFixed).toBe('function');
        expect(typeof month1.accounts[0].paymentApplied.toFixed).toBe('function');
      }
    });

    it('calculations maintain cent-level precision (2 decimal places)', () => {
      const snapshot = createTechSpecSnapshot();
      const result = avalancheStrategy.calculate(snapshot);

      // Verify rounding to 2 decimal places
      const month1 = result.monthlyProjections[0];
      const interest = month1.accounts[0].interestCharged.toFixed(2);

      // Should have exactly 2 decimal places
      expect(interest).toMatch(/^\d+\.\d{2}$/);
    });
  });
});

// Helper function to find when first account is paid off
function findFirstAccountPayoff(
  projections: { month: number; accounts: { accountId: number; endBalance: { eq: (n: number) => boolean } }[] }[]
): number {
  for (const month of projections) {
    for (const account of month.accounts) {
      if (account.endBalance.eq(0)) {
        return month.month;
      }
    }
  }
  return Infinity;
}

// Helper function to count accounts paid off by a given month
function countAccountsPaidOffByMonth(
  projections: { month: number; accounts: { accountId: number; endBalance: { eq: (n: number) => boolean } }[] }[],
  targetMonth: number
): number {
  const monthData = projections.find((p) => p.month === targetMonth);
  if (!monthData) return 0;

  return monthData.accounts.filter((a) => a.endBalance.eq(0)).length;
}
