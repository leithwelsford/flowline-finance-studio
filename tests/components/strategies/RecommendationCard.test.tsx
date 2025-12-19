import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecommendationCard } from '@/components/strategies/RecommendationCard';
import type { StrategyProjection } from '@/lib/calculations/types';
import Big from 'big.js';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock uiStore
const mockSetSelectedStrategy = vi.fn();
vi.mock('@/store/uiStore', () => ({
  useUIStore: vi.fn((selector) => {
    const state = {
      selectedStrategyId: null,
      setSelectedStrategy: mockSetSelectedStrategy,
    };
    return selector(state);
  }),
}));

// Mock strategy data factory
function createMockStrategy(
  id: string,
  name: string,
  interestSaved: number,
  effortLevel: 'low' | 'medium' | 'high' = 'medium',
  debtFreeDate: string = '2027-06-15'
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel,
    debtFreeMonth: 30,
    debtFreeDate,
    totalInterestPaid: Big(50000),
    totalPrincipalPaid: Big(100000),
    monthsSaved: 12,
    interestSaved: Big(interestSaved),
    monthlyProjections: [],
  };
}

// Mock strategies array
const mockStrategies: StrategyProjection[] = [
  createMockStrategy('avalanche', 'Avalanche', 45000, 'low', '2026-12-01'),
  createMockStrategy('snowball', 'Snowball', 38000, 'low', '2027-03-15'),
  createMockStrategy('velocity-banking', 'Velocity Banking', 50000, 'high', '2026-06-20'),
];

const mockBaseline = createMockStrategy('baseline', 'Baseline', 0, 'low', '2028-12-01');

