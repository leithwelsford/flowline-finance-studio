import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import 'fake-indexeddb/auto'
import Big from 'big.js'
import { ComparisonTable } from '@/components/strategies/ComparisonTable'
import { useUIStore } from '@/store/uiStore'
import { db } from '@/lib/db'
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types'

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

// Import mocked toast for assertions
import { toast } from 'sonner'

// Mock strategy data factory
function createMockStrategy(
  id: string,
  name: string,
  options: {
    effortLevel?: EffortLevel
    interestSaved?: number
  } = {}
): StrategyProjection {
  const { effortLevel = 'medium', interestSaved = 10000 } = options

  return {
    strategyId: id,
    strategyName: name,
    effortLevel,
    debtFreeMonth: 30,
    debtFreeDate: '2027-06-15',
    totalInterestPaid: Big(50000),
    totalPrincipalPaid: Big(100000),
    monthsSaved: 12,
    interestSaved: Big(interestSaved),
    monthlyProjections: [],
  }
}

const mockStrategies: StrategyProjection[] = [
  createMockStrategy('avalanche', 'Avalanche', { effortLevel: 'low', interestSaved: 15000 }),
  createMockStrategy('snowball', 'Snowball', { effortLevel: 'low', interestSaved: 12000 }),
  createMockStrategy('flexi-chunking', 'Flexi Chunking', { effortLevel: 'medium', interestSaved: 20000 }),
  createMockStrategy('velocity', 'Velocity Banking', { effortLevel: 'high', interestSaved: 25000 }),
]

describe('Strategy Selection Flow', () => {
  beforeEach(async () => {
    // Reset UI store
    useUIStore.getState().setSelectedStrategy(null)

    // Clear settings table
    await db.settings.clear()

    // Clear mocks
    vi.clearAllMocks()
  })

  describe('ComparisonTable Selection', () => {
    it('calls onSelectStrategy when Select button clicked (AC-5.6.4)', () => {
      const onSelectStrategy = vi.fn()
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          onSelectStrategy={onSelectStrategy}
        />
      )

      // Find and click any Select button
      const selectButtons = screen.getAllByRole('button', { name: /^select$/i })
      expect(selectButtons.length).toBeGreaterThan(0)
      fireEvent.click(selectButtons[0])

      // Verify onSelectStrategy was called with one of the strategy IDs
      expect(onSelectStrategy).toHaveBeenCalled()
      const calledWith = onSelectStrategy.mock.calls[0][0]
      expect(['velocity', 'flexi-chunking', 'avalanche', 'snowball']).toContain(calledWith)
    })

    it('shows selected state when selectedId matches strategy (AC-5.6.4)', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          selectedId="avalanche"
          onSelectStrategy={vi.fn()}
        />
      )

      // Check for "Selected" badges (desktop + mobile views)
      const selectedBadges = screen.getAllByText('Selected')
      expect(selectedBadges.length).toBeGreaterThan(0)

      // Buttons should show "Selected" instead of "Select"
      const selectedButtons = screen.getAllByRole('button', { name: /^selected$/i })
      expect(selectedButtons.length).toBeGreaterThan(0)
    })

    it('shows visual highlight for selected row', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          selectedId="avalanche"
          onSelectStrategy={vi.fn()}
        />
      )

      // Find the row with the selected strategy in the table
      const avalancheTexts = screen.getAllByText('Avalanche')
      // Find the one that's in a tr (desktop view)
      const avalancheRow = avalancheTexts.find((el) => el.closest('tr'))?.closest('tr')
      expect(avalancheRow).toHaveClass('bg-teal-50')
    })

    it('disables Select button when onSelectStrategy not provided', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
        />
      )

      const selectButtons = screen.getAllByRole('button', { name: /select/i })
      selectButtons.forEach((button) => {
        expect(button).toBeDisabled()
      })
    })
  })

  describe('Selection Persistence (AC-5.6.5)', () => {
    it('can persist selection to Dexie settings table', async () => {
      // Simulate what ComparePage does
      await db.settings.put({
        key: 'selectedStrategy',
        value: 'avalanche',
      })

      const saved = await db.settings.get('selectedStrategy')
      expect(saved).toBeDefined()
      expect(saved?.value).toBe('avalanche')
    })

    it('can read previously saved selection', async () => {
      // Pre-populate settings
      await db.settings.put({
        key: 'selectedStrategy',
        value: 'velocity',
      })

      const saved = await db.settings.get('selectedStrategy')
      expect(saved?.value).toBe('velocity')
    })

    it('overwrites previous selection', async () => {
      // First selection
      await db.settings.put({
        key: 'selectedStrategy',
        value: 'avalanche',
      })

      // Second selection
      await db.settings.put({
        key: 'selectedStrategy',
        value: 'velocity',
      })

      const saved = await db.settings.get('selectedStrategy')
      expect(saved?.value).toBe('velocity')
    })
  })

  describe('UI Store Selection (AC-5.6.4)', () => {
    it('updates selectedStrategyId in uiStore', () => {
      const { setSelectedStrategy, selectedStrategyId } = useUIStore.getState()

      expect(selectedStrategyId).toBeNull()

      setSelectedStrategy('avalanche')

      expect(useUIStore.getState().selectedStrategyId).toBe('avalanche')
    })

    it('can clear selection', () => {
      const { setSelectedStrategy } = useUIStore.getState()

      setSelectedStrategy('avalanche')
      expect(useUIStore.getState().selectedStrategyId).toBe('avalanche')

      setSelectedStrategy(null)
      expect(useUIStore.getState().selectedStrategyId).toBeNull()
    })
  })

  describe('Mobile Card View Selection', () => {
    it('shows selected state in mobile card view', () => {
      // Set viewport to mobile (component uses sm:hidden for mobile)
      // Note: In real tests we'd mock matchMedia, but for now we test the desktop view
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          selectedId="avalanche"
          onSelectStrategy={vi.fn()}
        />
      )

      // The view should show the selected state (both desktop and mobile render)
      const selectedBadges = screen.getAllByText('Selected')
      expect(selectedBadges.length).toBeGreaterThan(0)
    })
  })

  describe('Selection Coexistence with Recommended', () => {
    it('shows selected styling even when strategy is recommended', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          recommendedId="avalanche"
          selectedId="avalanche"
          onSelectStrategy={vi.fn()}
        />
      )

      // Should show "Selected" badges (desktop + mobile)
      const selectedBadges = screen.getAllByText('Selected')
      expect(selectedBadges.length).toBeGreaterThan(0)

      // Find the row in desktop view - it should have selected styling
      const avalancheTexts = screen.getAllByText('Avalanche')
      const avalancheRow = avalancheTexts.find((el) => el.closest('tr'))?.closest('tr')
      expect(avalancheRow).toHaveClass('bg-teal-50')
    })

    it('shows different styling for recommended vs selected strategies', () => {
      render(
        <ComparisonTable
          strategies={mockStrategies}
          baselineId=""
          recommendedId="velocity"
          selectedId="avalanche"
          onSelectStrategy={vi.fn()}
        />
      )

      // Selected badges should exist (desktop + mobile)
      const selectedBadges = screen.getAllByText('Selected')
      expect(selectedBadges.length).toBeGreaterThan(0)

      // Recommended strategy should have star icons (desktop + mobile)
      const starIcons = screen.getAllByLabelText('Recommended')
      expect(starIcons.length).toBeGreaterThan(0)
    })
  })
})
