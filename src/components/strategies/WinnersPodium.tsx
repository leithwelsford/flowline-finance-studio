import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format/currency'
import { formatDate } from '@/lib/format/date'
import type { StrategyProjection } from '@/lib/calculations/types'
import { Trophy } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for WinnersPodium component
 */
export interface WinnersPodiumProps {
  /** Array of calculated strategy projections (assumed sorted by interestSaved descending) */
  strategies: StrategyProjection[]
  /** Strategy ID to mark as "Recommended" (shown on 1st place only) */
  recommendedId?: string
  /** Callback when a podium position is clicked */
  onPositionClick?: (strategyId: string) => void
  /** Show loading skeleton while calculating */
  isLoading?: boolean
}

/**
 * Medal colors for podium positions (gold/silver/bronze)
 */
const MEDAL_COLORS = {
  1: { bg: 'bg-[#FFD700]', text: 'text-amber-900', border: 'border-[#FFD700]' },
  2: { bg: 'bg-[#C0C0C0]', text: 'text-slate-700', border: 'border-[#C0C0C0]' },
  3: { bg: 'bg-[#CD7F32]', text: 'text-orange-900', border: 'border-[#CD7F32]' },
} as const

/**
 * Height classes for podium positions (1st tallest, 3rd shortest)
 */
const POSITION_HEIGHTS = {
  1: 'min-h-[220px]',
  2: 'min-h-[180px]',
  3: 'min-h-[150px]',
} as const

/**
 * Individual podium position component
 */
interface PodiumPositionProps {
  strategy: StrategyProjection
  rank: 1 | 2 | 3
  isRecommended: boolean
  onClick?: () => void
  animationDelay?: string
}

function PodiumPosition({
  strategy,
  rank,
  isRecommended,
  onClick,
  animationDelay = '0ms',
}: PodiumPositionProps) {
  const colors = MEDAL_COLORS[rank]
  const heightClass = POSITION_HEIGHTS[rank]

  const handleClick = () => {
    onClick?.()
  }

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.()
    }
  }

  return (
    <Card
      className={cn(
        'relative cursor-pointer transition-all hover:scale-105 hover:shadow-lg',
        'animate-in fade-in duration-500',
        heightClass,
        rank === 1 && 'border-2 border-teal-600 shadow-md',
        'flex flex-col'
      )}
      style={{ animationDelay }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={`${strategy.strategyName}, ranked ${rank}${rank === 1 ? 'st' : rank === 2 ? 'nd' : 'rd'} place. Saves ${formatCurrency(strategy.interestSaved.toString())} in interest. Click to see details.`}
    >
      {/* Rank badge */}
      <div
        className={cn(
          'absolute -top-3 left-1/2 -translate-x-1/2',
          'flex items-center justify-center',
          'w-10 h-10 rounded-full',
          colors.bg,
          colors.text,
          'font-bold text-lg shadow-md'
        )}
        aria-hidden="true"
      >
        {rank}
      </div>

      <CardHeader className="pt-8 pb-2 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          {rank === 1 && (
            <Trophy
              className="w-5 h-5 text-teal-600"
              aria-hidden="true"
            />
          )}
          <h3 className="font-semibold text-lg truncate">{strategy.strategyName}</h3>
        </div>
        {isRecommended && rank === 1 && (
          <Badge className="bg-teal-600 hover:bg-teal-700 text-white mx-auto">
            Recommended
          </Badge>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col justify-end pb-4">
        <div className="space-y-2 text-center">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Interest Saved
            </p>
            <p className="text-xl font-bold text-green-600">
              {formatCurrency(strategy.interestSaved.toString())}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              Debt-Free Date
            </p>
            <p className="text-sm font-medium">
              {formatDate(new Date(strategy.debtFreeDate))}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Loading skeleton for podium
 */
function PodiumSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row items-end justify-center gap-4 py-8">
      {/* 2nd place skeleton (left on desktop) */}
      <div className="order-2 lg:order-1 w-full lg:w-48">
        <Skeleton className="h-[180px] w-full rounded-lg" />
      </div>
      {/* 1st place skeleton (center on desktop) */}
      <div className="order-1 lg:order-2 w-full lg:w-56">
        <Skeleton className="h-[220px] w-full rounded-lg" />
      </div>
      {/* 3rd place skeleton (right on desktop) */}
      <div className="order-3 w-full lg:w-44">
        <Skeleton className="h-[150px] w-full rounded-lg" />
      </div>
    </div>
  )
}

/**
 * Winner's Podium Component
 *
 * Displays top 3 debt payoff strategies in an Olympic-style podium layout.
 * Shows strategy name, interest saved, and debt-free date for each position.
 *
 * @example
 * ```tsx
 * <WinnersPodium
 *   strategies={strategies}
 *   recommendedId={bestStrategy?.strategyId}
 *   onPositionClick={(id) => scrollToStrategy(id)}
 *   isLoading={isCalculating}
 * />
 * ```
 */
export function WinnersPodium({
  strategies,
  recommendedId,
  onPositionClick,
  isLoading = false,
}: WinnersPodiumProps) {
  // Show skeleton while loading
  if (isLoading) {
    return (
      <section aria-label="Winner's Podium Loading" aria-busy="true">
        <PodiumSkeleton />
      </section>
    )
  }

  // Take top 3 strategies (already sorted by interestSaved descending)
  const topStrategies = strategies.slice(0, 3)

  // Don't render if no strategies
  if (topStrategies.length === 0) {
    return null
  }

  // Build podium positions based on available strategies
  const first = topStrategies[0]
  const second = topStrategies[1]
  const third = topStrategies[2]

  const handlePositionClick = (strategyId: string) => {
    onPositionClick?.(strategyId)
  }

  return (
    <section
      aria-label="Winner's Podium - Top Strategies"
      className="py-6"
    >
      <h2 className="text-xl font-semibold text-center mb-6">
        Top Strategies
      </h2>

      {/* Desktop: horizontal podium layout (2nd - 1st - 3rd) */}
      {/* Mobile: vertical stack (1st on top) */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-end justify-center gap-4">
        {/* 2nd place - Left on desktop, second on mobile */}
        {second && (
          <div className="order-2 lg:order-1 w-full lg:w-48">
            <PodiumPosition
              strategy={second}
              rank={2}
              isRecommended={second.strategyId === recommendedId}
              onClick={() => handlePositionClick(second.strategyId)}
              animationDelay="100ms"
            />
          </div>
        )}

        {/* 1st place - Center on desktop, first on mobile */}
        <div className="order-1 lg:order-2 w-full lg:w-56">
          <PodiumPosition
            strategy={first}
            rank={1}
            isRecommended={first.strategyId === recommendedId}
            onClick={() => handlePositionClick(first.strategyId)}
            animationDelay="0ms"
          />
        </div>

        {/* 3rd place - Right on desktop, third on mobile */}
        {third && (
          <div className="order-3 w-full lg:w-44">
            <PodiumPosition
              strategy={third}
              rank={3}
              isRecommended={third.strategyId === recommendedId}
              onClick={() => handlePositionClick(third.strategyId)}
              animationDelay="200ms"
            />
          </div>
        )}
      </div>
    </section>
  )
}
