/**
 * Flexi Chunking Strategy - Regular Lump Sum Payments via Flexi Facility
 *
 * The flexi chunking strategy uses the flexi facility as a "batching account"
 * to make regular lump sum payments to the highest-rate debt. The cycle:
 *
 * 1. Accumulate surplus in flexi (reducing flexi balance)
 * 2. When accumulated, make lump sum to target debt (highest rate)
 * 3. Flexi balance increases by chunk amount
 * 4. Continue making payments + interest on flexi
 * 5. Repeat cycle
 *
 * Interest arbitrage: Flexi uses daily compounding (rate/365 × days) while
 * standard debts use monthly (rate/12). If flexi rate < debt rate, net savings.
 *
 * FR16: Flexi Chunking Strategy
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
 * Flexi Chunking Strategy Implementation
 *
 * Uses flexi facility as batching account for lump sum payments to highest-rate debt.
 * Effort level: medium (requires tracking flexi balance, timing chunks)
 * Flexi required: yes
 */
export const flexiChunkingStrategy: DebtStrategy = {
  id: 'flexi-chunking',
  name: 'Flexi Chunking',
  description:
    'Use your flexi facility to batch monthly surplus into regular lump sum payments ' +
    'to your highest-rate debt. Benefits from the interest rate differential between ' +
    'your flexi and higher-rate debts.',
  effortLevel: 'medium',
  requiresFlexi: true,

  /**
   * Calculate flexi chunking projection
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

    // Generate projection with flexi chunking allocator
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
   * Allocate surplus using flexi chunking pattern
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
