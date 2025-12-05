/**
 * Snowball Strategy - Smallest Balance First
 *
 * The debt snowball strategy allocates all surplus payments to the account
 * with the smallest balance. When that account is paid off, the payment
 * "rolls" to the next smallest balance, creating a snowball effect.
 *
 * This strategy provides psychological wins through faster account payoffs,
 * building motivation to continue the debt payoff journey.
 *
 * FR14: Debt Snowball prioritizes smallest balance first
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
 * Snowball Strategy Implementation
 *
 * Allocates all surplus to smallest balance first.
 * When target is paid off, rolls payment to next smallest.
 * Effort level: low (simple rule, easy to follow)
 * Flexi required: no
 */
export const snowballStrategy: DebtStrategy = {
  id: 'snowball',
  name: 'Debt Snowball (Smallest First)',
  description:
    'Apply all extra payments to the smallest balance first. When paid off, ' +
    'roll that payment to the next smallest. Quick wins build motivation.',
  effortLevel: 'low',
  requiresFlexi: false,

  /**
   * Calculate snowball projection
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection {
    // Apply config to get effective surplus
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

    // Generate projection with snowball allocator
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
      _flexi: SimulatedFlexi | null
    ): PaymentAllocation[] => {
      // No surplus to allocate
      if (surplus.lte(0)) {
        return [];
      }

      // Filter to accounts with positive balance
      const activeAccounts = accounts.filter((acc) => acc.balance.gt(0));

      if (activeAccounts.length === 0) {
        return [];
      }

      // Default sorter: smallest balance first
      const snowballSorter = (accs: SimulatedAccount[]) =>
        [...accs].sort((a, b) => a.balance.cmp(b.balance));

      // Apply target override if configured, otherwise use snowball sorting
      const sorted = applyTargetOverride(
        activeAccounts,
        config?.targetAccountId,
        snowballSorter
      );

      // Allocate all surplus to the target (first in sorted list)
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
   * Allocate surplus to smallest balance first
   *
   * Sorts accounts by balance (ascending) and allocates all surplus
   * to the account with the smallest non-zero balance.
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
