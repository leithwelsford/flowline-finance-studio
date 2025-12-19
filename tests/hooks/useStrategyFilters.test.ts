import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import Big from 'big.js'
import {
  useStrategyFilters,
  DEFAULT_FILTER_STATE,
  type FilterState,
} from '@/hooks/useStrategyFilters'
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types'

/**
 * Helper to create mock strategy projections
 */
function createMockStrategy(
  id: string,
  name: string,
  effortLevel: EffortLevel,
  interestSaved: number
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel,
    debtFreeMonth: 24,
    debtFreeDate: '2026-01-01',
    totalInterestPaid: new Big(50000),
    totalPrincipalPaid: new Big(100000),
    monthsSaved: 12,
    interestSaved: new Big(interestSaved),
    monthlyProjections: [],
  }
}

// Test data
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('baseline', 'Baseline', 'low', 0),
  createMockStrategy('avalanche', 'Avalanche', 'low', 15000),
  createMockStrategy('snowball', 'Snowball', 'low', 12000),
  createMockStrategy('flexi-chunking', 'Flexi Chunking', 'medium', 20000),
  createMockStrategy('velocity-banking', 'Velocity Banking', 'high', 25000),
  createMockStrategy('hybrid-avalanche', 'Hybrid Avalanche', 'high', 22000),
]

describe('useStrategyFilters', () => {
  describe('Initial State', () => {
    it('returns all strategies when no filters applied (AC-5.6.8)', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      expect(result.current.filteredStrategies).toHaveLength(6)
      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE)
      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('returns default filter state with all effort levels selected', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      expect(result.current.filters.effortLevels).toEqual(['low', 'medium', 'high'])
      expect(result.current.filters.minSavings).toBeNull()
    })
  })

  describe('Effort Level Filtering (AC-5.6.1)', () => {
    it('filters to show only low effort strategies', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['low'],
          minSavings: null,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(3)
      expect(result.current.filteredStrategies.every((s) => s.effortLevel === 'low')).toBe(true)
    })

    it('filters to show only medium effort strategies', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['medium'],
          minSavings: null,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(1)
      expect(result.current.filteredStrategies[0].strategyId).toBe('flexi-chunking')
    })

    it('filters to show only high effort strategies', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['high'],
          minSavings: null,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(2)
      expect(result.current.filteredStrategies.every((s) => s.effortLevel === 'high')).toBe(true)
    })

    it('filters with multiple effort levels selected', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['low', 'medium'],
          minSavings: null,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(4)
      expect(
        result.current.filteredStrategies.every(
          (s) => s.effortLevel === 'low' || s.effortLevel === 'medium'
        )
      ).toBe(true)
    })

    it('shows all strategies when no effort levels selected (treat as show all)', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: [],
          minSavings: null,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(6)
    })

    it('toggles effort level on', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      // Start with only low
      act(() => {
        result.current.setFilters({
          effortLevels: ['low'],
          minSavings: null,
        })
      })

      // Toggle medium on
      act(() => {
        result.current.toggleEffortLevel('medium')
      })

      expect(result.current.filters.effortLevels).toContain('low')
      expect(result.current.filters.effortLevels).toContain('medium')
      expect(result.current.filteredStrategies).toHaveLength(4)
    })

    it('toggles effort level off', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      // Toggle low off
      act(() => {
        result.current.toggleEffortLevel('low')
      })

      expect(result.current.filters.effortLevels).not.toContain('low')
      expect(result.current.filters.effortLevels).toContain('medium')
      expect(result.current.filters.effortLevels).toContain('high')
    })
  })

  describe('Minimum Savings Filtering (AC-5.6.2)', () => {
    it('filters strategies below minimum savings threshold', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(15000)
      })

      // Should include: avalanche (15000), flexi-chunking (20000), velocity-banking (25000), hybrid-avalanche (22000)
      expect(result.current.filteredStrategies).toHaveLength(4)
      expect(
        result.current.filteredStrategies.every((s) => s.interestSaved.gte(new Big(15000)))
      ).toBe(true)
    })

    it('filters with high threshold', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(22000)
      })

      // Should include: velocity-banking (25000), hybrid-avalanche (22000)
      expect(result.current.filteredStrategies).toHaveLength(2)
    })

    it('shows all when threshold is null', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(null)
      })

      expect(result.current.filteredStrategies).toHaveLength(6)
    })

    it('shows all when threshold is 0', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(0)
      })

      expect(result.current.filteredStrategies).toHaveLength(6)
    })

    it('rejects negative threshold', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(-5000)
      })

      // Should reset to null (no filter)
      expect(result.current.filters.minSavings).toBeNull()
      expect(result.current.filteredStrategies).toHaveLength(6)
    })
  })

  describe('Combined Filters (AC-5.6.1, AC-5.6.2)', () => {
    it('combines effort level and savings filters', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['high'],
          minSavings: 23000,
        })
      })

      // Only velocity-banking (high, 25000) should match
      expect(result.current.filteredStrategies).toHaveLength(1)
      expect(result.current.filteredStrategies[0].strategyId).toBe('velocity-banking')
    })

    it('returns empty array when no strategies match (AC-5.6.9)', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setFilters({
          effortLevels: ['low'],
          minSavings: 50000, // No low effort strategy saves this much
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(0)
    })
  })

  describe('Reset Filters', () => {
    it('resets filters to default state', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      // Apply filters
      act(() => {
        result.current.setFilters({
          effortLevels: ['high'],
          minSavings: 20000,
        })
      })

      expect(result.current.filteredStrategies).toHaveLength(2)

      // Reset
      act(() => {
        result.current.resetFilters()
      })

      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE)
      expect(result.current.filteredStrategies).toHaveLength(6)
      expect(result.current.hasActiveFilters).toBe(false)
    })
  })

  describe('hasActiveFilters', () => {
    it('returns false when default state', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      expect(result.current.hasActiveFilters).toBe(false)
    })

    it('returns true when effort levels differ from default', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.toggleEffortLevel('low')
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })

    it('returns true when min savings is set', () => {
      const { result } = renderHook(() => useStrategyFilters(mockStrategies))

      act(() => {
        result.current.setMinSavings(5000)
      })

      expect(result.current.hasActiveFilters).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    it('handles empty strategies array', () => {
      const { result } = renderHook(() => useStrategyFilters([]))

      expect(result.current.filteredStrategies).toHaveLength(0)
      expect(result.current.filters).toEqual(DEFAULT_FILTER_STATE)
    })

    it('updates when strategies change', () => {
      const { result, rerender } = renderHook(
        ({ strategies }) => useStrategyFilters(strategies),
        { initialProps: { strategies: mockStrategies } }
      )

      expect(result.current.filteredStrategies).toHaveLength(6)

      // Rerender with fewer strategies
      rerender({ strategies: mockStrategies.slice(0, 3) })

      expect(result.current.filteredStrategies).toHaveLength(3)
    })

    it('memoizes filtered strategies correctly', () => {
      const { result, rerender } = renderHook(() => useStrategyFilters(mockStrategies))

      const firstResult = result.current.filteredStrategies

      // Rerender without changes
      rerender()

      // Should be the same reference if memoization works
      expect(result.current.filteredStrategies).toBe(firstResult)
    })
  })
})
