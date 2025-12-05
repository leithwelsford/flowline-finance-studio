/**
 * Velocity Banking Strategy - SA Adaptation
 *
 * Velocity banking uses the flexi facility as the PRIMARY account for all cash flow.
 * Unlike flexi chunking (which batches surplus), velocity banking routes ALL income
 * through the flexi, with expenses drawn from it throughout the month.
 *
 * The "velocity banking" name comes from the concept that money moves faster through
 * the flexi to work harder against debt. In SA context:
 *
 * 1. Salary deposited into flexi (reduces flexi balance immediately)
 * 2. Expenses paid from flexi throughout month (increases flexi balance)
 * 3. Net effect: surplus reduces average daily balance = less interest
 * 4. Periodic chunks transferred to target debt (highest rate first)
 *
 * Key differentiator: Income PARKS in flexi from day 1, reducing average balance
 * for the entire month. This is more aggressive than flexi chunking.
 *
 * FR18: Velocity Banking Strategy (SA Adaptation)
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
 * Velocity Banking Strategy Implementation
 *
 * Uses flexi facility as primary account for all cash flow.
 * Models the "income parking" effect where money spends more time
 * reducing the flexi balance, leading to lower average daily balance
 * and less interest charged.
 *
 * Effort level: high (requires routing ALL income through flexi,
 * paying ALL expenses from flexi, active management)
 * Flexi required: yes
 */
export const velocityBankingStrategy: DebtStrategy = {
  id: 'velocity-banking',
  name: 'Velocity Banking',
  description:
    'Route all income through your flexi facility and pay all expenses from it. ' +
    'Your money spends more time offsetting the flexi balance, reducing average ' +
    'daily interest. Periodic chunks go to your highest-rate debt. ' +
    'Requires active management of all cash flow through the flexi.',
  effortLevel: 'high',
  requiresFlexi: true,

  /**
   * Calculate velocity banking projection
   *
   * Returns null if no flexi facility exists (AC-4.5.6)
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection | null {
    // AC-4.5.6: Return null if no flexi facility
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

    // Generate projection with velocity banking allocator
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
   * Allocate surplus using velocity banking pattern
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