describe('RecommendationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering - AC-5.5.5', () => {
    it('renders "Recommended for You" header', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });

    it('displays strategy name prominently', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Avalanche should win: 45000 - 0 - 0 = 45000
      // Velocity: 50000 - 5000 - 1000 = 44000
      // Snowball: 38000 - 0 - 0 = 38000
      expect(screen.getByText('Avalanche')).toBeInTheDocument();
    });

    it('displays interest saved in ZAR format', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // ZAR format: R 45 000,00
      expect(screen.getByText(/R\s*45\s*000/)).toBeInTheDocument();
    });

    it('displays debt-free date in SA DD/MM/YYYY format', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Avalanche date: 01/12/2026
      expect(screen.getByText('01/12/2026')).toBeInTheDocument();
    });

    it('displays rationale text', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText(/Saves R45,000 vs baseline with low effort/)).toBeInTheDocument();
    });

    it('has Trophy icon in header', () => {
      const { container } = render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Trophy icon from lucide-react has specific SVG class
      const trophyIcon = container.querySelector('svg');
      expect(trophyIcon).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByRole('region', { name: /strategy recommendation/i })).toBeInTheDocument();
    });
  });

  describe('effort level badge - AC-5.5.5', () => {
    it('displays Low Effort badge for low effort strategies', () => {
      const lowEffortStrategies = [
        createMockStrategy('avalanche', 'Avalanche', 45000, 'low'),
      ];

      render(
        <RecommendationCard
          strategies={lowEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Low Effort')).toBeInTheDocument();
    });

    it('displays Medium Effort badge for medium effort strategies', () => {
      const mediumEffortStrategies = [
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 45000, 'medium'),
      ];

      render(
        <RecommendationCard
          strategies={mediumEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Medium Effort')).toBeInTheDocument();
    });

    it('displays High Effort badge for high effort strategies', () => {
      const highEffortStrategies = [
        createMockStrategy('velocity-banking', 'Velocity Banking', 60000, 'high'),
      ];

      render(
        <RecommendationCard
          strategies={highEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('High Effort')).toBeInTheDocument();
    });

    it('applies green color to Low Effort badge', () => {
      const lowEffortStrategies = [
        createMockStrategy('avalanche', 'Avalanche', 45000, 'low'),
      ];

      const { container } = render(
        <RecommendationCard
          strategies={lowEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const badge = container.querySelector('[class*="bg-green-100"]');
      expect(badge).toBeInTheDocument();
    });

    it('applies amber color to Medium Effort badge', () => {
      const mediumEffortStrategies = [
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 45000, 'medium'),
      ];

      const { container } = render(
        <RecommendationCard
          strategies={mediumEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const badge = container.querySelector('[class*="bg-amber-100"]');
      expect(badge).toBeInTheDocument();
    });

    it('applies red color to High Effort badge', () => {
      const highEffortStrategies = [
        createMockStrategy('velocity-banking', 'Velocity Banking', 60000, 'high'),
      ];

      const { container } = render(
        <RecommendationCard
          strategies={highEffortStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const badge = container.querySelector('[class*="bg-red-100"]');
      expect(badge).toBeInTheDocument();
    });
  });

  describe('teal accent styling - AC-5.5.9', () => {
    it('has teal border-left accent', () => {
      const { container } = render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const card = container.querySelector('[class*="border-teal-600"]');
      expect(card).toBeInTheDocument();
    });

    it('has teal background', () => {
      const { container } = render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const card = container.querySelector('[class*="bg-teal-50"]');
      expect(card).toBeInTheDocument();
    });

    it('has animate-in fade-in for entrance animation', () => {
      const { container } = render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const animatedElement = container.querySelector('[class*="animate-in"]');
      expect(animatedElement).toBeInTheDocument();
    });
  });

  describe('loading skeleton state - AC-5.5.7', () => {
    it('displays skeleton when isLoading is true', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
          isLoading={true}
        />
      );

      expect(screen.getByLabelText('Loading recommendation')).toBeInTheDocument();
    });

    it('has aria-busy=true when loading', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
          isLoading={true}
        />
      );

      const loadingElement = screen.getByLabelText('Loading recommendation');
      expect(loadingElement).toHaveAttribute('aria-busy', 'true');
    });

    it('does NOT display strategy content when loading', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
          isLoading={true}
        />
      );

      expect(screen.queryByText('Recommended for You')).not.toBeInTheDocument();
      expect(screen.queryByText('Avalanche')).not.toBeInTheDocument();
    });

    it('displays strategy content when isLoading is false', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
          isLoading={false}
        />
      );

      expect(screen.getByText('Recommended for You')).toBeInTheDocument();
    });
  });

  describe('empty state - AC-5.5.8', () => {
    it('displays empty state when no strategies provided', () => {
      render(
        <RecommendationCard
          strategies={[]}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('No Recommendation Yet')).toBeInTheDocument();
    });

    it('displays prompt to calculate strategies', () => {
      render(
        <RecommendationCard
          strategies={[]}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Calculate strategies to see our recommendation')).toBeInTheDocument();
    });

    it('has Calculator icon in empty state', () => {
      const { container } = render(
        <RecommendationCard
          strategies={[]}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Should have a calculator SVG icon
      const icon = container.querySelector('svg');
      expect(icon).toBeInTheDocument();
    });

    it('does NOT display recommendation header in empty state', () => {
      render(
        <RecommendationCard
          strategies={[]}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.queryByText('Recommended for You')).not.toBeInTheDocument();
    });
  });

  describe('flexi facility filtering - AC-5.5.6', () => {
    it('excludes flexi strategies when hasFlexiFacility is false', () => {
      const mixedStrategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
        createMockStrategy('velocity-banking', 'Velocity Banking', 50000, 'high'),
      ];

      render(
        <RecommendationCard
          strategies={mixedStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={false}
        />
      );

      // Snowball should be recommended (velocity-banking is filtered out)
      expect(screen.getByText('Snowball')).toBeInTheDocument();
      expect(screen.queryByText('Velocity Banking')).not.toBeInTheDocument();
    });

    it('includes flexi strategies when hasFlexiFacility is true', () => {
      const highSavingsFlexiStrategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 30000, 'medium'),
      ];

      render(
        <RecommendationCard
          strategies={highSavingsFlexiStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Flexi Chunking: 30000 - 2000 - 1000 = 27000
      // Snowball: 10000 - 0 - 0 = 10000
      expect(screen.getByText('Flexi Chunking')).toBeInTheDocument();
    });

    it('shows empty state when all strategies are filtered (no flexi and only flexi strategies)', () => {
      const flexiOnlyStrategies = [
        createMockStrategy('velocity-banking', 'Velocity Banking', 50000, 'high'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 40000, 'medium'),
      ];

      render(
        <RecommendationCard
          strategies={flexiOnlyStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={false}
        />
      );

      expect(screen.getByText('No Recommendation Yet')).toBeInTheDocument();
    });
  });

  describe('strategy selection - select button', () => {
    it('displays "Select This Strategy" button', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByRole('button', { name: /select this strategy/i })).toBeInTheDocument();
    });

    it('calls setSelectedStrategy from uiStore when button clicked', async () => {
      const { toast } = await import('sonner');

      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const button = screen.getByRole('button', { name: /select this strategy/i });
      fireEvent.click(button);

      expect(mockSetSelectedStrategy).toHaveBeenCalledWith('avalanche');
    });

    it('shows success toast when strategy selected', async () => {
      const { toast } = await import('sonner');

      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const button = screen.getByRole('button', { name: /select this strategy/i });
      fireEvent.click(button);

      expect(toast.success).toHaveBeenCalledWith('Strategy selected: Avalanche');
    });

    it('calls custom onSelectStrategy callback if provided', () => {
      const customHandler = vi.fn();

      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
          onSelectStrategy={customHandler}
        />
      );

      const button = screen.getByRole('button', { name: /select this strategy/i });
      fireEvent.click(button);

      expect(customHandler).toHaveBeenCalledWith('avalanche');
      // Should NOT call uiStore when custom handler provided
      expect(mockSetSelectedStrategy).not.toHaveBeenCalled();
    });

    it('button has teal styling', () => {
      const { container } = render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      const button = container.querySelector('[class*="bg-teal-600"]');
      expect(button).toBeInTheDocument();
    });
  });

  describe('recommendation algorithm integration', () => {
    it('selects highest-scoring strategy based on formula', () => {
      // Avalanche: 45000 - 0 - 0 = 45000 (winner)
      // Velocity: 50000 - 5000 - 1000 = 44000
      // Snowball: 38000 - 0 - 0 = 38000

      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Avalanche')).toBeInTheDocument();
    });

    it('applies effort penalties correctly', () => {
      const sameInterestDifferentEffort = [
        createMockStrategy('simple-strategy', 'Simple Strategy', 15000, 'low'),
        createMockStrategy('complex-strategy', 'Complex Strategy', 15000, 'high'),
      ];

      render(
        <RecommendationCard
          strategies={sameInterestDifferentEffort}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Low effort: 15000 - 0 = 15000 (wins)
      // High effort: 15000 - 5000 = 10000
      // Simple Strategy should be recommended (low effort wins)
      expect(screen.getByText('Simple Strategy')).toBeInTheDocument();
    });

    it('applies risk penalties for flexi strategies', () => {
      const sameInterestFlexiVsNon = [
        createMockStrategy('avalanche', 'Avalanche', 12000, 'low'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 12000, 'low'),
      ];
      // Override flexi to low effort for fair comparison
      sameInterestFlexiVsNon[1].effortLevel = 'low';

      render(
        <RecommendationCard
          strategies={sameInterestFlexiVsNon}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      // Avalanche: 12000 - 0 - 0 = 12000
      // Flexi: 12000 - 0 - 1000 = 11000
      expect(screen.getByText('Avalanche')).toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('handles null baseline gracefully', () => {
      render(
        <RecommendationCard
          strategies={mockStrategies}
          baseline={null}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Avalanche')).toBeInTheDocument();
    });

    it('handles single strategy', () => {
      const singleStrategy = [createMockStrategy('avalanche', 'Avalanche', 45000, 'low')];

      render(
        <RecommendationCard
          strategies={singleStrategy}
          baseline={mockBaseline}
          hasFlexiFacility={true}
        />
      );

      expect(screen.getByText('Avalanche')).toBeInTheDocument();
    });
  });
});
