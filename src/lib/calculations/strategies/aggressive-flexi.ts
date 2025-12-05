/**
 * Aggressive Flexi Strategy - Maximum Flexi Utilization
 *
 * The aggressive flexi strategy maximizes the time money spends in the lower-rate
 * flexi facility vs higher-rate debt accounts. The pattern:
 *
 * 1. All surplus deposited to flexi immediately (lowers flexi balance)
 * 2. Income deposited to flexi on payday
 * 3. Expenses drawn from flexi throughout month
 * 4. Net effect: lower average daily balance = less interest
 * 5. Periodically transfer large lump sums to target debt (highest rate)
 *
 * Key insight: Daily interest calculated on actual daily balance means lower
 * average balance = lower total interest. More aggressive than chunking because
 * it maximizes the benefit from the daily calculation.
 *
 * FR17: Aggressive Flexi Strategy
 * ADR-004: Strategy Pattern
 * ADR-003: big.js for financial calculations
 */
import Big from 'big.js';
import { generateProjection } from '../projections';
import {
  buildStrategyProjection,
  applyTargetOverride,
  getEffectiveSurplus,
} from './strategy-helpers';
import type {
  DebtStrategy,
  FinancialSnapshot,
  StrategyConfig,
  StrategyProjection,
  SimulatedAccount,
  SimulatedFlexi,
  PaymentAllocation,
} from '../types';

/**
 * Aggressive Flexi Strategy Implementation
 *
 * Maximizes flexi utilization with periodic large lump sum payments.
 * Effort level: high (requires all money flow through flexi, active management)
 * Flexi required: yes
 */
export const aggressiveFlexiStrategy: DebtStrategy = {
  id: 'aggressive-flexi',
  name: 'Aggressive Flexi',
  description:
    'Maximize your flexi facility usage by channeling all money through it. ' +
    'Benefit from daily interest calculation on a lower average balance, then ' +
    'make periodic large lump sum payments to your highest-rate debt. ' +
    'Requires active management of all income and expenses through the flexi.',
  effortLevel: 'high',
  requiresFlexi: true,

  /**
   * Calculate aggressive flexi projection
   *
   * Returns null if no flexi facility exists (AC-4.4.4)
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection | null {
    // AC-4.4.4: Return null if no flexi facility
    if (!snapshot.flexiFacility) {
      return null;
    }

    // Apply config to get effective surplus (includes chunk amount limit)
    const baseSurplus = new Big(snapshot.availableSurplus || '0');
    const effectiveSurplus = getEffectiveSurplus(baseSurplus, config);

    // Create modified snapshot with adjusted surplus
    const adjustedSnapshot: FinancialSnapshot = {
      ...snapshot,
      availableSurplus: effectiveSurplus.toString(),
    };

    // Create allocator closure that includes config for target override
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.createAllocator(config)(surplus, accounts, flexi);

    // Generate projection with aggressive flexi allocator
    const projections = generateProjection(adjustedSnapshot, allocator, {
      maxMonths: config?.maxMonths,
      startDate: config?.startDate ?? snapshot.snapshotDate,
    });

    // Build the strategy projection with baseline comparison
    return buildStrategyProjection(
      this,
      projections,
      config?.startDate ?? snapshot.snapshotDate,
      baseline
    );
  },

  /**
   * Create an allocator function with config applied
   */
  createAllocator(config?: StrategyConfig) {
    return (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ): PaymentAllocation[] => {
      // No surplus to allocate
      if (surplus.lte(0)) {
        return [];
      }

      // No flexi facility - shouldn't happen as calculate() checks, but be safe
      if (!flexi) {
        return [];
      }

      // Filter to accounts with positive balance
      const activeAccounts = accounts.filter((acc) => acc.balance.gt(0));

      if (activeAccounts.length === 0) {
        return [];
      }

      // Default sorter: highest interest rate first (avalanche targeting)
      const avalancheSorter = (accs: SimulatedAccount[]) =>
        [...accs].sort((a, b) => b.interestRate.cmp(a.interestRate));

      // Apply target override if configured, otherwise use avalanche sorting
      const sorted = applyTargetOverride(
        activeAccounts,
        config?.targetAccountId,
        avalancheSorter
      );

      const target = sorted[0];

      return [
        {
          accountId: target.id,
          amount: surplus,
        },
      ];
    };
  },

  /**
   * Allocate surplus using aggressive flexi pattern
   *
   * @deprecated Use createAllocator with config for target override support
   */
  allocatePayment(
    surplus: Big,
    accounts: SimulatedAccount[],
    flexi: SimulatedFlexi | null
  ): PaymentAllocation[] {
    return this.createAllocator()(surplus, accounts, flexi);
  },
};
