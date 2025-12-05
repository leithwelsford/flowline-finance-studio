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

    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with aggressive flexi allocator
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
   * Allocate surplus using aggressive flexi pattern
   *
   * Aggressive strategy logic:
   * - Apply full surplus to highest-rate debt each month
   * - In the real world, users run ALL money through flexi:
   *   - Income → flexi (reduces balance)
   *   - Expenses → from flexi (increases balance)
   *   - Net effect: lower average daily balance
   * - The simulation captures the end result: surplus goes to debt payoff
   *
   * The key difference from flexi chunking:
   * - Flexi chunking: occasional lump sums, medium management
   * - Aggressive: continuous flow-through, maximizes daily balance benefits
   *
   * In our simplified simulation, both allocate surplus to highest-rate debt.
   * The distinction is primarily in effort level and real-world behavior.
   * Both benefit from flexi daily interest vs debt monthly interest.
   *
   * For more sophisticated modeling, we could:
   * - Track partial-month flexi balances
   * - Model income timing within month
   * - Calculate weighted average daily balance
   *
   * Current approach: allocate full surplus to highest-rate debt
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

    // Aggressive flexi behavior:
    // Apply full surplus to highest-rate debt
    // The aggressive nature is reflected in:
    // 1. effortLevel: 'high' - requires active management
    // 2. Real-world: all money flows through flexi for daily balance benefits
    // 3. Simulation: captures the optimal debt payoff from available surplus

    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
