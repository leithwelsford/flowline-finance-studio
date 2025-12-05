/**
 * Baseline Strategy - Minimum Payments Only
 *
 * The baseline strategy applies only minimum payments to all debt accounts
 * with no extra payments. This represents the "do nothing extra" scenario
 * and serves as the comparison point for all other strategies.
 *
 * FR13: Baseline shows minimum payments only trajectory
 */
import Big from 'big.js';
import { generateProjection, createBaselineAllocator } from '../projections';
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
 * Baseline Strategy Implementation
 *
 * Applies only minimum payments - no surplus allocation.
 * Effort level: low (no extra effort required)
 * Flexi required: no
 */
export const baselineStrategy: DebtStrategy = {
  id: 'baseline',
  name: 'Baseline (Minimum Payments)',
  description:
    'Pay only minimum payments on all accounts. No extra payments applied. ' +
    'This shows the longest payoff time and highest total interest - the "do nothing extra" scenario.',
  effortLevel: 'low',
  requiresFlexi: false,

  /**
   * Calculate baseline projection (minimum payments only)
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    _baseline?: StrategyProjection
  ): StrategyProjection {
    // Use the baseline allocator (returns empty allocations)
    const allocator = createBaselineAllocator();

    // Generate projection with minimum payments only
    const projections = generateProjection(snapshot, allocator, {
      maxMonths: config?.maxMonths,
      startDate: config?.startDate ?? snapshot.snapshotDate,
    });

    // Build the strategy projection (baseline has no savings vs itself)
    return buildStrategyProjection(
      this,
      projections,
      config?.startDate ?? snapshot.snapshotDate
      // No baseline parameter - this IS the baseline
    );
  },

  /**
   * Allocate surplus - baseline returns no allocations
   *
   * The baseline strategy does not allocate any surplus payments.
   * All surplus is effectively ignored (not applied to debt).
   */
  allocatePayment(
    _surplus: Big,
    _accounts: SimulatedAccount[],
    _flexi: SimulatedFlexi | null
  ): PaymentAllocation[] {
    return [];
  },
};
