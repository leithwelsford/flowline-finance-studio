import { useCallback, useMemo } from 'react'
import { useAccounts } from './useAccounts'
import { useFlexiFacility } from './useFlexiFacility'
import { useIncome } from './useIncome'
import { useExpenses } from './useExpenses'
import { useStrategyConfig } from './useStrategyConfig'
import { useCalculationStore } from '@/store'
import { buildFinancialSnapshot } from '@/lib/calculations/snapshot'
import { calculateAllStrategies } from '@/lib/calculations/engine'
import type { StrategyConfig, StrategyProjection } from '@/lib/calculations/types'

/**
 * Return type for useStrategies hook
 */
export interface UseStrategiesReturn {
  /** Array of calculated strategy projections (sorted by interest saved) */
  strategies: StrategyProjection[]
  /** The baseline projection for comparison */
  baseline: StrategyProjection | null
  /** Whether calculation is in progress */
  isCalculating: boolean
  /** Trigger a recalculation of all strategies */
  calculateStrategies: () => Promise<void>
  /** The strategy with highest interest savings (excluding baseline) */
  bestStrategy: StrategyProjection | null
  /** Message when no results (e.g., no accounts) */
  emptyMessage: string | null
  /** ISO timestamp of last successful calculation */
  lastCalculated: string | null
  /** Error message if calculation failed */
  error: string | null
  /** Whether data is still loading from database */
  isDataLoading: boolean
}

/**
 * Hook for strategy calculation and comparison
 *
 * Composes useAccounts, useFlexiFacility, useIncome, useExpenses, and
 * useStrategyConfig to build a FinancialSnapshot, then runs all 8 strategies
 * through the calculation engine.
 *
 * Results are stored in calculationStore (Zustand) and sorted by interest saved.
 *
 * @example
 * ```tsx
 * const { strategies, calculateStrategies, bestStrategy, isCalculating } = useStrategies();
 *
 * useEffect(() => {
 *   calculateStrategies();
 * }, []);
 *
 * if (isCalculating) return <CalculationLoading />;
 *
 * return (
 *   <div>
 *     <p>Best strategy: {bestStrategy?.strategyName}</p>
 *     <p>Saves: {bestStrategy?.interestSaved.toFixed(2)}</p>
 *   </div>
 * );
 * ```
 */
export function useStrategies(): UseStrategiesReturn {
  // Data hooks
  const { accounts, isLoading: isAccountsLoading } = useAccounts()
  const { facility, isLoading: isFlexiLoading } = useFlexiFacility()
  const { incomeEntries, isLoading: isIncomeLoading } = useIncome()
  const { expenses, isLoading: isExpensesLoading } = useExpenses()
  const { config, isLoading: isConfigLoading } = useStrategyConfig()

  // Store
  const {
    results,
    baseline,
    isCalculating,
    lastCalculated,
    error,
    setResults,
    setBaseline,
    setCalculating,
    setLastCalculated,
    setError,
  } = useCalculationStore()

  // Derived loading state
  const isDataLoading =
    isAccountsLoading || isFlexiLoading || isIncomeLoading || isExpensesLoading || isConfigLoading

  /**
   * Trigger calculation of all strategies
   */
  const calculateStrategies = useCallback(async () => {
    // Don't calculate while data is loading
    if (isDataLoading) {
      return
    }

    setCalculating(true)
    setError(null)

    try {
      // Build snapshot from current database state
      const snapshot = buildFinancialSnapshot(accounts, facility, incomeEntries, expenses)

      // Convert user config to strategy config format
      const strategyConfig: StrategyConfig = {
        chunkAmount: config.chunkAmount,
        paymentFrequency: config.paymentFrequency,
        targetAccountId: config.targetAccountId,
      }

      // Calculate all strategies
      const calculationResult = calculateAllStrategies(snapshot, strategyConfig)

      // Update store
      setResults(calculationResult.results)
      setBaseline(calculationResult.baseline)
      setLastCalculated(new Date().toISOString())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Strategy calculation failed')
      setResults([])
      setBaseline(null)
    } finally {
      setCalculating(false)
    }
  }, [
    isDataLoading,
    accounts,
    facility,
    incomeEntries,
    expenses,
    config,
    setCalculating,
    setError,
    setResults,
    setBaseline,
    setLastCalculated,
  ])

  /**
   * Compute the best strategy (highest interest saved, excluding baseline)
   */
  const bestStrategy = useMemo(() => {
    if (results.length === 0) return null

    // Find strategy with highest interest saved (excluding baseline which has 0)
    const nonBaseline = results.filter((s) => s.strategyId !== 'baseline')
    if (nonBaseline.length === 0) return null

    // Results are already sorted by interest saved (highest first)
    return nonBaseline[0]
  }, [results])

  /**
   * Empty message when no results
   */
  const emptyMessage = useMemo(() => {
    if (results.length > 0) return null
    if (isCalculating) return null
    if (isDataLoading) return null
    if (error) return null
    if (!lastCalculated) return null

    // Check for empty accounts
    if (accounts.length === 0) {
      return 'No debt accounts found. Add accounts to calculate strategies.'
    }

    return null
  }, [results, isCalculating, isDataLoading, error, lastCalculated, accounts])

  return {
    strategies: results,
    baseline,
    isCalculating,
    calculateStrategies,
    bestStrategy,
    emptyMessage,
    lastCalculated,
    error,
    isDataLoading,
  }
}
