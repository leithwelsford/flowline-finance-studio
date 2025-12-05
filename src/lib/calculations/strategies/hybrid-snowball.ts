/**
 * Hybrid Flexi-Snowball Strategy
 *
 * Combines flexi chunking methodology with snowball debt targeting.
 * Uses the flexi facility as a batching account while targeting the
 * smallest balance first for psychological wins.
 *
 * The hybrid approach:
 * 1. Park surplus in flexi facility (benefit from daily interest)
 * 2. Target smallest balance debt first (snowball targeting)
 * 3. Roll payment to next smallest when debt paid off
 *
 * Best for: Users who have a flexi facility and need the motivation
 * of seeing debts disappear quickly (psychological wins).
 *
 * FR19: Hybrid Flexi-Snowball Strategy
 * ADR-004: Strategy Pattern
 * ADR-003: big.js for financial calculations
 */
import Big from 'big.js';
import { generateProjection } from '../projections';
import { buildStrategyProjection } from './strategy-helpers';
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
 * Hybrid Flexi-Snowball Strategy Implementation
 *
 * Combines flexi facility benefits with snowball targeting (smallest first).
 * Effort level: medium (requires flexi management, but simpler than velocity banking)
 * Flexi required: yes
 */
export const hybridSnowballStrategy: DebtStrategy = {
  id: 'hybrid-flexi-snowball',
  name: 'Hybrid Flexi-Snowball',
  description:
    'Combine flexi facility benefits with snowball targeting. Park surplus in flexi, ' +
    'then target smallest balance first for quick psychological wins while benefiting ' +
    'from flexi interest arbitrage.',
  effortLevel: 'medium',
  requiresFlexi: true,

  /**
   * Calculate hybrid flexi-snowball projection
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

    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with hybrid snowball allocator
    const projections = generateProjection(snapshot, allocator, {
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
   * Allocate surplus using hybrid flexi-snowball pattern
   *
   * Logic:
   * - Uses flexi facility as batching mechanism (handled by projection engine)
   * - Targets smallest balance first (snowball targeting)
   * - When target is paid off, rolls to next smallest balance
   *
   * The flexi facility benefits come from:
   * - Surplus parks in flexi, reducing balance (daily interest benefit)
   * - Chunks to target debt provide lump sum paydowns
   */
  allocatePayment(
    surplus: Big,
    accounts: SimulatedAccount[],
    flexi: SimulatedFlexi | null
  ): PaymentAllocation[] {
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

    // Sort by balance ascending (smallest first) - snowball targeting
    const sorted = [...activeAccounts].sort((a, b) => a.balance.cmp(b.balance));
    const target = sorted[0];

    // Allocate surplus to the smallest balance debt
    // The flexi facility's daily interest benefit is handled by the projection engine
    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
