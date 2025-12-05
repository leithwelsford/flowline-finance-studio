/**
 * Hybrid Flexi-Avalanche Strategy
 *
 * Combines flexi chunking methodology with avalanche debt targeting.
 * Uses the flexi facility as a batching account while targeting the
 * highest interest rate first for maximum interest savings.
 *
 * The hybrid approach:
 * 1. Park surplus in flexi facility (benefit from daily interest)
 * 2. Target highest interest rate debt first (avalanche targeting)
 * 3. Roll payment to next highest rate when debt paid off
 *
 * Best for: Users who have a flexi facility and want the mathematically
 * optimal outcome for minimizing total interest paid.
 *
 * Note: This strategy is very similar to flexi-chunking (which also uses
 * avalanche targeting), but makes the combination explicit.
 *
 * FR20: Hybrid Flexi-Avalanche Strategy
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
 * Hybrid Flexi-Avalanche Strategy Implementation
 *
 * Combines flexi facility benefits with avalanche targeting (highest rate first).
 * Effort level: medium (requires flexi management, but simpler than velocity banking)
 * Flexi required: yes
 */
export const hybridAvalancheStrategy: DebtStrategy = {
  id: 'hybrid-flexi-avalanche',
  name: 'Hybrid Flexi-Avalanche',
  description:
    'Combine flexi facility benefits with avalanche targeting. Park surplus in flexi, ' +
    'then target highest interest rate first for maximum savings while benefiting ' +
    'from flexi interest arbitrage.',
  effortLevel: 'medium',
  requiresFlexi: true,

  /**
   * Calculate hybrid flexi-avalanche projection
   *
   * Returns null if no flexi facility exists (AC-4.6.6)
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection | null {
    // AC-4.6.6: Return null if no flexi facility
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

    // Generate projection with hybrid avalanche allocator
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
   * Allocate surplus using hybrid flexi-avalanche pattern
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
