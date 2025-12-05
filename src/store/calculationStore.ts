import { create } from 'zustand'
import type { StrategyProjection } from '@/lib/calculations/types'

interface CalculationState {
  /** Array of calculated strategy projections */
  results: StrategyProjection[]
  /** The baseline projection for comparison */
  baseline: StrategyProjection | null
  /** Whether calculation is in progress */
  isCalculating: boolean
  /** ISO timestamp of last successful calculation */
  lastCalculated: string | null
  /** Error message if calculation failed */
  error: string | null

  // Actions
  setResults: (results: StrategyProjection[]) => void
  setBaseline: (baseline: StrategyProjection | null) => void
  setCalculating: (isCalculating: boolean) => void
  setLastCalculated: (timestamp: string | null) => void
  setError: (error: string | null) => void
  clearResults: () => void
}

export const useCalculationStore = create<CalculationState>((set) => ({
  results: [],
  baseline: null,
  isCalculating: false,
  lastCalculated: null,
  error: null,

  setResults: (results) => set({ results }),
  setBaseline: (baseline) => set({ baseline }),
  setCalculating: (isCalculating) => set({ isCalculating }),
  setLastCalculated: (timestamp) => set({ lastCalculated: timestamp }),
  setError: (error) => set({ error }),
  clearResults: () =>
    set({
      results: [],
      baseline: null,
      lastCalculated: null,
      error: null,
    }),
}))
