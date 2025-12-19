import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import { ComparisonTable } from '@/components/strategies/ComparisonTable'
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types'
import Big from 'big.js'

// Mock strategy data factory
function createMockStrategy(
  id: string,
  name: string,
  options: {
    interestSaved?: number
    totalInterestPaid?: number
    monthsSaved?: number
    effortLevel?: EffortLevel
    debtFreeDate?: string
  } = {}
): StrategyProjection {
  const {
    interestSaved = 10000,
    totalInterestPaid = 50000,
    monthsSaved = 12,
    effortLevel = 'medium',
    debtFreeDate = '2027-06-15',
  } = options

  return {
    strategyId: id,
    strategyName: name,
    effortLevel,
    debtFreeMonth: 30,
    debtFreeDate,
    totalInterestPaid: Big(totalInterestPaid),
    totalPrincipalPaid: Big(100000),
    monthsSaved,
    interestSaved: Big(interestSaved),
    monthlyProjections: [],
  }
}

// Mock strategies array (sorted by interestSaved descending)
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('velocity', 'Velocity Banking', {
    interestSaved: 45000,
    totalInterestPaid: 35000,
    monthsSaved: 42,
    effortLevel: 'high',
    debtFreeDate: '2026-12-01',
  }),
  createMockStrategy('avalanche-flexi', 'Avalanche + Flexi Parking', {
    interestSaved: 38000,
    totalInterestPaid: 42000,
    monthsSaved: 36,
    effortLevel: 'medium',
    debtFreeDate: '2027-03-15',
  }),
  createMockStrategy('snowball-flexi', 'Snowball + Flexi Parking', {
    interestSaved: 32000,
    totalInterestPaid: 48000,
    monthsSaved: 30,
    effortLevel: 'medium',
    debtFreeDate: '2027-06-20',
  }),
  createMockStrategy('avalanche', 'Avalanche', {
    interestSaved: 25000,
    totalInterestPaid: 55000,
    monthsSaved: 24,
    effortLevel: 'low',
    debtFreeDate: '2027-09-01',
  }),
  createMockStrategy('baseline', 'Baseline (Minimum Payments)', {
    interestSaved: 0,
    totalInterestPaid: 80000,
    monthsSaved: 0,
    effortLevel: 'low',
    debtFreeDate: '2030-12-01',
  }),
]

// Helper to get desktop table container
function getDesktopTable(container: HTMLElement) {
  return container.querySelector('.hidden.sm\\:block') as HTMLElement
}

