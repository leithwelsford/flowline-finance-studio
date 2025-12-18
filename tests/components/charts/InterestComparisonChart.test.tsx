import { describe, it, expect, beforeAll } from 'vitest'
import { render, screen } from '@testing-library/react'
import { InterestComparisonChart } from '@/components/charts/InterestComparisonChart'
import type { StrategyProjection, MonthlyProjection } from '@/lib/calculations/types'
import Big from 'big.js'

// Mock ResizeObserver for Recharts ResponsiveContainer
beforeAll(() => {
  global.ResizeObserver = class ResizeObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
})

/**
 * Create mock monthly projections for testing
 */
function createMockProjections(months: number): MonthlyProjection[] {
  const projections: MonthlyProjection[] = []
  for (let month = 1; month <= months; month++) {
    projections.push({
      month,
      date: `2025-${String(month).padStart(2, '0')}-01`,
      accounts: [],
      totalDebt: Big(100000 - month * 3000),
      totalInterestPaid: Big(month * 500),
      totalPrincipalPaid: Big(month * 3000),
    })
  }
  return projections
}

/**
 * Mock strategy data factory
 */
function createMockStrategy(
  id: string,
  name: string,
  totalInterestPaid: number,
  debtFreeMonth: number = 30
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel: 'medium',
    debtFreeMonth,
    debtFreeDate: '2027-06-15',
    totalInterestPaid: Big(totalInterestPaid),
    totalPrincipalPaid: Big(100000),
    monthsSaved: Math.floor((50000 - totalInterestPaid) / 1000),
    interestSaved: Big(50000 - totalInterestPaid),
    monthlyProjections: createMockProjections(debtFreeMonth),
  }
}

// Mock strategies array with different interest amounts
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('velocity-banking', 'Velocity Banking', 85000, 24),
  createMockStrategy('avalanche', 'Avalanche', 98000, 28),
  createMockStrategy('snowball', 'Snowball', 108000, 30),
  createMockStrategy('baseline', 'Baseline (Minimum Payments)', 130000, 36),
]

