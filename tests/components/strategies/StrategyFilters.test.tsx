import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { StrategyFilters } from '@/components/strategies/StrategyFilters'
import type { FilterState } from '@/hooks/useStrategyFilters'

// Default props factory
function createDefaultProps(overrides?: Partial<{
  filters: FilterState
  onToggleEffortLevel: (level: 'low' | 'medium' | 'high') => void
  onSetMinSavings: (value: number | null) => void
  onResetFilters: () => void
  hasActiveFilters: boolean
}>) {
  return {
    filters: {
      effortLevels: ['low', 'medium', 'high'] as ('low' | 'medium' | 'high')[],
      minSavings: null,
    },
    onToggleEffortLevel: vi.fn(),
    onSetMinSavings: vi.fn(),
    onResetFilters: vi.fn(),
    hasActiveFilters: false,
    ...overrides,
  }
}

describe('StrategyFilters', () => {
  describe('Rendering', () => {
    it('renders effort level toggle buttons (AC-5.6.1)', () => {
      const props = createDefaultProps()
      render(<StrategyFilters {...props} />)

      expect(screen.getByRole('button', { name: /filter by low effort/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by medium effort/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by high effort/i })).toBeInTheDocument()
    })

    it('renders minimum savings input (AC-5.6.2)', () => {
      const props = createDefaultProps()
      render(<StrategyFilters {...props} />)

      expect(screen.getByLabelText(/minimum savings threshold/i)).toBeInTheDocument()
    })

    it('shows reset button when filters are active', () => {
      const props = createDefaultProps({ hasActiveFilters: true })
      render(<StrategyFilters {...props} />)

      expect(screen.getByRole('button', { name: /reset filters/i })).toBeInTheDocument()
    })

    it('hides reset button when no filters are active', () => {
      const props = createDefaultProps({ hasActiveFilters: false })
      render(<StrategyFilters {...props} />)

      expect(screen.queryByRole('button', { name: /reset filters/i })).not.toBeInTheDocument()
    })
  })

  describe('Effort Level Toggles (AC-5.6.1)', () => {
    it('marks selected effort levels as pressed', () => {
      const props = createDefaultProps({
        filters: {
          effortLevels: ['low', 'high'],
          minSavings: null,
        },
      })
      render(<StrategyFilters {...props} />)

      expect(screen.getByRole('button', { name: /filter by low effort/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
      expect(screen.getByRole('button', { name: /filter by medium effort/i })).toHaveAttribute(
        'aria-pressed',
        'false'
      )
      expect(screen.getByRole('button', { name: /filter by high effort/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      )
    })

    it('calls onToggleEffortLevel when clicking effort button', () => {
      const onToggleEffortLevel = vi.fn()
      const props = createDefaultProps({ onToggleEffortLevel })
      render(<StrategyFilters {...props} />)

      fireEvent.click(screen.getByRole('button', { name: /filter by medium effort/i }))

      expect(onToggleEffortLevel).toHaveBeenCalledWith('medium')
    })

    it('calls onToggleEffortLevel for each effort level', () => {
      const onToggleEffortLevel = vi.fn()
      const props = createDefaultProps({ onToggleEffortLevel })
      render(<StrategyFilters {...props} />)

      fireEvent.click(screen.getByRole('button', { name: /filter by low effort/i }))
      expect(onToggleEffortLevel).toHaveBeenCalledWith('low')

      fireEvent.click(screen.getByRole('button', { name: /filter by high effort/i }))
      expect(onToggleEffortLevel).toHaveBeenCalledWith('high')
    })
  })

  describe('Minimum Savings Input (AC-5.6.2)', () => {
    it('displays current minimum savings value', () => {
      const props = createDefaultProps({
        filters: {
          effortLevels: ['low', 'medium', 'high'],
          minSavings: 5000,
        },
      })
      render(<StrategyFilters {...props} />)

      const input = screen.getByLabelText(/minimum savings threshold/i) as HTMLInputElement
      expect(input.value).toBe('5000')
    })

    it('calls onSetMinSavings when value changes', () => {
      const onSetMinSavings = vi.fn()
      const props = createDefaultProps({ onSetMinSavings })
      render(<StrategyFilters {...props} />)

      const input = screen.getByLabelText(/minimum savings threshold/i)
      fireEvent.change(input, { target: { value: '10000' } })

      expect(onSetMinSavings).toHaveBeenCalledWith(10000)
    })

    it('calls onSetMinSavings with null when input is cleared', () => {
      const onSetMinSavings = vi.fn()
      const props = createDefaultProps({
        onSetMinSavings,
        filters: {
          effortLevels: ['low', 'medium', 'high'],
          minSavings: 5000,
        },
      })
      render(<StrategyFilters {...props} />)

      const input = screen.getByLabelText(/minimum savings threshold/i)
      fireEvent.change(input, { target: { value: '' } })

      expect(onSetMinSavings).toHaveBeenCalledWith(null)
    })

    it('shows clear button when value is set', () => {
      const props = createDefaultProps({
        filters: {
          effortLevels: ['low', 'medium', 'high'],
          minSavings: 5000,
        },
      })
      render(<StrategyFilters {...props} />)

      expect(screen.getByLabelText(/clear minimum savings/i)).toBeInTheDocument()
    })

    it('hides clear button when value is empty', () => {
      const props = createDefaultProps({
        filters: {
          effortLevels: ['low', 'medium', 'high'],
          minSavings: null,
        },
      })
      render(<StrategyFilters {...props} />)

      expect(screen.queryByLabelText(/clear minimum savings/i)).not.toBeInTheDocument()
    })

    it('calls onSetMinSavings(null) when clear button clicked', () => {
      const onSetMinSavings = vi.fn()
      const props = createDefaultProps({
        onSetMinSavings,
        filters: {
          effortLevels: ['low', 'medium', 'high'],
          minSavings: 5000,
        },
      })
      render(<StrategyFilters {...props} />)

      fireEvent.click(screen.getByLabelText(/clear minimum savings/i))

      expect(onSetMinSavings).toHaveBeenCalledWith(null)
    })
  })

  describe('Reset Filters', () => {
    it('calls onResetFilters when reset button clicked', () => {
      const onResetFilters = vi.fn()
      const props = createDefaultProps({
        onResetFilters,
        hasActiveFilters: true,
      })
      render(<StrategyFilters {...props} />)

      fireEvent.click(screen.getByRole('button', { name: /reset filters/i }))

      expect(onResetFilters).toHaveBeenCalled()
    })
  })

  describe('Accessibility', () => {
    it('has accessible labels for all controls', () => {
      const props = createDefaultProps()
      render(<StrategyFilters {...props} />)

      // All buttons should have accessible names
      expect(screen.getByRole('button', { name: /filter by low effort/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by medium effort/i })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: /filter by high effort/i })).toBeInTheDocument()

      // Input should have a label
      expect(screen.getByLabelText(/minimum savings threshold/i)).toBeInTheDocument()
    })

    it('uses aria-pressed for toggle state', () => {
      const props = createDefaultProps({
        filters: {
          effortLevels: ['low'],
          minSavings: null,
        },
      })
      render(<StrategyFilters {...props} />)

      const lowButton = screen.getByRole('button', { name: /filter by low effort/i })
      const mediumButton = screen.getByRole('button', { name: /filter by medium effort/i })

      expect(lowButton).toHaveAttribute('aria-pressed', 'true')
      expect(mediumButton).toHaveAttribute('aria-pressed', 'false')
    })
  })
})
