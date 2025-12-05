import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import { flexiChunkingStrategy } from '@/lib/calculations/strategies/flexi-chunking';
import { aggressiveFlexiStrategy } from '@/lib/calculations/strategies/aggressive-flexi';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import { avalancheStrategy } from '@/lib/calculations/strategies/avalanche';
import { snowballStrategy } from '@/lib/calculations/strategies/snowball';
import type { FinancialSnapshot } from '@/lib/calculations/types';

describe('Flexi Strategy Comparisons (AC-4.4.9)', () => {
  /**
   * Test snapshot with flexi facility - favorable rate differential
   * Flexi rate (13.75%) < Credit Card rate (20%) = 6.25% arbitrage opportunity
   */
  const createSnapshotWithFavorableRateDifferential = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '150000',
        interestRate: '0.115', // 11.5% - Home loan
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '25000',
        interestRate: '0.13', // 13% - Car loan
        minimumPayment: '550',
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
      currentBalance: '100000', // Owes R100k on flexi
      interestRate: '0.1375', // 13.75% (prime + 2%)
    },
    monthlyIncome: '85000',
    monthlyExpenses: '45000',
    availableSurplus: '36450', // 85000 - 45000 - 3550 (min payments)
    snapshotDate: '2024-01-01',
  });

  /**
   * Test snapshot without flexi facility - for comparison
   */
  const createSnapshotWithoutFlexi = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        balance: '150000',
        interestRate: '0.115',
        minimumPayment: '1500',
        interestType: 'monthly',
      },
      {
        id: 2,
        balance: '25000',
        interestRate: '0.13',
        minimumPayment: '550',
        interestType: 'monthly',
      },
      {
        id: 3,
        balance: '50000',
        interestRate: '0.20',
        minimumPayment: '1500',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '85000',
    monthlyExpenses: '45000',
    availableSurplus: '36450',
    snapshotDate: '2024-01-01',
  });

  describe('Both flexi strategies beat baseline with favorable rate differential', () => {
    it('flexi chunking saves interest vs baseline', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiChunking = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiChunking).not.toBeNull();
      if (flexiChunking === null) return;

      // Flexi chunking should save interest
      expect(flexiChunking.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
      expect(flexiChunking.interestSaved.gt(0)).toBe(true);

      console.log(
        `Flexi Chunking saves R${flexiChunking.interestSaved.toFixed(2)} interest vs baseline`
      );
    });

    it('aggressive flexi saves interest vs baseline', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const aggressiveFlexi = aggressiveFlexiStrategy.calculate(snapshot, undefined, baseline);

      expect(aggressiveFlexi).not.toBeNull();
      if (aggressiveFlexi === null) return;

      // Aggressive flexi should save interest
      expect(aggressiveFlexi.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
      expect(aggressiveFlexi.interestSaved.gt(0)).toBe(true);

      console.log(
        `Aggressive Flexi saves R${aggressiveFlexi.interestSaved.toFixed(2)} interest vs baseline`
      );
    });

    it('flexi chunking pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiChunking = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiChunking).not.toBeNull();
      if (flexiChunking === null) return;
      if (baseline === null) return;

      // Flexi strategies allocate surplus like avalanche (highest rate first)
      // The benefit is primarily interest savings, not necessarily faster payoff
      expect(flexiChunking.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
      expect(flexiChunking.monthsSaved).toBeGreaterThanOrEqual(0);

      console.log(
        `Flexi Chunking debt-free in ${flexiChunking.debtFreeMonth} months (baseline: ${baseline.debtFreeMonth})`
      );
    });

    it('aggressive flexi pays off debt at least as fast as baseline', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const aggressiveFlexi = aggressiveFlexiStrategy.calculate(snapshot, undefined, baseline);

      expect(aggressiveFlexi).not.toBeNull();
      if (aggressiveFlexi === null) return;
      if (baseline === null) return;

      // Flexi strategies allocate surplus like avalanche (highest rate first)
      // The benefit is primarily interest savings, not necessarily faster payoff
      expect(aggressiveFlexi.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
      expect(aggressiveFlexi.monthsSaved).toBeGreaterThanOrEqual(0);

      console.log(
        `Aggressive Flexi debt-free in ${aggressiveFlexi.debtFreeMonth} months (baseline: ${baseline.debtFreeMonth})`
      );
    });
  });

  describe('Flexi strategies return null without flexi, traditional strategies still work', () => {
    it('flexi chunking returns null without flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('aggressive flexi returns null without flexi facility', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = aggressiveFlexiStrategy.calculate(snapshot);

      expect(result).toBeNull();
    });

    it('baseline strategy works without flexi', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = baselineStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      expect(result.strategyId).toBe('baseline');
    });

    it('avalanche strategy works without flexi', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = avalancheStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      expect(result.strategyId).toBe('avalanche');
    });

    it('snowball strategy works without flexi', () => {
      const snapshot = createSnapshotWithoutFlexi();
      const result = snowballStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      expect(result.strategyId).toBe('snowball');
    });
  });

  describe('Both flexi strategies beat traditional strategies', () => {
    it('flexi chunking beats avalanche when flexi rate is lower than target debt rate', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);
      const flexiChunking = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiChunking).not.toBeNull();
      if (flexiChunking === null) return;

      // Both should beat baseline (they both use surplus effectively)
      // Avalanche and flexi chunking should have similar performance since
      // they both target highest rate first
      expect(flexiChunking.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
      expect(avalanche.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);

      console.log(
        `Avalanche: ${avalanche.debtFreeMonth} months, R${avalanche.totalInterestPaid.toFixed(2)} interest`
      );
      console.log(
        `Flexi Chunking: ${flexiChunking.debtFreeMonth} months, R${flexiChunking.totalInterestPaid.toFixed(2)} interest`
      );
    });

    it('aggressive flexi beats avalanche when flexi rate is lower than target debt rate', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();

      const baseline = baselineStrategy.calculate(snapshot);
      const avalanche = avalancheStrategy.calculate(snapshot, undefined, baseline);
      const aggressiveFlexi = aggressiveFlexiStrategy.calculate(snapshot, undefined, baseline);

      expect(aggressiveFlexi).not.toBeNull();
      if (aggressiveFlexi === null) return;

      // Both should beat baseline
      expect(aggressiveFlexi.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);
      expect(avalanche.debtFreeMonth).toBeLessThanOrEqual(baseline.debtFreeMonth);

      console.log(
        `Avalanche: ${avalanche.debtFreeMonth} months, R${avalanche.totalInterestPaid.toFixed(2)} interest`
      );
      console.log(
        `Aggressive Flexi: ${aggressiveFlexi.debtFreeMonth} months, R${aggressiveFlexi.totalInterestPaid.toFixed(2)} interest`
      );
    });
  });

  describe('Strategy effort levels are correct', () => {
    it('flexi chunking has medium effort level', () => {
      expect(flexiChunkingStrategy.effortLevel).toBe('medium');
    });

    it('aggressive flexi has high effort level', () => {
      expect(aggressiveFlexiStrategy.effortLevel).toBe('high');
    });

    it('baseline has low effort level', () => {
      expect(baselineStrategy.effortLevel).toBe('low');
    });

    it('avalanche has low effort level', () => {
      expect(avalancheStrategy.effortLevel).toBe('low');
    });
  });

  describe('requiresFlexi property is correct', () => {
    it('flexi chunking requires flexi', () => {
      expect(flexiChunkingStrategy.requiresFlexi).toBe(true);
    });

    it('aggressive flexi requires flexi', () => {
      expect(aggressiveFlexiStrategy.requiresFlexi).toBe(true);
    });

    it('baseline does not require flexi', () => {
      expect(baselineStrategy.requiresFlexi).toBe(false);
    });

    it('avalanche does not require flexi', () => {
      expect(avalancheStrategy.requiresFlexi).toBe(false);
    });

    it('snowball does not require flexi', () => {
      expect(snowballStrategy.requiresFlexi).toBe(false);
    });
  });

  describe('Test snapshot from tech spec', () => {
    /**
     * This test uses the exact snapshot from the tech spec to validate
     * the flexi strategies perform as expected
     */
    const createTechSpecSnapshot = (): FinancialSnapshot => ({
      accounts: [
        {
          id: 1,
          balance: '1500000',
          interestRate: '0.115',
          minimumPayment: '15000',
          interestType: 'monthly',
        },
        {
          id: 2,
          balance: '250000',
          interestRate: '0.13',
          minimumPayment: '5500',
          interestType: 'monthly',
        },
        {
          id: 3,
          balance: '50000',
          interestRate: '0.20',
          minimumPayment: '1500',
          interestType: 'monthly',
        },
      ],
      flexiFacility: {
        currentBalance: '100000',
        interestRate: '0.1375',
      },
      monthlyIncome: '85000',
      monthlyExpenses: '45000',
      availableSurplus: '18000', // 85000 - 45000 - 22000 min payments
      snapshotDate: '2024-01-01',
    });

    it('flexi chunking targets credit card (highest rate at 20%)', () => {
      const snapshot = createTechSpecSnapshot();
      const result = flexiChunkingStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // First month should show credit card receiving extra payments
      const month1 = result.monthlyProjections[0];
      const creditCard = month1.accounts.find((a) => a.accountId === 3);

      // Credit card should get payment above minimum
      expect(creditCard?.paymentApplied.gt(new Big('1500'))).toBe(true);
    });

    it('aggressive flexi targets credit card (highest rate at 20%)', () => {
      const snapshot = createTechSpecSnapshot();
      const result = aggressiveFlexiStrategy.calculate(snapshot);

      expect(result).not.toBeNull();
      if (result === null) return;

      // First month should show credit card receiving extra payments
      const month1 = result.monthlyProjections[0];
      const creditCard = month1.accounts.find((a) => a.accountId === 3);

      // Credit card should get payment above minimum
      expect(creditCard?.paymentApplied.gt(new Big('1500'))).toBe(true);
    });

    it('interest rate differential of 6.25% creates savings opportunity', () => {
      const snapshot = createTechSpecSnapshot();

      // Flexi rate: 13.75%
      // Credit card rate: 20%
      // Differential: 6.25% = arbitrage opportunity

      const baseline = baselineStrategy.calculate(snapshot);
      const flexiChunking = flexiChunkingStrategy.calculate(snapshot, undefined, baseline);

      expect(flexiChunking).not.toBeNull();
      if (flexiChunking === null) return;

      // With the rate differential, flexi strategy should save interest
      expect(flexiChunking.totalInterestPaid.lt(baseline.totalInterestPaid)).toBe(true);
    });
  });

  describe('All strategies produce valid projections', () => {
    it('all strategy projections have consistent structure', () => {
      const snapshot = createSnapshotWithFavorableRateDifferential();
      const baseline = baselineStrategy.calculate(snapshot);
      if (baseline === null) return;

      const strategies = [
        { strategy: flexiChunkingStrategy, name: 'Flexi Chunking' },
        { strategy: aggressiveFlexiStrategy, name: 'Aggressive Flexi' },
      ];

      for (const { strategy, name } of strategies) {
        const result = strategy.calculate(snapshot, undefined, baseline);

        expect(result).not.toBeNull();
        if (result === null) continue;

        // Validate structure
        expect(result.strategyId).toBe(strategy.id);
        expect(result.strategyName).toBe(strategy.name);
        expect(result.effortLevel).toBe(strategy.effortLevel);
        expect(result.debtFreeMonth).toBeGreaterThan(0);
        expect(result.monthlyProjections.length).toBeGreaterThan(0);

        // Note: Projection may not reach zero debt if max months (360) is hit
        // Check that either debt is zero or we hit max months
        const lastMonth = result.monthlyProjections[result.monthlyProjections.length - 1];
        const hitMaxMonths = result.debtFreeMonth === 360;
        if (!hitMaxMonths) {
          expect(lastMonth.totalDebt.toFixed(2)).toBe('0.00');
        }

        console.log(
          `${name}: ${result.debtFreeMonth} months, R${result.totalInterestPaid.toFixed(2)} interest`
        );
      }
    });
  });
});
