import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { ok, err, type Result } from '@/lib/utils/result';
import {
  STRATEGY_CONFIG_KEY,
  DEFAULT_STRATEGY_CONFIG,
  type StrategyConfigData,
} from '@/types/strategy-config';

/**
 * Return type for useStrategyConfig hook
 */
export interface UseStrategyConfigReturn {
  /** Current strategy configuration (defaults if not set) */
  config: StrategyConfigData;
  /** Whether the config is still loading from DB */
  isLoading: boolean;
  /** Update the strategy configuration */
  updateConfig: (config: Partial<StrategyConfigData>) => Promise<Result<void>>;
  /** Reset configuration to defaults */
  resetConfig: () => Promise<Result<void>>;
}

/**
 * Parse JSON from settings value, returning default if invalid
 */
function parseConfigFromJson(jsonValue: string | undefined): StrategyConfigData {
  if (!jsonValue) {
    return DEFAULT_STRATEGY_CONFIG;
  }

  try {
    const parsed = JSON.parse(jsonValue) as Partial<StrategyConfigData>;

    // Validate and merge with defaults
    return {
      chunkAmount:
        parsed.chunkAmount !== undefined ? parsed.chunkAmount : DEFAULT_STRATEGY_CONFIG.chunkAmount,
      paymentFrequency:
        parsed.paymentFrequency &&
        ['monthly', 'bi-weekly', 'weekly'].includes(parsed.paymentFrequency)
          ? parsed.paymentFrequency
          : DEFAULT_STRATEGY_CONFIG.paymentFrequency,
      targetAccountId:
        parsed.targetAccountId !== undefined
          ? parsed.targetAccountId
          : DEFAULT_STRATEGY_CONFIG.targetAccountId,
    };
  } catch {
    return DEFAULT_STRATEGY_CONFIG;
  }
}

/**
 * Hook for managing strategy configuration
 *
 * Provides reactive access to strategy configuration stored in Dexie settings table.
 * Configuration is persisted as JSON and auto-updates via useLiveQuery.
 *
 * @example
 * ```tsx
 * const { config, updateConfig, isLoading } = useStrategyConfig();
 *
 * const handleFrequencyChange = async (frequency: PaymentFrequency) => {
 *   const result = await updateConfig({ paymentFrequency: frequency });
 *   if (result.success) {
 *     toast.success('Configuration saved');
 *   }
 * };
 * ```
 */
export function useStrategyConfig(): UseStrategyConfigReturn {
  const settingsRecord = useLiveQuery(() => db.settings.get(STRATEGY_CONFIG_KEY));
  const isLoading = settingsRecord === undefined;

  // Parse config from DB value or use defaults
  const config = parseConfigFromJson(settingsRecord?.value);

  /**
   * Update strategy configuration (partial update supported)
   */
  const updateConfig = async (
    updates: Partial<StrategyConfigData>
  ): Promise<Result<void>> => {
    try {
      // Merge updates with current config
      const newConfig: StrategyConfigData = {
        ...config,
        ...updates,
      };

      // Persist to DB
      await db.settings.put({
        key: STRATEGY_CONFIG_KEY,
        value: JSON.stringify(newConfig),
      });

      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to update strategy config'));
    }
  };

  /**
   * Reset configuration to defaults
   */
  const resetConfig = async (): Promise<Result<void>> => {
    try {
      await db.settings.put({
        key: STRATEGY_CONFIG_KEY,
        value: JSON.stringify(DEFAULT_STRATEGY_CONFIG),
      });
      return ok(undefined);
    } catch (error) {
      return err(error instanceof Error ? error : new Error('Failed to reset strategy config'));
    }
  };

  return {
    config,
    isLoading,
    updateConfig,
    resetConfig,
  };
}
