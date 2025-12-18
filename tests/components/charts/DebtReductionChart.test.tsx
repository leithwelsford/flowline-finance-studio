import { describe, it, expect, vi, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { DebtReductionChart } from '@/components/charts/DebtReductionChart'
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
function createMockProjections(
  months: number,
  startingDebt: number
): MonthlyProjection[] {
  const projections: MonthlyProjection[] = []
  const monthlyReduction = startingDebt / months

  for (let month = 1; month <= months; month++) {
    const remainingDebt = Math.max(0, startingDebt - monthlyReduction * month)
    projections.push({
      month,
      date: `2025-${String(month).padStart(2, '0')}-01`,
      accounts: [
        {
          accountId: 1,
          startBalance: Big(remainingDebt + monthlyReduction),
          interestCharged: Big(100),
          paymentApplied: Big(monthlyReduction + 100),
          principalPaid: Big(monthlyReduction),
          endBalance: Big(remainingDebt),
        },
      ],
      totalDebt: Big(remainingDebt),
      totalInterestPaid: Big(100 * month),
      totalPrincipalPaid: Big(monthlyReduction * month),
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
  interestSaved: number,
  debtFreeMonth: number = 30,
  startingDebt: number = 100000
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel: 'medium',
    debtFreeMonth,
    debtFreeDate: '2027-06-15',
    totalInterestPaid: Big(50000 - interestSaved),
    totalPrincipalPaid: Big(startingDebt),
    monthsSaved: Math.floor(interestSaved / 1000),
    interestSaved: Big(interestSaved),
    monthlyProjections: createMockProjections(debtFreeMonth, startingDebt),
  }
}

// Mock strategies array (sorted by interestSaved descending)
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('velocity-banking', 'Velocity Banking', 45000, 24),
  createMockStrategy('avalanche', 'Avalanche', 38000, 28),
  createMockStrategy('snowball', 'Snowball', 32000, 30),
  createMockStrategy('baseline', 'Baseline (Minimum Payments)', 0, 36),
]

describe('DebtReductionChart', () => {
  describe('rendering - AC-5.3.1', () => {
    it('renders chart title', () => {
      render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })

    it('renders chart container with strategies', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Recharts ResponsiveContainer is rendered
      expect(container.querySelector('.recharts-responsive-container')).toBeInTheDocument()
    })
  })

  describe('data transformation - AC-5.3.1, AC-5.3.2', () => {
    it('handles strategies with different debt-free months', () => {
      // Create strategies with different lengths
      const shortStrategy = createMockStrategy('short', 'Short', 5000, 12)
      const longStrategy = createMockStrategy('long', 'Long', 2000, 36)

      render(
        <DebtReductionChart
          strategies={[shortStrategy, longStrategy]}
          baselineId=""
        />
      )

      // Should render without errors
      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })
  })

  describe('loading skeleton - AC-5.3.9', () => {
    it('displays skeleton when isLoading is true', () => {
      render(
        <DebtReductionChart
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
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      // Chart title should not be visible during loading
      expect(screen.queryByText('Debt Reduction Over Time')).not.toBeInTheDocument()
    })

    it('has aria-busy=true when loading', () => {
      render(
        <DebtReductionChart
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
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={true}
        />
      )

      expect(screen.queryByText('Debt Reduction Over Time')).not.toBeInTheDocument()

      rerender(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
          isLoading={false}
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })
  })

  describe('empty state - AC-5.3.10', () => {
    it('displays empty state when strategies array is empty', () => {
      render(
        <DebtReductionChart
          strategies={[]}
          baselineId=""
        />
      )

      expect(screen.getByText('No strategies calculated yet')).toBeInTheDocument()
    })

    it('shows helpful message in empty state', () => {
      render(
        <DebtReductionChart
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
        <DebtReductionChart
          strategies={[]}
          baselineId=""
        />
      )

      // TrendingDown icon is rendered as SVG
      const icon = container.querySelector('svg')
      expect(icon).toBeInTheDocument()
    })
  })

  describe('responsive layout - AC-5.3.8', () => {
    it('has responsive height classes', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Check for responsive height classes
      const chartContainer = container.querySelector('[class*="h-\\[280px\\]"]')
      expect(chartContainer).toBeInTheDocument()

      const smChartContainer = container.querySelector('[class*="sm\\:h-\\[400px\\]"]')
      expect(smChartContainer).toBeInTheDocument()
    })

    it('renders mobile legend container', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Mobile legend is in sm:hidden container
      const mobileLegend = container.querySelector('.sm\\:hidden')
      expect(mobileLegend).toBeInTheDocument()
    })

    it('has correct number of mobile legend buttons', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const mobileLegend = container.querySelector('.sm\\:hidden')
      const buttons = mobileLegend?.querySelectorAll('button')
      expect(buttons?.length).toBe(mockStrategies.length)
    })
  })

  describe('legend toggle - AC-5.3.6', () => {
    it('clicking mobile legend button toggles opacity class', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Find mobile legend buttons
      const mobileLegend = container.querySelector('.sm\\:hidden')
      const buttons = mobileLegend?.querySelectorAll('button')

      expect(buttons?.length).toBeGreaterThan(0)

      // Click first button to hide strategy
      if (buttons?.[0]) {
        fireEvent.click(buttons[0])
      }

      // After clicking, the button should have opacity-40 class
      expect(buttons?.[0]).toHaveClass('opacity-40')
    })

    it('clicking hidden legend button shows it again', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const mobileLegend = container.querySelector('.sm\\:hidden')
      const buttons = mobileLegend?.querySelectorAll('button')

      // Click to hide
      if (buttons?.[0]) {
        fireEvent.click(buttons[0])
        expect(buttons[0]).toHaveClass('opacity-40')

        // Click again to show
        fireEvent.click(buttons[0])
        expect(buttons[0]).not.toHaveClass('opacity-40')
      }
    })
  })

  describe('strategy line configuration - AC-5.3.3, AC-5.3.4', () => {
    it('baseline strategy is identified correctly', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Mobile legend should show baseline
      const buttons = container.querySelectorAll('.sm\\:hidden button')
      const baselineButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('Baseline')
      )
      expect(baselineButton).toBeInTheDocument()
    })

    it('recommended strategy is identified correctly', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId="velocity-banking"
        />
      )

      // Mobile legend should show velocity banking
      const buttons = container.querySelectorAll('.sm\\:hidden button')
      const recommendedButton = Array.from(buttons).find((btn) =>
        btn.textContent?.includes('Velocity Banking')
      )
      expect(recommendedButton).toBeInTheDocument()
    })
  })

  describe('accessibility', () => {
    it('chart card is rendered with proper structure', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // Card component structure
      expect(container.querySelector('[class*="rounded-"]')).toBeInTheDocument()
    })

    it('mobile legend buttons are keyboard accessible', () => {
      const { container } = render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      const mobileLegend = container.querySelector('.sm\\:hidden')
      const buttons = mobileLegend?.querySelectorAll('button')

      buttons?.forEach((button) => {
        // Buttons are focusable by default
        expect(button.tagName).toBe('BUTTON')
      })
    })

    it('displays strategy names in mobile legend', () => {
      render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
        />
      )

      // All strategy names should be in the document (mobile legend)
      mockStrategies.forEach((strategy) => {
        expect(screen.getByText(strategy.strategyName)).toBeInTheDocument()
      })
    })
  })

  describe('performance optimization - AC-5.3.7', () => {
    it('handles long projections without errors', () => {
      // Create strategy with long projection (150 months)
      const longStrategy = createMockStrategy(
        'long-strategy',
        'Long Strategy',
        20000,
        150,
        200000
      )

      render(
        <DebtReductionChart
          strategies={[longStrategy]}
          baselineId=""
        />
      )

      // Chart should render without errors
      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })

    it('handles very short projections', () => {
      // Create strategy with short projection
      const shortStrategy = createMockStrategy(
        'short-strategy',
        'Short Strategy',
        5000,
        6,
        50000
      )

      render(
        <DebtReductionChart
          strategies={[shortStrategy]}
          baselineId=""
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })
  })

  describe('props handling', () => {
    it('handles undefined recommendedId', () => {
      render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId="baseline"
          recommendedId={undefined}
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })

    it('handles empty baselineId', () => {
      render(
        <DebtReductionChart
          strategies={mockStrategies}
          baselineId=""
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()
    })

    it('handles single strategy', () => {
      render(
        <DebtReductionChart
          strategies={[mockStrategies[0]]}
          baselineId=""
        />
      )

      expect(screen.getByText('Debt Reduction Over Time')).toBeInTheDocument()

      // Mobile legend should have 1 button
      const mobileLegend = screen.getByText('Velocity Banking').closest('.sm\\:hidden')
      const buttons = mobileLegend?.querySelectorAll('button')
      expect(buttons?.length).toBe(1)
    })
  })
})
