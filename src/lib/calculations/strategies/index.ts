/**
 * Strategy Registry - Barrel exports for all debt reduction strategies
 *
 * Provides access to all strategy implementations and utility functions
 * for working with the strategy collection.
 */
import type { DebtStrategy } from '../types';
import { baselineStrategy } from './baseline';
import { snowballStrategy } from './snowball';
import { avalancheStrategy } from './avalanche';
import { flexiChunkingStrategy } from './flexi-chunking';
import { aggressiveFlexiStrategy } from './aggressive-flexi';
import { velocityBankingStrategy } from './velocity-banking';
import { hybridSnowballStrategy } from './hybrid-snowball';
import { hybridAvalancheStrategy } from './hybrid-avalanche';

// Re-export individual strategies
export { baselineStrategy } from './baseline';
export { snowballStrategy } from './snowball';
export { avalancheStrategy } from './avalanche';
export { flexiChunkingStrategy } from './flexi-chunking';
export { aggressiveFlexiStrategy } from './aggressive-flexi';
export { velocityBankingStrategy } from './velocity-banking';
export { hybridSnowballStrategy } from './hybrid-snowball';
export { hybridAvalancheStrategy } from './hybrid-avalanche';

// Re-export helper functions
export {
  buildStrategyProjection,
  calculateInitialDebt,
  applyTargetOverride,
  calculateEffectiveMonthlySurplus,
  applyChunkAmountLimit,
  getEffectiveSurplus,
} from './strategy-helpers';

/**
 * Get all available strategies
 *
 * @returns Array of all DebtStrategy implementations
 */
export function getAllStrategies(): DebtStrategy[] {
  return [
    baselineStrategy,
    snowballStrategy,
    avalancheStrategy,
    flexiChunkingStrategy,
    aggressiveFlexiStrategy,
    velocityBankingStrategy,
    hybridSnowballStrategy,
    hybridAvalancheStrategy,
  ];
}

/**
 * Get a strategy by its unique identifier
 *
 * @param id - Strategy identifier (e.g., 'baseline', 'snowball', 'avalanche')
 * @returns The matching strategy or undefined if not found
 */
export function getStrategyById(id: string): DebtStrategy | undefined {
  return getAllStrategies().find((s) => s.id === id);
}

/**
 * Get strategies filtered by effort level
 *
 * @param effortLevel - Effort level to filter by
 * @returns Array of strategies matching the effort level
 */
export function getStrategiesByEffortLevel(
  effortLevel: 'low' | 'medium' | 'high'
): DebtStrategy[] {
  return getAllStrategies().filter((s) => s.effortLevel === effortLevel);
}

/**
 * Get strategies that require a flexi facility
 *
 * @returns Array of strategies requiring flexi
 */
export function getFlexiStrategies(): DebtStrategy[] {
  return getAllStrategies().filter((s) => s.requiresFlexi);
}

/**
 * Get strategies that don't require a flexi facility
 *
 * @returns Array of strategies not requiring flexi
 */
export function getNonFlexiStrategies(): DebtStrategy[] {
  return getAllStrategies().filter((s) => !s.requiresFlexi);
}
