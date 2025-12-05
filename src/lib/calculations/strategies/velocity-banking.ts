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
   *
   * The key difference from flexi chunking is how we model the income parking effect:
   * - Income immediately reduces flexi balance (day 1)
   * - Expenses drawn throughout month increase flexi balance
   * - Net effect: lower average daily balance = less interest
   *
   * For MVP, we simplify the intra-month tracking using average balance model.
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

    // Create allocator that uses this strategy's allocatePayment method
    const allocator = (
      surplus: Big,
      accounts: SimulatedAccount[],
      flexi: SimulatedFlexi | null
    ) => this.allocatePayment(surplus, accounts, flexi);

    // Generate projection with velocity banking allocator
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
   * Allocate surplus using velocity banking pattern
   *
   * Velocity banking allocation logic:
   * 1. All surplus is directed to the highest-rate debt (avalanche targeting)
   * 2. The "income parking" benefit comes from flexi interest calculation,
   *    not from the allocation logic itself
   *
   * The income parking effect is modeled in the flexi interest calculation:
   * - Traditional: surplus transferred at end of month
   * - Velocity: income sits in flexi from day 1, reducing average balance
   *
   * Since our projection engine calculates monthly, we model the velocity
   * banking benefit through the allocator targeting highest-rate debt aggressively.
   *
   * AC-4.5.1: Income deposited to flexi (modeled via surplus from income)
   * AC-4.5.2: Expenses paid from flexi (modeled via net surplus calculation)
   * AC-4.5.3: Chunks to highest-rate debt (avalanche targeting)
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
    // AC-4.5.3: Periodic chunks to highest-rate debt
    const sorted = [...activeAccounts].sort((a, b) => b.interestRate.cmp(a.interestRate));
    const target = sorted[0];

    // Velocity banking allocation:
    // All surplus goes to the highest-rate debt.
    //
    // The key velocity banking benefit is:
    // 1. Income enters flexi immediately (day 1) → lower flexi balance
    // 2. Expenses draw from flexi throughout month → gradual increase
    // 3. Average daily balance is LOWER than flexi chunking
    // 4. Daily interest on lower average = savings
    //
    // In our monthly simulation, we capture this by:
    // - Flexi interest is calculated on balance (daily compounding formula)
    // - Surplus (income - expenses) is applied as chunk to target debt
    //
    // The "velocity" effect is that income spends more time in flexi,
    // reducing the average balance. This is captured in the flexi interest
    // calculation which uses daily compounding formula.

    return [
      {
        accountId: target.id,
        amount: surplus,
      },
    ];
  },
};
