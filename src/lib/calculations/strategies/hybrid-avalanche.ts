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

    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with hybrid avalanche allocator
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
   * Allocate surplus using hybrid flexi-avalanche pattern
   *
   * Logic:
   * - Uses flexi facility as batching mechanism (handled by projection engine)
   * - Targets highest interest rate first (avalanche targeting)
   * - When target is paid off, rolls to next highest rate
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

    // Sort by interest rate descending (highest first) - avalanche targeting
    const sorted = [...activeAccounts].sort((a, b) => b.interestRate.cmp(a.interestRate));
    const target = sorted[0];

    // Allocate surplus to the highest rate debt
    // The flexi facility's daily interest benefit is handled by the projection engine
    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
