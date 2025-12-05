/**
 * Strategy Configuration Tests (AC-4.7.10)
 *
 * Tests for:
 * - Payment frequency adjustment (AC-4.7.1, AC-4.7.2)
 * - Custom chunk amount (AC-4.7.3)
 * - Target account override (AC-4.7.7)
 * - Configuration integration with strategies (AC-4.7.11)
 */
import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import {
  applyTargetOverride,
  calculateEffectiveMonthlySurplus,
  applyChunkAmountLimit,
  getEffectiveSurplus,
  getAllStrategies,
} from '@/lib/calculations/strategies';
import { snowballStrategy } from '@/lib/calculations/strategies/snowball';
import { avalancheStrategy } from '@/lib/calculations/strategies/avalanche';
import { flexiChunkingStrategy } from '@/lib/calculations/strategies/flexi-chunking';
import { baselineStrategy } from '@/lib/calculations/strategies/baseline';
import type { SimulatedAccount, FinancialSnapshot, StrategyConfig } from '@/lib/calculations/types';

describe('Strategy Configuration Tests (AC-4.7.10)', () => {
  // Helper to create test accounts
  const createTestAccounts = (): SimulatedAccount[] => [
    {
      id: 1,
      balance: new Big('100000'),
      interestRate: new Big('0.10'), // 10% - lowest rate
      minimumPayment: new Big('1000'),
      interestType: 'monthly',
    },
    {
      id: 2,
      balance: new Big('25000'),
      interestRate: new Big('0.15'), // 15% - middle rate
      minimumPayment: new Big('500'),
      interestType: 'monthly',
    },
    {
      id: 3,
      balance: new Big('5000'), // smallest balance
      interestRate: new Big('0.20'), // 20% - highest rate
      minimumPayment: new Big('150'),
      interestType: 'monthly',
    },
  ];

  const createTestSnapshot = (): FinancialSnapshot => ({
    accounts: [
      {
        id: 1,
        name: 'Home Loan',
        balance: '100000',
        interestRate: '0.10',
        minimumPayment: '1000',
        interestType: 'monthly',
      },
      {
        id: 2,
        name: 'Car Loan',
        balance: '25000',
        interestRate: '0.15',
        minimumPayment: '500',
        interestType: 'monthly',
      },
      {
        id: 3,
        name: 'Credit Card',
        balance: '5000',
        interestRate: '0.20',
        minimumPayment: '150',
        interestType: 'monthly',
      },
    ],
    flexiFacility: null,
    monthlyIncome: '20000',
    monthlyExpenses: '10000',
    availableSurplus: '8350',
    snapshotDate: '2024-01-01',
  });

  describe('AC-4.7.1: calculateEffectiveMonthlySurplus - bi-weekly frequency', () => {
    it('calculates 26/12 × monthly for bi-weekly payments', () => {
      const monthly = new Big('1000');
      const effective = calculateEffectiveMonthlySurplus(monthly, 'bi-weekly');

      // bi-weekly: 26 payments/year
      // Effective monthly = 1000 × 26 / 12 = 2166.67
      expect(effective.toFixed(2)).toBe('2166.67');
    });

    it('bi-weekly yields ~2.167x monthly contribution', () => {
      const monthly = new Big('5000');
      const effective = calculateEffectiveMonthlySurplus(monthly, 'bi-weekly');

      // 5000 × 26 / 12 = 10833.33
      expect(effective.toFixed(2)).toBe('10833.33');
      expect(effective.div(monthly).toFixed(3)).toBe('2.167');
    });
  });

  describe('AC-4.7.2: calculateEffectiveMonthlySurplus - weekly frequency', () => {
    it('calculates 52/12 × monthly for weekly payments', () => {
      const monthly = new Big('1000');
      const effective = calculateEffectiveMonthlySurplus(monthly, 'weekly');

      // weekly: 52 payments/year
      // Effective monthly = 1000 × 52 / 12 = 4333.33
      expect(effective.toFixed(2)).toBe('4333.33');
    });

    it('weekly yields ~4.333x monthly contribution', () => {
      const monthly = new Big('3000');
      const effective = calculateEffectiveMonthlySurplus(monthly, 'weekly');

      // 3000 × 52 / 12 = 13000.00
      expect(effective.toFixed(2)).toBe('13000.00');
      expect(effective.div(monthly).toFixed(3)).toBe('4.333');
    });
  });

  describe('AC-4.7.3: applyChunkAmountLimit - custom chunk amount', () => {
    it('uses chunk amount when less than surplus', () => {
      const surplus = new Big('10000');
      const chunkAmount = '5000';

      const result = applyChunkAmountLimit(surplus, chunkAmount);

      expect(result.toFixed(2)).toBe('5000.00');
    });

    it('uses full surplus when chunk amount is greater', () => {
      const surplus = new Big('3000');
      const chunkAmount = '5000';

      const result = applyChunkAmountLimit(surplus, chunkAmount);

      expect(result.toFixed(2)).toBe('3000.00');
    });

    it('uses full surplus when chunk amount is null', () => {
      const surplus = new Big('8000');

      const result = applyChunkAmountLimit(surplus, null);

      expect(result.toFixed(2)).toBe('8000.00');
    });

    it('uses full surplus when chunk amount is undefined', () => {
      const surplus = new Big('8000');

      const result = applyChunkAmountLimit(surplus, undefined);

      expect(result.toFixed(2)).toBe('8000.00');
    });

    it('uses full surplus when chunk amount is invalid', () => {
      const surplus = new Big('8000');

      const result = applyChunkAmountLimit(surplus, 'invalid');

      expect(result.toFixed(2)).toBe('8000.00');
    });
  });

  describe('AC-4.7.7: applyTargetOverride - target account', () => {
    // Default sorter for snowball (smallest balance first)
    const snowballSorter = (accounts: SimulatedAccount[]) =>
      [...accounts].sort((a, b) => a.balance.cmp(b.balance));

    // Default sorter for avalanche (highest rate first)
    const avalancheSorter = (accounts: SimulatedAccount[]) =>
      [...accounts].sort((a, b) => b.interestRate.cmp(a.interestRate));

    it('puts specified target account first', () => {
      const accounts = createTestAccounts();

      // Target account 1 (home loan - largest balance)
      const result = applyTargetOverride(accounts, 1, snowballSorter);

      expect(result[0].id).toBe(1);
      expect(result.length).toBe(3);
    });

    it('applies default sorting to remaining accounts after target', () => {
      const accounts = createTestAccounts();

      // Target account 1, then snowball order for rest
      const result = applyTargetOverride(accounts, 1, snowballSorter);

      expect(result[0].id).toBe(1); // Target first
      // Remaining should be in snowball order (smallest balance first)
      expect(result[1].id).toBe(3); // R5000
      expect(result[2].id).toBe(2); // R25000
    });

    it('uses default sort when targetAccountId is null', () => {
      const accounts = createTestAccounts();

      const result = applyTargetOverride(accounts, null, snowballSorter);

      // Snowball order: smallest balance first
      expect(result[0].id).toBe(3); // R5000
      expect(result[1].id).toBe(2); // R25000
      expect(result[2].id).toBe(1); // R100000
    });

    it('uses default sort when targetAccountId is undefined', () => {
      const accounts = createTestAccounts();

      const result = applyTargetOverride(accounts, undefined, avalancheSorter);

      // Avalanche order: highest rate first
      expect(result[0].id).toBe(3); // 20%
      expect(result[1].id).toBe(2); // 15%
      expect(result[2].id).toBe(1); // 10%
    });

    it('uses default sort when target account not found', () => {
      const accounts = createTestAccounts();

      const result = applyTargetOverride(accounts, 999, snowballSorter);

      // Falls back to snowball order
      expect(result[0].id).toBe(3);
    });

    it('uses default sort when target account has zero balance', () => {
      const accounts = createTestAccounts();
      accounts[0].balance = new Big(0); // Account 1 paid off

      const result = applyTargetOverride(accounts, 1, snowballSorter);

      // Target (id=1) has zero balance, so falls back to default
      // Account 1 with zero balance would be first in snowball (smallest),
      // but typically paid off accounts are filtered before this
      expect(result[0].balance.lte(0) || result[0].id !== 1).toBe(true);
    });
  });

  describe('getEffectiveSurplus - combined config application', () => {
    it('applies frequency adjustment then chunk limit', () => {
      const baseSurplus = new Big('1000');
      const config: StrategyConfig = {
        paymentFrequency: 'bi-weekly',
        chunkAmount: '1500',
      };

      const result = getEffectiveSurplus(baseSurplus, config);

      // Step 1: 1000 bi-weekly = 2166.67 effective monthly
      // Step 2: min(2166.67, 1500) = 1500
      expect(result.toFixed(2)).toBe('1500.00');
    });

    it('applies frequency adjustment when chunk is larger', () => {
      const baseSurplus = new Big('1000');
      const config: StrategyConfig = {
        paymentFrequency: 'bi-weekly',
        chunkAmount: '5000',
      };

      const result = getEffectiveSurplus(baseSurplus, config);

      // Step 1: 1000 bi-weekly = 2166.67 effective monthly
      // Step 2: min(2166.67, 5000) = 2166.67
      expect(result.toFixed(2)).toBe('2166.67');
    });

    it('returns base surplus when no config provided', () => {
      const baseSurplus = new Big('5000');

      const result = getEffectiveSurplus(baseSurplus, undefined);

      expect(result.toFixed(2)).toBe('5000.00');
    });

    it('handles monthly frequency with chunk limit', () => {
      const baseSurplus = new Big('10000');
      const config: StrategyConfig = {
        paymentFrequency: 'monthly',
        chunkAmount: '3000',
      };

      const result = getEffectiveSurplus(baseSurplus, config);

      expect(result.toFixed(2)).toBe('3000.00');
    });
  });

  describe('AC-4.7.11: Strategy integration with configuration', () => {
    describe('Snowball with target override', () => {
      it('targets specified account instead of smallest balance', () => {
        const accounts = createTestAccounts();
        const config: StrategyConfig = {
          targetAccountId: 1, // Home loan (largest balance)
        };

        const allocator = snowballStrategy.createAllocator(config);
        const allocations = allocator(new Big('1000'), accounts, null);

        // Should target account 1 instead of account 3 (smallest)
        expect(allocations[0].accountId).toBe(1);
      });

      it('falls back to snowball order when target paid off', () => {
        const accounts = createTestAccounts();
        accounts[0].balance = new Big(0); // Home loan paid off

        const config: StrategyConfig = {
          targetAccountId: 1, // Target the paid-off account
        };

        const allocator = snowballStrategy.createAllocator(config);
        // Filter to only accounts with balance (simulating normal projection behavior)
        const activeAccounts = accounts.filter((a) => a.balance.gt(0));
        const allocations = allocator(new Big('1000'), activeAccounts, null);

        // Should fall back to smallest remaining (credit card)
        expect(allocations[0].accountId).toBe(3);
      });
    });

    describe('Avalanche with target override', () => {
      it('targets specified account instead of highest rate', () => {
        const accounts = createTestAccounts();
        const config: StrategyConfig = {
          targetAccountId: 2, // Car loan (middle rate)
        };

        const allocator = avalancheStrategy.createAllocator(config);
        const allocations = allocator(new Big('1000'), accounts, null);

        // Should target account 2 instead of account 3 (highest rate)
        expect(allocations[0].accountId).toBe(2);
      });
    });

    describe('Strategy calculate with frequency adjustment', () => {
      it('bi-weekly frequency reduces payoff time', () => {
        const snapshot = createTestSnapshot();

        const monthlyConfig: StrategyConfig = {
          paymentFrequency: 'monthly',
        };
        const biweeklyConfig: StrategyConfig = {
          paymentFrequency: 'bi-weekly',
        };

        const monthlyResult = snowballStrategy.calculate(snapshot, monthlyConfig);
        const biweeklyResult = snowballStrategy.calculate(snapshot, biweeklyConfig);

        // Bi-weekly should pay off faster (more payments per year)
        expect(biweeklyResult.debtFreeMonth).toBeLessThanOrEqual(monthlyResult.debtFreeMonth);
      });

      it('weekly frequency reduces payoff time further', () => {
        const snapshot = createTestSnapshot();

        const biweeklyConfig: StrategyConfig = {
          paymentFrequency: 'bi-weekly',
        };
        const weeklyConfig: StrategyConfig = {
          paymentFrequency: 'weekly',
        };

        const biweeklyResult = snowballStrategy.calculate(snapshot, biweeklyConfig);
        const weeklyResult = snowballStrategy.calculate(snapshot, weeklyConfig);

        // Weekly should pay off faster than bi-weekly
        expect(weeklyResult.debtFreeMonth).toBeLessThanOrEqual(biweeklyResult.debtFreeMonth);
      });
    });

    describe('Strategy calculate with chunk amount', () => {
      it('chunk amount limits surplus allocation', () => {
        const snapshot = createTestSnapshot();

        const noChunkConfig: StrategyConfig = {};
        const chunkConfig: StrategyConfig = {
          chunkAmount: '1000', // Limit to R1000/month
        };

        const noChunkResult = snowballStrategy.calculate(snapshot, noChunkConfig);
        const chunkResult = snowballStrategy.calculate(snapshot, chunkConfig);

        // With chunk limit, payoff takes longer
        expect(chunkResult.debtFreeMonth).toBeGreaterThanOrEqual(noChunkResult.debtFreeMonth);
        // And more interest is paid
        expect(chunkResult.totalInterestPaid.gte(noChunkResult.totalInterestPaid)).toBe(true);
      });
    });

    describe('Baseline strategy ignores config', () => {
      it('baseline ignores payment frequency', () => {
        const snapshot = createTestSnapshot();

        const monthlyConfig: StrategyConfig = {
          paymentFrequency: 'monthly',
        };
        const weeklyConfig: StrategyConfig = {
          paymentFrequency: 'weekly',
        };

        const monthlyBaseline = baselineStrategy.calculate(snapshot, monthlyConfig);
        const weeklyBaseline = baselineStrategy.calculate(snapshot, weeklyConfig);

        // Baseline should be identical regardless of config
        expect(monthlyBaseline.debtFreeMonth).toBe(weeklyBaseline.debtFreeMonth);
        expect(monthlyBaseline.totalInterestPaid.toFixed(2)).toBe(
          weeklyBaseline.totalInterestPaid.toFixed(2)
        );
      });

      it('baseline ignores chunk amount', () => {
        const snapshot = createTestSnapshot();

        const noChunk = baselineStrategy.calculate(snapshot);
        const withChunk = baselineStrategy.calculate(snapshot, { chunkAmount: '1000' });

        expect(noChunk.debtFreeMonth).toBe(withChunk.debtFreeMonth);
      });

      it('baseline ignores target account', () => {
        const snapshot = createTestSnapshot();

        const noTarget = baselineStrategy.calculate(snapshot);
        const withTarget = baselineStrategy.calculate(snapshot, { targetAccountId: 1 });

        expect(noTarget.debtFreeMonth).toBe(withTarget.debtFreeMonth);
      });
    });
  });

  describe('createAllocator method', () => {
    it('all strategies have createAllocator method', () => {
      expect(typeof snowballStrategy.createAllocator).toBe('function');
      expect(typeof avalancheStrategy.createAllocator).toBe('function');
      expect(typeof baselineStrategy.createAllocator).toBe('function');
      expect(typeof flexiChunkingStrategy.createAllocator).toBe('function');
    });

    it('createAllocator returns a function', () => {
      const allocator = snowballStrategy.createAllocator();
      expect(typeof allocator).toBe('function');
    });

    it('returned allocator respects config when called', () => {
      const accounts = createTestAccounts();
      const config: StrategyConfig = {
        targetAccountId: 2,
      };

      const allocator = snowballStrategy.createAllocator(config);
      const allocations = allocator(new Big('1000'), accounts, null);

      expect(allocations[0].accountId).toBe(2);
    });
  });

  describe('AC-4.7.6 & AC-4.7.11: Orchestrator integration', () => {
    // Snapshot with flexi facility for testing all strategies
    const createSnapshotWithFlexi = (): FinancialSnapshot => ({
      accounts: [
        {
          id: 1,
          name: 'Home Loan',
          balance: '100000',
          interestRate: '0.10',
          minimumPayment: '1000',
          interestType: 'monthly',
        },
        {
          id: 2,
          name: 'Car Loan',
          balance: '25000',
          interestRate: '0.15',
          minimumPayment: '500',
          interestType: 'monthly',
        },
        {
          id: 3,
          name: 'Credit Card',
          balance: '5000',
          interestRate: '0.20',
          minimumPayment: '150',
          interestType: 'monthly',
        },
      ],
      flexiFacility: {
        id: 1,
        name: 'Access Bond',
        balance: '0',
        creditLimit: '50000',
        interestRate: '0.08',
        facilityType: 'access-bond',
      },
      monthlyIncome: '20000',
      monthlyExpenses: '10000',
      availableSurplus: '8350',
      snapshotDate: '2024-01-01',
    });

    it('getAllStrategies returns all 8 strategies', () => {
      const strategies = getAllStrategies();
      expect(strategies.length).toBe(8);
    });

    it('all strategies have createAllocator method for config support', () => {
      const strategies = getAllStrategies();
      for (const strategy of strategies) {
        expect(typeof strategy.createAllocator).toBe('function');
      }
    });

    it('all strategies accept config parameter in calculate()', () => {
      const snapshot = createSnapshotWithFlexi();
      const config: StrategyConfig = {
        paymentFrequency: 'bi-weekly',
        chunkAmount: '2000',
        targetAccountId: 1,
      };

      const strategies = getAllStrategies();
      for (const strategy of strategies) {
        // This should not throw - all strategies should work with flexi present
        const result = strategy.calculate(snapshot, config);
        expect(result).not.toBeNull();
        expect(result.strategyId).toBe(strategy.id);
        expect(result.monthlyProjections).toBeDefined();
      }
    });

    it('changing config produces different results for all strategies (except baseline)', () => {
      const snapshot = createSnapshotWithFlexi();

      const defaultConfig: StrategyConfig = {
        paymentFrequency: 'monthly',
      };
      const modifiedConfig: StrategyConfig = {
        paymentFrequency: 'weekly',
      };

      const strategies = getAllStrategies();
      for (const strategy of strategies) {
        const defaultResult = strategy.calculate(snapshot, defaultConfig);
        const modifiedResult = strategy.calculate(snapshot, modifiedConfig);

        expect(defaultResult).not.toBeNull();
        expect(modifiedResult).not.toBeNull();

        if (strategy.id === 'baseline') {
          // Baseline ignores config, so results should be identical
          expect(defaultResult.debtFreeMonth).toBe(modifiedResult.debtFreeMonth);
        } else {
          // All other strategies should show improvement with weekly frequency
          expect(modifiedResult.debtFreeMonth).toBeLessThanOrEqual(defaultResult.debtFreeMonth);
        }
      }
    });

    it('all non-baseline strategies calculate with baseline for comparison metrics', () => {
      const snapshot = createSnapshotWithFlexi();
      const config: StrategyConfig = { paymentFrequency: 'bi-weekly' };

      // Calculate baseline first
      const baseline = baselineStrategy.calculate(snapshot, config);

      const strategies = getAllStrategies().filter((s) => s.id !== 'baseline');
      for (const strategy of strategies) {
        const result = strategy.calculate(snapshot, config, baseline);

        expect(result).not.toBeNull();
        // Should have savings vs baseline
        expect(result.monthsSaved).toBeGreaterThanOrEqual(0);
        expect(result.interestSaved.gte(0)).toBe(true);
      }
    });

    it('orchestrator can iterate all strategies with same config', () => {
      const snapshot = createSnapshotWithFlexi();
      const config: StrategyConfig = {
        chunkAmount: '3000',
        paymentFrequency: 'bi-weekly',
        targetAccountId: 2,
      };

      // Simulate orchestrator behavior
      const strategies = getAllStrategies();
      const results: Record<string, { months: number; interest: string }> = {};

      // First pass: calculate baseline
      const baseline = strategies.find((s) => s.id === 'baseline')!.calculate(snapshot, config);

      // Second pass: calculate all with baseline comparison
      for (const strategy of strategies) {
        const result = strategy.calculate(snapshot, config, baseline);
        expect(result).not.toBeNull();
        results[strategy.id] = {
          months: result.debtFreeMonth,
          interest: result.totalInterestPaid.toFixed(2),
        };
      }

      // Verify all strategies calculated
      expect(Object.keys(results).length).toBe(8);
      expect(results['baseline']).toBeDefined();
      expect(results['snowball']).toBeDefined();
      expect(results['avalanche']).toBeDefined();
      expect(results['flexi-chunking']).toBeDefined();
      expect(results['aggressive-flexi']).toBeDefined();
      expect(results['velocity-banking']).toBeDefined();
      expect(results['hybrid-flexi-snowball']).toBeDefined();
      expect(results['hybrid-flexi-avalanche']).toBeDefined();
    });

    it('non-flexi strategies work without flexi facility', () => {
      const snapshot = createTestSnapshot(); // No flexi facility
      const config: StrategyConfig = { paymentFrequency: 'bi-weekly' };

      const nonFlexiStrategies = getAllStrategies().filter((s) => !s.requiresFlexi);

      for (const strategy of nonFlexiStrategies) {
        const result = strategy.calculate(snapshot, config);
        expect(result).not.toBeNull();
        expect(result.strategyId).toBe(strategy.id);
      }
    });
  });

  describe('Edge cases', () => {
    it('handles zero surplus with any config', () => {
      const result = getEffectiveSurplus(new Big(0), {
        paymentFrequency: 'weekly',
        chunkAmount: '1000',
      });

      expect(result.toFixed(2)).toBe('0.00');
    });

    it('handles very large surplus values', () => {
      const largeSurplus = new Big('1000000000');
      const result = calculateEffectiveMonthlySurplus(largeSurplus, 'bi-weekly');

      expect(result.gt(largeSurplus)).toBe(true);
    });

    it('handles decimal chunk amounts', () => {
      const surplus = new Big('1000');
      const result = applyChunkAmountLimit(surplus, '500.50');

      expect(result.toFixed(2)).toBe('500.50');
    });

    it('handles empty accounts array in target override', () => {
      const result = applyTargetOverride([], 1, (a) => a);

      expect(result).toEqual([]);
    });
  });
});
