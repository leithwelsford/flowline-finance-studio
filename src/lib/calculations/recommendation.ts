/**
 * Recommendation Engine - Strategy scoring and recommendation algorithm
 *
 * Scores strategies based on:
 * - Interest savings (primary weight)
 * - Effort level (secondary weight via penalty)
 * - Risk profile (tertiary weight via penalty)
 *
 * Formula: score = interestSaved - effortPenalty - riskPenalty
 *
 * @see AC-5.5.1 through AC-5.5.6 for algorithm requirements
 */

import type { StrategyProjection, EffortLevel } from './types';

/**
 * Result of the recommendation calculation
 */
export interface RecommendationResult {
  /** ID of the recommended strategy */
  recommendedStrategyId: string;
  /** Full projection data for the recommended strategy */
  recommendedStrategy: StrategyProjection;
  /** Calculated score for the recommended strategy */
  score: number;
  /** Human-readable rationale for the recommendation */
  rationale: string;
}

/**
 * Strategy IDs that require a flexi facility
 * Used for both risk penalty application and filtering when no flexi available
 *
 * @see AC-5.5.4, AC-5.5.6
 */
export const FLEXI_REQUIRED_STRATEGY_IDS = [
  'flexi-chunking',
  'aggressive-flexi',
  'velocity-banking',
  'hybrid-snowball',
  'hybrid-avalanche',
] as const;

/**
 * Effort penalties applied to strategy scores
 * Higher effort strategies receive larger penalties
 *
 * @see AC-5.5.3
 */
export const EFFORT_PENALTIES: Record<EffortLevel, number> = {
  low: 0,
  medium: -2000,
  high: -5000,
};

/**
 * Risk penalty applied to strategies requiring a flexi facility
 *
 * @see AC-5.5.4
 */
export const FLEXI_RISK_PENALTY = -1000;

/**
 * Check if a strategy requires a flexi facility
 */
export function isFlexiStrategy(strategyId: string): boolean {
  return (FLEXI_REQUIRED_STRATEGY_IDS as readonly string[]).includes(strategyId);
}

/**
 * Calculate the score for a single strategy
 *
 * @param strategy - The strategy projection to score
 * @returns The calculated score
 *
 * @see AC-5.5.2: score = interestSaved - effortPenalty - riskPenalty
 */
export function calculateStrategyScore(strategy: StrategyProjection): number {
  const interestSaved = strategy.interestSaved.toNumber();
  const effortPenalty = EFFORT_PENALTIES[strategy.effortLevel];
  const riskPenalty = isFlexiStrategy(strategy.strategyId) ? FLEXI_RISK_PENALTY : 0;

  return interestSaved + effortPenalty + riskPenalty;
}

/**
 * Generate a human-readable rationale for the recommendation
 *
 * @param strategy - The recommended strategy
 * @returns Rationale string explaining why this strategy was chosen
 */
export function generateRationale(strategy: StrategyProjection): string {
  const saved = strategy.interestSaved.toNumber();
  const formattedSaved = saved
    .toFixed(0)
    .replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const effort = strategy.effortLevel;

  return `Saves R${formattedSaved} vs baseline with ${effort} effort`;
}

/**
 * Calculate the recommended strategy from a list of projections
 *
 * Algorithm:
 * 1. Filter out flexi strategies if user has no flexi facility (AC-5.5.6)
 * 2. Score each strategy using the scoring formula (AC-5.5.2)
 * 3. Apply effort penalties (AC-5.5.3)
 * 4. Apply risk penalties for flexi strategies (AC-5.5.4)
 * 5. Return the highest-scoring strategy (AC-5.5.1)
 *
 * @param strategies - Array of calculated strategy projections
 * @param baseline - The baseline projection for comparison
 * @param hasFlexiFacility - Whether the user has a flexi facility configured
 * @returns The recommendation result, or null if no strategies are applicable
 *
 * @see AC-5.5.1 through AC-5.5.6
 */
export function calculateRecommendation(
  strategies: StrategyProjection[],
  _baseline: StrategyProjection | null,
  hasFlexiFacility: boolean
): RecommendationResult | null {
  // Handle empty input
  if (strategies.length === 0) {
    return null;
  }

  // Filter out flexi strategies if no flexi facility (AC-5.5.6)
  const applicableStrategies = hasFlexiFacility
    ? strategies
    : strategies.filter((s) => !isFlexiStrategy(s.strategyId));

  // If no strategies remain after filtering, return null
  if (applicableStrategies.length === 0) {
    return null;
  }

  // Score each strategy
  const scored = applicableStrategies.map((strategy) => ({
    strategy,
    score: calculateStrategyScore(strategy),
  }));

  // Find the highest-scoring strategy (prefer first on ties for determinism)
  const best = scored.reduce((a, b) => (a.score >= b.score ? a : b));

  // Generate rationale
  const rationale = generateRationale(best.strategy);

  return {
    recommendedStrategyId: best.strategy.strategyId,
    recommendedStrategy: best.strategy,
    score: best.score,
    rationale,
  };
}