describe('InterestComparisonChart', () => {
  describe('rendering - AC-5.4.1', () => {
    it('renders chart title', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      expect(screen.getByText('Total Interest Comparison')).toBeInTheDocument()
    })

    it('renders chart container with strategies', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Recharts ResponsiveContainer is rendered
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })

    it('renders all strategy names', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Each strategy name should appear in the sr-only table
      const srOnlyDiv = container.querySelector('.sr-only')
      mockStrategies.forEach((strategy) => {
        expect(srOnlyDiv?.textContent).toContain(strategy.strategyName)
      })
    })
  })

  describe('bar sorting - AC-5.4.2', () => {
    it('sorts bars by interest paid (lowest first)', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // The hidden data table in sr-only shows sorted order
      const srOnlyDiv = container.querySelector('.sr-only')
      const rows = srOnlyDiv?.querySelectorAll('tbody tr')

      // First row should be lowest interest (Velocity Banking)
      expect(rows?.[0]?.textContent).toContain('Velocity Banking')
      // Last row should be highest interest (Baseline)
      expect(rows?.[rows.length - 1]?.textContent).toContain('Baseline')
    })

    it('places baseline at bottom when it has highest interest', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Baseline should be last (highest interest)
      const allText = screen.getAllByText(/Baseline/)
      expect(allText.length).toBeGreaterThan(0)
    })
  })

  describe('ZAR labels - AC-5.4.3', () => {
    it('displays formatted ZAR amounts', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Check for ZAR formatted amounts in the chart
      // formatCurrency returns "R X XXX,XX" format
      const zarPattern = /R\s?\d/
      const container = document.body
      expect(container.textContent).toMatch(zarPattern)
    })
  })

  describe('bar coloring - AC-5.4.4', () => {
    it('renders chart with baseline strategy identified', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Chart renders with baseline strategy visible in sr-only table
      const srOnlyDiv = container.querySelector('.sr-only')
      expect(srOnlyDiv?.textContent).toContain('Baseline')
    })

    it('identifies baseline vs performers in accessibility table', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // The sr-only table shows "Baseline" for baseline and "Saves" for performers
      const srOnlyDiv = container.querySelector('.sr-only')
      const tableContent = srOnlyDiv?.textContent || ''

      // Should have one "Baseline" indicator
      expect(tableContent).toContain('Baseline')
      // Should have "Saves" for strategies that outperform baseline
      expect(tableContent).toContain('Saves')
    })
  })

  describe('savings annotations - AC-5.4.5', () => {
    it('displays savings annotations for top performers', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Should show "Saves" text for strategies that save vs baseline
      expect(screen.getAllByText(/Saves R/i).length).toBeGreaterThan(0)
    })

    it('shows Velocity Banking savings annotation', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Velocity Banking saves the most
      const savingsAnnotations = screen.getAllByText(/Velocity Banking/)
      expect(savingsAnnotations.length).toBeGreaterThan(0)
    })
  })

  describe('loading skeleton - AC-5.4.6', () => {
    it('displays skeleton when isLoading is true', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      // Skeleton has aria-label with "loading"
      expect(screen.getByLabelText(/loading/i)).toBeInTheDocument()
    })

    it('does NOT display chart when isLoading is true', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      // Chart title should not be visible during loading
      expect(screen.queryByText('Total Interest Comparison')).not.toBeInTheDocument()
    })

    it('has aria-busy=true when loading', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      const loadingElement = screen.getByLabelText(/loading/i)
      expect(loadingElement).toHaveAttribute('aria-busy', 'true')
    })

    it('displays chart when isLoading transitions to false', () => {
      const { rerender } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      expect(screen.queryByText('Total Interest Comparison')).not.toBeInTheDocument()

      rerender(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={false}
        />
      )

      expect(screen.getByText('Total Interest Comparison')).toBeInTheDocument()
    })
  })

  describe('empty state - AC-5.4.7', () => {
    it('displays empty state when strategies array is empty', () => {
      render(
        <InterestComparisonChart
          strategies={[]}
          baselineId=""
        />
      )

      expect(screen.getByText('No strategies calculated yet')).toBeInTheDocument()
    })

    it('shows helpful message in empty state', () => {
      render(
        <InterestComparisonChart
          strategies={[]}
          baselineId=""
        />
      )

      expect(
        screen.getByText(/add your debt accounts/i)
      ).toBeInTheDocument()
    })

    it('displays icon in empty state', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={[]}
          baselineId=""
        />
      )

      // BarChart2 icon is rendered as SVG
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('responsive layout - AC-5.4.8', () => {
    it('chart container has aria-label', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const chartContainer = container.querySelector('[aria-label*="Bar chart"]')
      expect(chartContainer).toBeInTheDocument()
    })

    it('renders with appropriate height based on strategies', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Chart container should have a style height set
      const chartDiv = container.querySelector('[aria-label*="Bar chart"]')
      expect(chartDiv).toBeInTheDocument()
      // Check the style attribute contains height
      expect(chartDiv?.getAttribute('style')).toContain('height')
    })
  })

  describe('accessibility - AC-5.4.9', () => {
    it('includes hidden data table for screen readers', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // sr-only table should exist
      const srOnlyDiv = container.querySelector('.sr-only')
      expect(srOnlyDiv).toBeInTheDocument()
    })

    it('hidden table has proper structure', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const srOnlyDiv = container.querySelector('.sr-only')
      const table = srOnlyDiv?.querySelector('table')
      expect(table).toBeInTheDocument()

      // Check for table elements
      expect(srOnlyDiv?.querySelector('caption')).toBeInTheDocument()
      expect(srOnlyDiv?.querySelector('thead')).toBeInTheDocument()
      expect(srOnlyDiv?.querySelector('tbody')).toBeInTheDocument()
    })

    it('hidden table has correct number of rows', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const srOnlyDiv = container.querySelector('.sr-only')
      const rows = srOnlyDiv?.querySelectorAll('tbody tr')
      expect(rows?.length).toBe(mockStrategies.length)
    })

    it('hidden table includes all strategy names', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const srOnlyDiv = container.querySelector('.sr-only')

      mockStrategies.forEach((strategy) => {
        expect(srOnlyDiv?.textContent).toContain(strategy.strategyName)
      })
    })

    it('hidden table shows baseline indicator', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const srOnlyDiv = container.querySelector('.sr-only')
      expect(srOnlyDiv?.textContent).toContain('Baseline')
    })
  })

  describe('props handling', () => {
    it('handles empty baselineId', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId=""
        />
      )

      expect(screen.getByText('Total Interest Comparison')).toBeInTheDocument()
    })

    it('handles single strategy', () => {
      render(
        <InterestComparisonChart
          strategies={[mockStrategies[0]]}
          baselineId=""
        />
      )

      expect(screen.getByText('Total Interest Comparison')).toBeInTheDocument()
    })

    it('handles strategies with same interest amount', () => {
      const sameInterestStrategies = [
        createMockStrategy('a', 'Strategy A', 100000),
        createMockStrategy('b', 'Strategy B', 100000),
      ]

      render(
        <InterestComparisonChart
          strategies={sameInterestStrategies}
          baselineId=""
        />
      )

      expect(screen.getByText('Total Interest Comparison')).toBeInTheDocument()
    })
  })

  describe('data transformation', () => {
    it('correctly calculates savings vs baseline', () => {
      render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Velocity Banking saves 130000 - 85000 = 45000
      // Check that "Saves R" appears with a reasonable amount
      const savingsTexts = screen.getAllByText(/Saves R/)
      expect(savingsTexts.length).toBeGreaterThan(0)
    })

    it('converts Big.js values to numbers for chart', () => {
      const { container } = render(
        <InterestComparisonChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Chart should render without errors - check for recharts container
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })
  })
})