describe('ComparisonTable', () => {
  describe('AC-5.2.1: Table columns', () => {
    it('renders all 6 data columns in table header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId="velocity"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('Strategy Name')).toBeInTheDocument()
      expect(tableScope.getByText('Debt-Free Date')).toBeInTheDocument()
      expect(tableScope.getByText('Total Interest Paid')).toBeInTheDocument()
      expect(tableScope.getByText('Interest Saved')).toBeInTheDocument()
      expect(tableScope.getByText('Months Saved')).toBeInTheDocument()
      expect(tableScope.getByText('Effort Rating')).toBeInTheDocument()
    })

    it('renders Action column with Select buttons', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('Action')).toBeInTheDocument()
      const selectButtons = tableScope.getAllByRole('button', { name: 'Select' })
      expect(selectButtons.length).toBe(mockStrategies.length)
    })

    it('displays all strategy rows', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('Velocity Banking')).toBeInTheDocument()
      expect(tableScope.getByText('Avalanche + Flexi Parking')).toBeInTheDocument()
      expect(tableScope.getByText('Snowball + Flexi Parking')).toBeInTheDocument()
      expect(tableScope.getByText('Avalanche')).toBeInTheDocument()
      expect(tableScope.getByText('Baseline (Minimum Payments)')).toBeInTheDocument()
    })
  })

  describe('AC-5.2.2: Default sort by interest saved', () => {
    it('shows strategies sorted by interest saved descending by default', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const rows = within(table).getAllByRole('row')
      // First row is header, so data rows start at index 1
      const dataRows = rows.slice(1)

      expect(within(dataRows[0]).getByText('Velocity Banking')).toBeInTheDocument()
      expect(within(dataRows[1]).getByText('Avalanche + Flexi Parking')).toBeInTheDocument()
      expect(within(dataRows[2]).getByText('Snowball + Flexi Parking')).toBeInTheDocument()
      expect(within(dataRows[3]).getByText('Avalanche')).toBeInTheDocument()
      expect(within(dataRows[4]).getByText('Baseline (Minimum Payments)')).toBeInTheDocument()
    })
  })

  describe('AC-5.2.3: Column sorting toggle', () => {
    it('toggles sort direction when clicking same column header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const interestSavedHeader = tableScope.getByText('Interest Saved').closest('th')!

      // Default is descending, first click toggles to ascending
      fireEvent.click(interestSavedHeader)

      const rows = tableScope.getAllByRole('row')
      const dataRows = rows.slice(1)

      // Ascending: Baseline (0) should be first
      expect(within(dataRows[0]).getByText('Baseline (Minimum Payments)')).toBeInTheDocument()
    })

    it('sorts by strategy name when clicking Strategy Name header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const nameHeader = tableScope.getByText('Strategy Name').closest('th')!
      fireEvent.click(nameHeader)

      const rows = tableScope.getAllByRole('row')
      const dataRows = rows.slice(1)

      // Descending alphabetically: Velocity > Snowball > Baseline > Avalanche+Flexi > Avalanche
      expect(within(dataRows[0]).getByText('Velocity Banking')).toBeInTheDocument()
    })

    it('sorts by debt-free date when clicking Debt-Free Date header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const dateHeader = tableScope.getByText('Debt-Free Date').closest('th')!
      fireEvent.click(dateHeader)

      const rows = tableScope.getAllByRole('row')
      const dataRows = rows.slice(1)

      // Descending by date: Baseline (2030) should be first
      expect(within(dataRows[0]).getByText('Baseline (Minimum Payments)')).toBeInTheDocument()
    })

    it('sorts by months saved when clicking Months Saved header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const monthsHeader = tableScope.getByText('Months Saved').closest('th')!
      fireEvent.click(monthsHeader)

      const rows = tableScope.getAllByRole('row')
      const dataRows = rows.slice(1)

      // Descending: Velocity (42) should be first
      expect(within(dataRows[0]).getByText('Velocity Banking')).toBeInTheDocument()
    })

    it('sorts by effort level when clicking Effort Rating header', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const effortHeader = tableScope.getByText('Effort Rating').closest('th')!
      fireEvent.click(effortHeader)

      const rows = tableScope.getAllByRole('row')
      const dataRows = rows.slice(1)

      // Descending by effort: High > Medium > Low
      // Velocity (high) should be first
      expect(within(dataRows[0]).getByText('Velocity Banking')).toBeInTheDocument()
    })

    it('shows sort indicator arrows', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const sortIcons = table.querySelectorAll('[class*="lucide"]')
      expect(sortIcons.length).toBeGreaterThan(0)
    })
  })

  describe('AC-5.2.4: Baseline row styling', () => {
    it('applies muted/gray styling to baseline row', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const baselineRow = tableScope.getByText('Baseline (Minimum Payments)').closest('tr')
      expect(baselineRow).toHaveClass('bg-slate-100')
      expect(baselineRow).toHaveClass('text-muted-foreground')
    })

    it('shows "Baseline" badge on baseline row', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      expect(tableScope.getByText('Baseline')).toBeInTheDocument()
    })

    it('does not apply baseline styling to non-baseline rows', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const velocityRow = tableScope.getByText('Velocity Banking').closest('tr')
      expect(velocityRow).not.toHaveClass('bg-slate-100')
    })
  })

  describe('AC-5.2.5: Recommended strategy highlighting', () => {
    it('applies teal highlight to recommended row', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId="velocity"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const recommendedRow = tableScope.getByText('Velocity Banking').closest('tr')
      // Recommended rows get lighter teal (bg-teal-50/50) to differentiate from selected rows
      expect(recommendedRow).toHaveClass('bg-teal-50/50')
      expect(recommendedRow).toHaveClass('border-l-4')
      expect(recommendedRow).toHaveClass('border-teal-400')
    })

    it('shows star icon on recommended row', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId="velocity"
        />
      )

      const table = getDesktopTable(container)
      const starIcon = table.querySelector('[class*="lucide-star"]')
      expect(starIcon).toBeInTheDocument()
    })

    it('does not apply recommended styling when recommendedId not provided', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const velocityRow = tableScope.getByText('Velocity Banking').closest('tr')
      expect(velocityRow).not.toHaveClass('bg-teal-50')
    })

    it('does not apply recommended styling if strategy is baseline', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const baselineRow = tableScope.getByText('Baseline (Minimum Payments)').closest('tr')
      // Should have baseline styling, not recommended styling
      expect(baselineRow).toHaveClass('bg-slate-100')
      expect(baselineRow).not.toHaveClass('bg-teal-50')
    })
  })

  describe('AC-5.2.6: Effort rating badges', () => {
    it('shows Low effort badge with green styling', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const lowBadges = tableScope.getAllByText('Low')
      expect(lowBadges.length).toBeGreaterThan(0)
      expect(lowBadges[0]).toHaveClass('bg-green-100')
      expect(lowBadges[0]).toHaveClass('text-green-800')
    })

    it('shows Medium effort badge with amber styling', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const mediumBadges = tableScope.getAllByText('Medium')
      expect(mediumBadges.length).toBeGreaterThan(0)
      expect(mediumBadges[0]).toHaveClass('bg-amber-100')
      expect(mediumBadges[0]).toHaveClass('text-amber-800')
    })

    it('shows High effort badge with red styling', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const highBadges = tableScope.getAllByText('High')
      expect(highBadges.length).toBeGreaterThan(0)
      expect(highBadges[0]).toHaveClass('bg-red-100')
      expect(highBadges[0]).toHaveClass('text-red-800')
    })
  })

  describe('AC-5.2.7: Mobile responsive layout', () => {
    it('has overflow-x-auto class on table container for horizontal scroll', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const scrollContainer = container.querySelector('[class*="overflow-x-auto"]')
      expect(scrollContainer).toBeInTheDocument()
    })

    it('has sticky first column styling', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const stickyElements = container.querySelectorAll('[class*="sticky"]')
      expect(stickyElements.length).toBeGreaterThan(0)
    })

    it('renders mobile card layout (hidden on sm screens)', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Mobile cards container should exist
      const mobileContainer = container.querySelector('.sm\\:hidden')
      expect(mobileContainer).toBeInTheDocument()
    })

    it('hides table on mobile (hidden class)', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Desktop table should be hidden on mobile
      const desktopContainer = container.querySelector('.hidden.sm\\:block')
      expect(desktopContainer).toBeInTheDocument()
    })
  })

  describe('AC-5.2.8: Loading skeleton state', () => {
    it('shows skeleton when isLoading is true', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does not show strategy content when isLoading is true', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      expect(screen.queryByText('Velocity Banking')).not.toBeInTheDocument()
    })

    it('has aria-busy=true when loading', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      const loadingElement = screen.getByLabelText(/loading/i)
      expect(loadingElement).toHaveAttribute('aria-busy', 'true')
    })

    it('shows 6 skeleton rows', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      // 1 header + 6 row skeletons = 7
      expect(skeletons.length).toBe(7)
    })
  })

  describe('AC-5.2.9: Select button', () => {
    it('renders Select button for each row in table', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const selectButtons = tableScope.getAllByRole('button', { name: 'Select' })
      expect(selectButtons.length).toBe(mockStrategies.length)
    })

    it('calls onSelectStrategy with strategyId when clicked', () => {
      const handleSelect = vi.fn()
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          onSelectStrategy={handleSelect}
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const selectButtons = tableScope.getAllByRole('button', { name: 'Select' })
      fireEvent.click(selectButtons[0])

      // First row after sorting is Velocity
      expect(handleSelect).toHaveBeenCalledWith('velocity')
    })

    it('disables Select buttons when onSelectStrategy is not provided', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const selectButtons = tableScope.getAllByRole('button', { name: 'Select' })
      selectButtons.forEach(button => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('AC-5.2.10: Table id attribute', () => {
    it('has id="comparison-table" on root element', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const tableSection = container.querySelector('#comparison-table')
      expect(tableSection).toBeInTheDocument()
    })

    it('has id="comparison-table" even when loading', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      const tableSection = container.querySelector('#comparison-table')
      expect(tableSection).toBeInTheDocument()
    })
  })

  describe('data formatting', () => {
    it('formats currency values in ZAR format', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      // Check for ZAR formatted values (R XX XXX)
      expect(tableScope.getByText(/R\s*45\s*000/)).toBeInTheDocument() // Interest saved
      expect(tableScope.getByText(/R\s*35\s*000/)).toBeInTheDocument() // Total interest paid
    })

    it('formats dates in SA DD/MM/YYYY format', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('01/12/2026')).toBeInTheDocument() // Velocity
    })

    it('displays months saved as number', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('42')).toBeInTheDocument() // Velocity months saved
    })
  })

  describe('edge cases', () => {
    it('returns null when strategies array is empty', () => {
      const { container } = render(
        <ComparisonTable
          strategies={[]}
          baselineId="baseline"
        />
      )

      expect(container.firstChild).toBeNull()
    })

    it('handles single strategy', () => {
      const singleStrategy = [mockStrategies[0]]
      const { container } = render(
        <ComparisonTable
          strategies={singleStrategy}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      expect(tableScope.getByText('Velocity Banking')).toBeInTheDocument()
    })

    it('handles strategy with zero interest saved', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)

      // Baseline has 0 interest saved - R 0,00 format
      expect(tableScope.getByText(/R\s*0,00/)).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('has section aria-label', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      expect(screen.getByRole('region', { name: /comparison table/i })).toBeInTheDocument()
    })

    it('column headers have aria-sort attribute', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const interestSavedHeader = tableScope.getByText('Interest Saved').closest('th')
      expect(interestSavedHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('updates aria-sort when sort changes', () => {
      const { container } = render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const table = getDesktopTable(container)
      const tableScope = within(table)
      const interestSavedHeader = tableScope.getByText('Interest Saved').closest('th')!

      // Default is descending, first click toggles to ascending
      fireEvent.click(interestSavedHeader)

      expect(interestSavedHeader).toHaveAttribute('aria-sort', 'ascending')
    })

    it('has heading for table section', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      expect(screen.getByRole('heading', { name: /strategy comparison/i })).toBeInTheDocument()
    })
  })
})
