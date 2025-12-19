import { useState, useMemo, useCallback } from 'react'
import Big from 'big.js'
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types'

/**
 * Filter state for strategy comparison
 * @see AC-5.6.1, AC-5.6.2, AC-5.6.10
 */
export interface FilterState {
  /** Selected effort levels (empty array = show all) */
  effortLevels: EffortLevel[]
  /** Minimum savings threshold in ZAR (null = no threshold) */
  minSavings: number | null
}

/**
 * Default filter state - shows all strategies
 * @see AC-5.6.8
 */
export const DEFAULT_FILTER_STATE: FilterState = {
  effortLevels: ['low', 'medium', 'high'],
  minSavings: null,
}

/**
 * Return type for useStrategyFilters hook
 */
export interface UseStrategyFiltersReturn {
  /** Filtered strategies based on current filter state */
  filteredStrategies: StrategyProjection[]
  /** Current filter state */
  filters: FilterState
  /** Update filter state */
  setFilters: (filters: FilterState) => void
  /** Reset filters to default state */
  resetFilters: () => void
  /** Toggle a specific effort level */
  toggleEffortLevel: (level: EffortLevel) => void
  /** Set minimum savings threshold */
  setMinSavings: (value: number | null) => void
  /** Whether any filters are active (non-default) */
  hasActiveFilters: boolean
}

/**
 * Hook for filtering strategy projections
 *
 * Provides filter state management and memoized filtering for strategy
 * comparison. Filter state resets on page reload (AC-5.6.10).
 *
 * @param strategies - Array of strategy projections to filter
 * @returns Filtered strategies and filter controls
 *
 * @example
 * ```tsx
 * const { filteredStrategies, filters, toggleEffortLevel, setMinSavings } = useStrategyFilters(strategies);
 *
 * return (
 *   <>
 *     <StrategyFilters filters={filters} onToggleEffort={toggleEffortLevel} />
 *     <ComparisonTable strategies={filteredStrategies} />
 *   </>
 * );
 * ```
 *
 * @see AC-5.6.1, AC-5.6.2, AC-5.6.3, AC-5.6.8, AC-5.6.9, AC-5.6.10
 */
export function useStrategyFilters(
  strategies: StrategyProjection[]
): UseStrategyFiltersReturn {
  // Filter state - resets on page reload (AC-5.6.10)
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE)

  /**
   * Filter strategies based on current filter state
   * @see AC-5.6.1, AC-5.6.2, AC-5.6.8, AC-5.6.9
   */
  const filteredStrategies = useMemo(() => {
    return strategies.filter((strategy) => {
      // Effort level filter (AC-5.6.1)
      // If no effort levels selected OR all selected, show all (treat empty as "show all")
      const effortMatch =
        filters.effortLevels.length === 0 ||
        filters.effortLevels.length === 3 ||
        filters.effortLevels.includes(strategy.effortLevel)

      if (!effortMatch) {
        return false
      }

      // Minimum savings filter (AC-5.6.2)
      // Compare using big.js for precision
      if (filters.minSavings !== null && filters.minSavings > 0) {
        const savings = strategy.interestSaved
        const threshold = new Big(filters.minSavings)
        if (savings.lt(threshold)) {
          return false
        }
      }

      return true
    })
  }, [strategies, filters])

  /**
   * Reset filters to default state
   */
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTER_STATE)
  }, [])

  /**
   * Toggle a specific effort level on/off
   * @see AC-5.6.1
   */
  const toggleEffortLevel = useCallback((level: EffortLevel) => {
    setFilters((prev) => {
      const currentLevels = prev.effortLevels
      const isSelected = currentLevels.includes(level)

      let newLevels: EffortLevel[]
      if (isSelected) {
        // Remove the level
        newLevels = currentLevels.filter((l) => l !== level)
      } else {
        // Add the level
        newLevels = [...currentLevels, level]
      }

      return { ...prev, effortLevels: newLevels }
    })
  }, [])

  /**
   * Set minimum savings threshold
   * @see AC-5.6.2
   */
  const setMinSavings = useCallback((value: number | null) => {
    setFilters((prev) => ({
      ...prev,
      minSavings: value !== null && value >= 0 ? value : null,
    }))
  }, [])

  /**
   * Check if any filters are active (non-default)
   */
  const hasActiveFilters = useMemo(() => {
    // Check if effort levels differ from default (all 3 selected)
    const effortDiffers =
      filters.effortLevels.length !== 3 ||
      !filters.effortLevels.includes('low') ||
      !filters.effortLevels.includes('medium') ||
      !filters.effortLevels.includes('high')

    // Check if min savings is set
    const savingsDiffers = filters.minSavings !== null && filters.minSavings > 0

    return effortDiffers || savingsDiffers
  }, [filters])

  return {
    filteredStrategies,
    filters,
    setFilters,
    resetFilters,
    toggleEffortLevel,
    setMinSavings,
    hasActiveFilters,
  }
}
