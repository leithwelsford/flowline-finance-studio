/**
 * Avalanche Strategy - Highest Interest Rate First
 *
 * The debt avalanche strategy allocates all surplus payments to the account
 * with the highest interest rate. When that account is paid off, the payment
 * "rolls" to the next highest rate, creating an avalanche effect.
 *
 * This strategy is mathematically optimal for minimizing total interest paid.
 *
 * FR15: Debt Avalanche prioritizes highest interest rate first
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
 * Avalanche Strategy Implementation
 *
 * Allocates all surplus to highest interest rate first.
 * When target is paid off, rolls payment to next highest rate.
 * Effort level: low (simple rule, easy to follow)
 * Flexi required: no
 */
export const avalancheStrategy: DebtStrategy = {
  id: 'avalanche',
  name: 'Debt Avalanche (Highest Rate First)',
  description:
    'Apply all extra payments to the highest interest rate first. When paid off, ' +
    'roll that payment to the next highest rate. Minimizes total interest paid.',
  effortLevel: 'low',
  requiresFlexi: false,

  /**
   * Calculate avalanche projection
   */
  calculate(
    snapshot: FinancialSnapshot,
    config?: StrategyConfig,
    baseline?: StrategyProjection
  ): StrategyProjection {
    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with avalanche allocator
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
   * Allocate surplus to highest interest rate first
   *
   * Sorts accounts by interest rate (descending) and allocates all surplus
   * to the account with the highest rate that has a non-zero balance.
   */
  allocatePayment(
    surplus: Big,
    accounts: SimulatedAccount[],
    _flexi: SimulatedFlexi | null
  ): PaymentAllocation[] {
    // No surplus to allocate
    if (surplus.lte(0)) {
      return [];
    }

    // Filter to accounts with positive balance
    const activeAccounts = accounts.filter((acc) => acc.balance.gt(0));

    if (activeAccounts.length === 0) {
      return [];
    }

    // Sort by interest rate descending (highest first)
    const sorted = [...activeAccounts].sort((a, b) => b.interestRate.cmp(a.interestRate));

    // Allocate all surplus to the highest rate account
    const target = sorted[0];

    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
