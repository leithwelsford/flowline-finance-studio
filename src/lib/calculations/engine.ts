/**
 * Strategy Calculation Engine (FR23)
 *
 * Orchestrates all 8 debt reduction strategy calculations from a single
 * FinancialSnapshot. Calculates baseline first, then uses it to compute
 * comparison metrics (monthsSaved, interestSaved) for all other strategies.
 *
 * All calculations use big.js for precision (ADR-003).
 */
import Big from 'big.js'
import type { FinancialSnapshot, StrategyConfig, StrategyProjection } from './types'
import { getAllStrategies, baselineStrategy } from './strategies'

/**
 * Result of calculateAllStrategies when no valid data exists
 */
export interface EmptyCalculationResult {
  results: []
  baseline: null
  message: string
}

/**
 * Result of calculateAllStrategies when valid data exists
 */
export interface SuccessfulCalculationResult {
  results: StrategyProjection[]
  baseline: StrategyProjection
  message: null
}

export type CalculationResult = EmptyCalculationResult | SuccessfulCalculationResult

/**
 * Calculate all 8 debt reduction strategies from a financial snapshot
 *
 * Process:
 * 1. Validate snapshot has accounts with non-zero balance
 * 2. Calculate baseline first (needed for comparison metrics)
 * 3. Calculate all other strategies, passing baseline for comparison
 * 4. Filter out null results (flexi strategies without flexi facility)
 * 5. Sort by interest saved (highest first)
 *
 * @param snapshot - Current financial state
 * @param config - Optional strategy configuration
 * @returns Calculation result with sorted strategy projections
 */
export function calculateAllStrategies(
  snapshot: FinancialSnapshot,
  config?: StrategyConfig
): CalculationResult {
  // Edge case: no accounts
  if (snapshot.accounts.length === 0) {
    return {
      results: [],
      baseline: null,
      message: 'No debt accounts found. Add accounts to calculate strategies.',
    }
  }

  // Edge case: all accounts have zero balance
  const totalBalance = snapshot.accounts.reduce(
    (sum, acct) => sum.plus(acct.balance),
    Big(0)
  )
  if (totalBalance.eq(0)) {
    return {
      results: [],
      baseline: null,
      message: 'All accounts have zero balance. No strategies to calculate.',
    }
  }

  // Step 1: Calculate baseline first (required for comparison metrics)
  const baseline = baselineStrategy.calculate(snapshot, config)
  if (!baseline) {
    return {
      results: [],
      baseline: null,
      message: 'Could not calculate baseline projection.',
    }
  }

  // Step 2: Calculate all other strategies
  const allStrategies = getAllStrategies()
  const results: StrategyProjection[] = [baseline]

  for (const strategy of allStrategies) {
    if (strategy.id === 'baseline') continue // Already calculated

    const result = strategy.calculate(snapshot, config, baseline)
    if (result !== null) {
      results.push(result)
    }
  }

  // Step 3: Sort by interest saved (highest first)
  // Baseline has 0 savings so will be last
  results.sort((a, b) => {
    const aSaved = a.interestSaved.toNumber()
    const bSaved = b.interestSaved.toNumber()
    return bSaved - aSaved
  })

  return {
    results,
    baseline,
    message: null,
  }
}

/**
 * Calculate a single strategy by ID
 *
 * @param strategyId - Strategy identifier
 * @param snapshot - Current financial state
 * @param config - Optional strategy configuration
 * @param baseline - Optional baseline for comparison metrics
 * @returns Strategy projection or null if strategy not found or not applicable
 */
export function calculateStrategy(
  strategyId: string,
  snapshot: FinancialSnapshot,
  config?: StrategyConfig,
  baseline?: StrategyProjection
): StrategyProjection | null {
  const allStrategies = getAllStrategies()
  const strategy = allStrategies.find((s) => s.id === strategyId)

  if (!strategy) {
    return null
  }

  return strategy.calculate(snapshot, config, baseline)
}
