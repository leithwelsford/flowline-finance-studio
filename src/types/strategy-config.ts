/**
 * Strategy configuration data types for persistence
 *
 * Defines the shape of strategy configuration stored in Dexie settings table.
 * Uses string for monetary values (big.js precision - ADR-003).
 */

import type { PaymentFrequency } from '@/lib/calculations/types';

/**
 * Key for strategy configuration in settings table
 */
export const STRATEGY_CONFIG_KEY = 'strategyConfig';

/**
 * Strategy configuration data stored in Dexie settings table
 *
 * Stored as JSON string with key 'strategyConfig' in AppSettings.
 */
export interface StrategyConfigData {
  /** Custom chunk amount for flexi strategies (null = use full surplus) */
  chunkAmount: string | null;
  /** Payment frequency for strategies */
  paymentFrequency: PaymentFrequency;
  /** Target account ID override for manual prioritization (null = use strategy default) */
  targetAccountId: number | null;
}

/**
 * Default strategy configuration
 *
 * - chunkAmount: null (use full surplus)
 * - paymentFrequency: 'monthly'
 * - targetAccountId: null (use strategy default)
 */
export const DEFAULT_STRATEGY_CONFIG: StrategyConfigData = {
  chunkAmount: null,
  paymentFrequency: 'monthly',
  targetAccountId: null,
};
