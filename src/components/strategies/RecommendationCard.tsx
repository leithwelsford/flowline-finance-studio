import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trophy, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { formatCurrency } from '@/lib/format/currency';
import { formatDate } from '@/lib/format/date';
import { calculateRecommendation } from '@/lib/calculations/recommendation';
import { useUIStore } from '@/store/uiStore';
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types';

/**
 * Props for RecommendationCard component
 */
export interface RecommendationCardProps {
  /** Array of calculated strategy projections */
  strategies: StrategyProjection[];
  /** Baseline strategy projection for comparison */
  baseline: StrategyProjection | null;
  /** Whether the user has a flexi facility configured */
  hasFlexiFacility: boolean;
  /** Show loading skeleton while calculating */
  isLoading?: boolean;
  /** Optional callback when strategy is selected (defaults to uiStore update) */
  onSelectStrategy?: (strategyId: string) => void;
}

/**
 * Effort badge colors matching ComparisonTable pattern
 */
const EFFORT_COLORS: Record<EffortLevel, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  high: 'bg-red-100 text-red-800 border-red-300',
};

/**
 * Effort badge labels
 */
const EFFORT_LABELS: Record<EffortLevel, string> = {
  low: 'Low Effort',
  medium: 'Medium Effort',
  high: 'High Effort',
};

/**
 * Effort level badge component
 * @see AC-5.5.5
 */
function EffortBadge({ level }: { level: EffortLevel }) {
  return (
    <Badge variant="outline" className={cn('capitalize', EFFORT_COLORS[level])}>
      {EFFORT_LABELS[level]}
    </Badge>
  );
}

/**
 * Loading skeleton for recommendation card
 * @see AC-5.5.7
 */
function RecommendationSkeleton() {
  return (
    <Card
      className="border-l-4 border-teal-600 bg-teal-50/50"
      aria-label="Loading recommendation"
      aria-busy="true"
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-48" />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-7 w-56" />
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-6 w-28" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-24" />
          </div>
        </div>
        <Skeleton className="h-5 w-72" />
        <Skeleton className="h-10 w-40" />
      </CardContent>
    </Card>
  );
}

/**
 * Empty state when no strategies are calculated
 * @see AC-5.5.8
 */
function EmptyState({ onCalculate }: { onCalculate?: () => void }) {
  return (
    <Card className="border-dashed border-2 border-muted-foreground/25 bg-muted/5">
      <CardContent className="flex flex-col items-center justify-center py-8 text-center">
        <Calculator className="h-12 w-12 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No Recommendation Yet
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Calculate strategies to see our recommendation
        </p>
        {onCalculate && (
          <Button onClick={onCalculate} variant="default">
            Calculate Now
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Recommendation Card Component
 *
 * Displays the algorithm's recommended debt payoff strategy with a prominent
 * teal accent card. Shows key metrics and rationale for the recommendation.
 *
 * Features:
 * - Scores strategies based on interest savings, effort, and risk (AC-5.5.1, AC-5.5.2)
 * - Applies effort penalties (AC-5.5.3) and risk penalties (AC-5.5.4)
 * - Displays as highlighted card with "Recommended for You" header (AC-5.5.5)
 * - Filters flexi strategies when no facility (AC-5.5.6)
 * - Shows skeleton loading state (AC-5.5.7)
 * - Shows empty state when no strategies (AC-5.5.8)
 * - Teal accent styling positioned at top of Compare page (AC-5.5.9)
 *
 * @example
 * ```tsx
 * <RecommendationCard
 *   strategies={strategies}
 *   baseline={baseline}
 *   hasFlexiFacility={!!facility}
 *   isLoading={isCalculating}
 * />
 * ```
 */
export function RecommendationCard({
  strategies,
  baseline,
  hasFlexiFacility,
  isLoading = false,
  onSelectStrategy,
}: RecommendationCardProps) {
  const setSelectedStrategy = useUIStore((state) => state.setSelectedStrategy);

  // Calculate recommendation using memoization
  const recommendation = useMemo(() => {
    if (strategies.length === 0) {
      return null;
    }
    return calculateRecommendation(strategies, baseline, hasFlexiFacility);
  }, [strategies, baseline, hasFlexiFacility]);

  // Handle strategy selection
  const handleSelectStrategy = () => {
    if (!recommendation) return;

    const strategyId = recommendation.recommendedStrategyId;

    // Call custom handler if provided, otherwise use uiStore
    if (onSelectStrategy) {
      onSelectStrategy(strategyId);
    } else {
      setSelectedStrategy(strategyId);
    }

    // Show success toast
    toast.success(`Strategy selected: ${recommendation.recommendedStrategy.strategyName}`);
  };

  // Show skeleton while loading (AC-5.5.7)
  if (isLoading) {
    return <RecommendationSkeleton />;
  }

  // Show empty state if no strategies calculated (AC-5.5.8)
  if (strategies.length === 0 || !recommendation) {
    return <EmptyState />;
  }

  const { recommendedStrategy, rationale } = recommendation;

  return (
    <Card
      className="border-l-4 border-teal-600 bg-teal-50 animate-in fade-in duration-300"
      role="region"
      aria-label="Strategy Recommendation"
    >
      {/* Header with Trophy icon (AC-5.5.5) */}
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-teal-800">
          <Trophy className="h-5 w-5 text-teal-600" aria-hidden="true" />
          Recommended for You
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Strategy name (AC-5.5.5) */}
        <h3 className="text-xl font-semibold text-teal-900">
          {recommendedStrategy.strategyName}
        </h3>

        {/* Key metrics grid (AC-5.5.5) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Interest Saved */}
          <div>
            <p className="text-xs text-teal-700 font-medium uppercase tracking-wide">
              Interest Saved
            </p>
            <p className="text-lg font-bold text-green-600">
              {formatCurrency(recommendedStrategy.interestSaved.toString())}
            </p>
          </div>

          {/* Debt-Free Date */}
          <div>
            <p className="text-xs text-teal-700 font-medium uppercase tracking-wide">
              Debt-Free Date
            </p>
            <p className="text-lg font-bold text-teal-900">
              {formatDate(new Date(recommendedStrategy.debtFreeDate))}
            </p>
          </div>

          {/* Effort Level */}
          <div>
            <p className="text-xs text-teal-700 font-medium uppercase tracking-wide mb-1">
              Effort Level
            </p>
            <EffortBadge level={recommendedStrategy.effortLevel} />
          </div>
        </div>

        {/* Rationale (AC-5.5.5) */}
        <p className="text-sm text-teal-700 italic">"{rationale}"</p>

        {/* Select button */}
        <Button
          onClick={handleSelectStrategy}
          className="bg-teal-600 hover:bg-teal-700 text-white"
        >
          Select This Strategy
        </Button>
      </CardContent>
    </Card>
  );
}
