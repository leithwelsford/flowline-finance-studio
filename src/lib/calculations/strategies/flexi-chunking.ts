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

    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with flexi chunking allocator
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
   * Allocate surplus using flexi chunking pattern
   *
   * Logic:
   * - If flexi has positive balance (owes money), pay down flexi first from surplus
   * - Once flexi is at zero or negative (credit available), chunk to highest-rate debt
   * - The "chunk" is the full surplus amount each month
   *
   * This models the behavior where:
   * 1. Surplus reduces flexi balance (building credit)
   * 2. When credit is available, transfer lump sum to target debt
   * 3. Flexi balance increases, repeat cycle
   *
   * For simplicity in this model, we always apply surplus to either:
   * - Flexi repayment if flexi balance > 0
   * - Highest-rate debt if flexi balance <= 0 (credit available)
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

    // Flexi chunking behavior:
    // - The projection engine handles flexi balance tracking and interest
    // - We allocate surplus to the highest-rate debt account
    // - The interest arbitrage happens because flexi charges daily rate (lower)
    //   while the debt we're paying off charges higher monthly rate
    //
    // In the real world, the user would:
    // 1. Deposit surplus into flexi (reduces balance → less interest)
    // 2. Periodically transfer chunks from flexi to target debt
    //
    // In our simulation, we simplify: apply surplus directly to target debt
    // The flexi facility's lower interest rate on its balance provides the benefit
    // compared to holding cash elsewhere.

    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
