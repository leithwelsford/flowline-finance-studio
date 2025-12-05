import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WinnersPodium } from '@/components/strategies/WinnersPodium'
import type { StrategyProjection } from '@/lib/calculations/types'
import Big from 'big.js'

// Mock strategy data factory
function createMockStrategy(
  id: string,
  name: string,
  interestSaved: number,
  debtFreeDate: string = '2027-06-15'
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel: 'medium',
    debtFreeMonth: 30,
    debtFreeDate,
    totalInterestPaid: Big(50000),
    totalPrincipalPaid: Big(100000),
    monthsSaved: 12,
    interestSaved: Big(interestSaved),
    monthlyProjections: [],
  }
}

// Mock strategies array (sorted by interestSaved descending as per useStrategies)
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('velocity', 'Velocity Banking', 45000, '2026-12-01'),
  createMockStrategy('avalanche-flexi', 'Avalanche + Flexi Parking', 38000, '2027-03-15'),
  createMockStrategy('snowball-flexi', 'Snowball + Flexi Parking', 32000, '2027-06-20'),
  createMockStrategy('avalanche', 'Avalanche', 25000, '2027-09-01'),
  createMockStrategy('snowball', 'Snowball', 20000, '2027-12-01'),
]

describe('WinnersPodium', () => {
  describe('rendering - AC-5.1.1', () => {
    it('renders 3 strategy cards when strategies array has 3+ items', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      // Check all 3 positions are rendered
      expect(screen.getByText('Velocity Banking')).toBeInTheDocument()
      expect(screen.getByText('Avalanche + Flexi Parking')).toBeInTheDocument()
      expect(screen.getByText('Snowball + Flexi Parking')).toBeInTheDocument()

      // Should NOT render 4th and 5th strategies
      expect(screen.queryByText('Avalanche')).not.toBeInTheDocument()
      expect(screen.queryByText('Snowball')).not.toBeInTheDocument()
    })

    it('renders section heading', () => {
      render(<WinnersPodium strategies={mockStrategies} />)
      expect(screen.getByText('Top Strategies')).toBeInTheDocument()
    })

    it('has correct aria-label on section', () => {
      render(<WinnersPodium strategies={mockStrategies} />)
      expect(screen.getByRole('region', { name: /winner's podium/i })).toBeInTheDocument()
    })
  })

  describe('display content - AC-5.1.2', () => {
    it('displays strategy name for each position', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      expect(screen.getByText('Velocity Banking')).toBeInTheDocument()
      expect(screen.getByText('Avalanche + Flexi Parking')).toBeInTheDocument()
      expect(screen.getByText('Snowball + Flexi Parking')).toBeInTheDocument()
    })

    it('displays formatted interest saved in ZAR', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      // ZAR format: R 45 000,00
      expect(screen.getByText(/R\s*45\s*000/)).toBeInTheDocument()
      expect(screen.getByText(/R\s*38\s*000/)).toBeInTheDocument()
      expect(screen.getByText(/R\s*32\s*000/)).toBeInTheDocument()
    })

    it('displays debt-free date in SA DD/MM/YYYY format', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      // SA format: DD/MM/YYYY
      expect(screen.getByText('01/12/2026')).toBeInTheDocument() // Velocity
      expect(screen.getByText('15/03/2027')).toBeInTheDocument() // Avalanche + Flexi
      expect(screen.getByText('20/06/2027')).toBeInTheDocument() // Snowball + Flexi
    })

    it('displays Interest Saved label', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const labels = screen.getAllByText('Interest Saved')
      expect(labels.length).toBe(3)
    })

    it('displays Debt-Free Date label', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const labels = screen.getAllByText('Debt-Free Date')
      expect(labels.length).toBe(3)
    })
  })

  describe('podium layout - AC-5.1.3', () => {
    it('renders rank badges 1, 2, 3', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('assigns correct strategy to each rank position', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      // 1st place should be highest interest saved (Velocity Banking)
      const firstPlaceCard = screen.getByText('Velocity Banking').closest('[role="button"]')
      expect(firstPlaceCard).toHaveAttribute('aria-label', expect.stringContaining('1st place'))

      // 2nd place should be second highest (Avalanche + Flexi)
      const secondPlaceCard = screen.getByText('Avalanche + Flexi Parking').closest('[role="button"]')
      expect(secondPlaceCard).toHaveAttribute('aria-label', expect.stringContaining('2nd place'))

      // 3rd place should be third highest (Snowball + Flexi)
      const thirdPlaceCard = screen.getByText('Snowball + Flexi Parking').closest('[role="button"]')
      expect(thirdPlaceCard).toHaveAttribute('aria-label', expect.stringContaining('3rd place'))
    })
  })

  describe('recommended badge - AC-5.1.4', () => {
    it('shows "Recommended" badge when 1st place matches recommendedId', () => {
      render(
        <WinnersPodium
          strategies={mockStrategies}
          recommendedId="velocity"
        />
      )

      expect(screen.getByText('Recommended')).toBeInTheDocument()
    })

    it('does NOT show "Recommended" badge when recommendedId is 2nd place', () => {
      render(
        <WinnersPodium
          strategies={mockStrategies}
          recommendedId="avalanche-flexi"
        />
      )

      expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    })

    it('does NOT show "Recommended" badge when recommendedId is not provided', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    })

    it('does NOT show "Recommended" badge when recommendedId does not match any top 3', () => {
      render(
        <WinnersPodium
          strategies={mockStrategies}
          recommendedId="some-other-strategy"
        />
      )

      expect(screen.queryByText('Recommended')).not.toBeInTheDocument()
    })
  })

  describe('click interaction - AC-5.1.5', () => {
    it('calls onPositionClick with strategyId when position is clicked', () => {
      const handleClick = vi.fn()
      render(
        <WinnersPodium
          strategies={mockStrategies}
          onPositionClick={handleClick}
        />
      )

      const firstPlace = screen.getByText('Velocity Banking').closest('[role="button"]')!
      fireEvent.click(firstPlace)

      expect(handleClick).toHaveBeenCalledWith('velocity')
    })

    it('calls onPositionClick for 2nd place with correct id', () => {
      const handleClick = vi.fn()
      render(
        <WinnersPodium
          strategies={mockStrategies}
          onPositionClick={handleClick}
        />
      )

      const secondPlace = screen.getByText('Avalanche + Flexi Parking').closest('[role="button"]')!
      fireEvent.click(secondPlace)

      expect(handleClick).toHaveBeenCalledWith('avalanche-flexi')
    })

    it('calls onPositionClick for 3rd place with correct id', () => {
      const handleClick = vi.fn()
      render(
        <WinnersPodium
          strategies={mockStrategies}
          onPositionClick={handleClick}
        />
      )

      const thirdPlace = screen.getByText('Snowball + Flexi Parking').closest('[role="button"]')!
      fireEvent.click(thirdPlace)

      expect(handleClick).toHaveBeenCalledWith('snowball-flexi')
    })

    it('supports keyboard navigation - Enter key', () => {
      const handleClick = vi.fn()
      render(
        <WinnersPodium
          strategies={mockStrategies}
          onPositionClick={handleClick}
        />
      )

      const firstPlace = screen.getByText('Velocity Banking').closest('[role="button"]')!
      fireEvent.keyDown(firstPlace, { key: 'Enter' })

      expect(handleClick).toHaveBeenCalledWith('velocity')
    })

    it('supports keyboard navigation - Space key', () => {
      const handleClick = vi.fn()
      render(
        <WinnersPodium
          strategies={mockStrategies}
          onPositionClick={handleClick}
        />
      )

      const firstPlace = screen.getByText('Velocity Banking').closest('[role="button"]')!
      fireEvent.keyDown(firstPlace, { key: ' ' })

      expect(handleClick).toHaveBeenCalledWith('velocity')
    })

    it('positions are focusable (have tabIndex)', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const buttons = screen.getAllByRole('button')
      buttons.forEach(button => {
        expect(button).toHaveAttribute('tabIndex', '0')
      })
    })
  })

  describe('medal colors - AC-5.1.6', () => {
    it('applies gold color (#FFD700) to 1st place badge', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const goldBadge = container.querySelector('[class*="bg-[#FFD700]"]')
      expect(goldBadge).toBeInTheDocument()
    })

    it('applies silver color (#C0C0C0) to 2nd place badge', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const silverBadge = container.querySelector('[class*="bg-[#C0C0C0]"]')
      expect(silverBadge).toBeInTheDocument()
    })

    it('applies bronze color (#CD7F32) to 3rd place badge', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const bronzeBadge = container.querySelector('[class*="bg-[#CD7F32]"]')
      expect(bronzeBadge).toBeInTheDocument()
    })

    it('applies teal border to 1st place card', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const tealBorder = container.querySelector('[class*="border-teal-600"]')
      expect(tealBorder).toBeInTheDocument()
    })
  })

  describe('edge cases - fewer than 3 strategies - AC-5.1.7', () => {
    it('renders only 2 positions when 2 strategies provided', () => {
      const twoStrategies = mockStrategies.slice(0, 2)
      render(<WinnersPodium strategies={twoStrategies} />)

      expect(screen.getByText('Velocity Banking')).toBeInTheDocument()
      expect(screen.getByText('Avalanche + Flexi Parking')).toBeInTheDocument()
      expect(screen.queryByText('Snowball + Flexi Parking')).not.toBeInTheDocument()

      // Should only have 2 rank badges
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.queryByText('3')).not.toBeInTheDocument()
    })

    it('renders only 1 position when 1 strategy provided', () => {
      const oneStrategy = mockStrategies.slice(0, 1)
      render(<WinnersPodium strategies={oneStrategy} />)

      expect(screen.getByText('Velocity Banking')).toBeInTheDocument()
      expect(screen.queryByText('Avalanche + Flexi Parking')).not.toBeInTheDocument()

      // Should only have 1 rank badge
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.queryByText('2')).not.toBeInTheDocument()
    })

    it('returns null when no strategies provided', () => {
      const { container } = render(<WinnersPodium strategies={[]} />)

      // Should render nothing
      expect(container.firstChild).toBeNull()
    })

    it('maintains layout integrity with 2 strategies (no broken positions)', () => {
      const twoStrategies = mockStrategies.slice(0, 2)
      render(<WinnersPodium strategies={twoStrategies} />)

      // Both positions should be rendered properly
      const buttons = screen.getAllByRole('button')
      expect(buttons).toHaveLength(2)

      // Each should have proper aria-label
      expect(buttons[0]).toHaveAttribute('aria-label', expect.stringContaining('place'))
      expect(buttons[1]).toHaveAttribute('aria-label', expect.stringContaining('place'))
    })
  })

  describe('responsive layout - AC-5.1.8', () => {
    it('has flex container for responsive layout', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const flexContainer = container.querySelector('[class*="flex"]')
      expect(flexContainer).toBeInTheDocument()
    })

    it('uses lg:flex-row for desktop horizontal layout', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const flexContainer = container.querySelector('[class*="lg:flex-row"]')
      expect(flexContainer).toBeInTheDocument()
    })

    it('uses flex-col for mobile vertical layout', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const flexContainer = container.querySelector('[class*="flex-col"]')
      expect(flexContainer).toBeInTheDocument()
    })

    it('orders 1st place first on mobile (order-1)', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const firstPlaceContainer = container.querySelector('[class*="order-1"]')
      expect(firstPlaceContainer).toBeInTheDocument()
    })
  })

  describe('entrance animation - AC-5.1.9', () => {
    it('applies animate-in class for entrance animation', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const animatedElements = container.querySelectorAll('[class*="animate-in"]')
      expect(animatedElements.length).toBeGreaterThanOrEqual(1)
    })

    it('applies fade-in class for entrance animation', () => {
      const { container } = render(<WinnersPodium strategies={mockStrategies} />)

      const fadeElements = container.querySelectorAll('[class*="fade-in"]')
      expect(fadeElements.length).toBeGreaterThanOrEqual(1)
    })

    it('staggers animation with delay for each position', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      // Get buttons by their strategy name to check delays
      // DOM order is [2nd, 1st, 3rd] due to CSS flex ordering
      const firstPlaceCard = screen.getByText('Velocity Banking').closest('[role="button"]')!
      const secondPlaceCard = screen.getByText('Avalanche + Flexi Parking').closest('[role="button"]')!
      const thirdPlaceCard = screen.getByText('Snowball + Flexi Parking').closest('[role="button"]')!

      // 1st place has 0ms delay, 2nd has 100ms, 3rd has 200ms
      expect((firstPlaceCard as HTMLElement).style.animationDelay).toBe('0ms')
      expect((secondPlaceCard as HTMLElement).style.animationDelay).toBe('100ms')
      expect((thirdPlaceCard as HTMLElement).style.animationDelay).toBe('200ms')
    })
  })

  describe('loading state - AC-5.1.10', () => {
    it('displays skeleton loading state when isLoading is true', () => {
      const { container } = render(
        <WinnersPodium strategies={mockStrategies} isLoading={true} />
      )

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBeGreaterThan(0)
    })

    it('does NOT display strategy content when isLoading is true', () => {
      render(<WinnersPodium strategies={mockStrategies} isLoading={true} />)

      expect(screen.queryByText('Velocity Banking')).not.toBeInTheDocument()
    })

    it('has aria-busy=true when loading', () => {
      render(<WinnersPodium strategies={mockStrategies} isLoading={true} />)

      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-busy', 'true')
    })

    it('displays strategy content when isLoading is false', () => {
      render(<WinnersPodium strategies={mockStrategies} isLoading={false} />)

      expect(screen.getByText('Velocity Banking')).toBeInTheDocument()
    })

    it('displays 3 skeleton placeholders matching podium layout', () => {
      const { container } = render(
        <WinnersPodium strategies={mockStrategies} isLoading={true} />
      )

      const skeletons = container.querySelectorAll('[class*="animate-pulse"]')
      expect(skeletons.length).toBe(3)
    })
  })

  describe('accessibility', () => {
    it('each position has descriptive aria-label', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const firstPlace = screen.getByText('Velocity Banking').closest('[role="button"]')
      expect(firstPlace).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Velocity Banking')
      )
      expect(firstPlace).toHaveAttribute(
        'aria-label',
        expect.stringContaining('1st place')
      )
      expect(firstPlace).toHaveAttribute(
        'aria-label',
        expect.stringContaining('Saves')
      )
    })

    it('positions have role="button" for screen readers', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const buttons = screen.getAllByRole('button')
      expect(buttons.length).toBe(3)
    })

    it('section has appropriate aria-label', () => {
      render(<WinnersPodium strategies={mockStrategies} />)

      const section = screen.getByRole('region')
      expect(section).toHaveAttribute('aria-label', expect.stringContaining('Top Strategies'))
    })
  })
})
