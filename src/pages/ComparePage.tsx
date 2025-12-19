import { useEffect, useRef, useCallback } from 'react'
import { toast } from 'sonner'
import { useStrategies } from '@/hooks/useStrategies'
import { useFlexiFacility } from '@/hooks/useFlexiFacility'
import { useStrategyFilters } from '@/hooks/useStrategyFilters'
import { useUIStore } from '@/store/uiStore'
import { db } from '@/lib/db'
import {
  RecommendationCard,
  WinnersPodium,
  ComparisonTable,
  StrategyFilters,
} from '@/components/strategies'
import { DebtReductionChart, InterestComparisonChart } from '@/components/charts'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FilterX } from 'lucide-react'

export function ComparePage() {
  const {
    strategies,
    baseline,
    bestStrategy,
    isCalculating,
    calculateStrategies,
    isDataLoading,
    emptyMessage,
    error,
  } = useStrategies()

  const { hasExistingFacility } = useFlexiFacility()

  // Filter state and handlers - AC-5.6.1, AC-5.6.2, AC-5.6.3
  const {
    filteredStrategies,
    filters,
    toggleEffortLevel,
    setMinSavings,
    resetFilters,
    hasActiveFilters,
  } = useStrategyFilters(strategies)

  // UI store for selection
  const setSelectedStrategy = useUIStore((state) => state.setSelectedStrategy)
  const selectedStrategyId = useUIStore((state) => state.selectedStrategyId)
  const setCurrentPage = useUIStore((state) => state.setCurrentPage)

  const comparisonTableRef = useRef<HTMLDivElement>(null)

  // Trigger calculation on mount if data is loaded
  useEffect(() => {
    if (!isDataLoading && strategies.length === 0 && !isCalculating) {
      calculateStrategies()
    }
  }, [isDataLoading, strategies.length, isCalculating, calculateStrategies])

  const handlePositionClick = (_strategyId: string) => {
    // Scroll to comparison table
    comparisonTableRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  /**
   * Handle strategy selection - AC-5.6.4, AC-5.6.5, AC-5.6.6, AC-5.6.7
   */
  const handleSelectStrategy = useCallback(
    async (strategyId: string) => {
      // Find strategy name for toast
      const strategy = strategies.find((s) => s.strategyId === strategyId)
      if (!strategy) return

      // Update UI store - AC-5.6.4
      setSelectedStrategy(strategyId)

      // Persist to Dexie - AC-5.6.5
      try {
        await db.settings.put({
          key: 'selectedStrategy',
          value: strategyId,
        })
      } catch (err) {
        console.error('Failed to persist strategy selection:', err)
      }

      // Show success toast with action - AC-5.6.6, AC-5.6.7
      toast.success(`Strategy selected: ${strategy.strategyName}`, {
        action: {
          label: 'View Progress',
          onClick: () => {
            setCurrentPage('track')
          },
        },
      })
    },
    [strategies, setSelectedStrategy, setCurrentPage]
  )

  // Show loading state while data is being fetched
  if (isDataLoading) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Compare</h1>
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">Loading financial data...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Compare</h1>
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    )
  }

  // Show empty state message
  if (emptyMessage && !isCalculating) {
    return (
      <div className="container mx-auto py-6 px-4">
        <h1 className="text-2xl font-bold mb-6">Compare</h1>
        <div className="flex items-center justify-center min-h-[40vh]">
          <p className="text-muted-foreground">{emptyMessage}</p>
        </div>
      </div>
    )
  }

  // Check if filters resulted in empty set - AC-5.6.9
  const showFilterEmptyState =
    !isCalculating && strategies.length > 0 && filteredStrategies.length === 0

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Compare</h1>

      <div className="space-y-8">
        {/* Recommendation Card - AC-5.5.9: positioned at top of Compare page */}
        <RecommendationCard
          strategies={strategies}
          baseline={baseline}
          hasFlexiFacility={hasExistingFacility}
          isLoading={isCalculating}
          onSelectStrategy={handleSelectStrategy}
        />

        {/* Winner's Podium - uses filtered strategies - AC-5.6.3 */}
        <WinnersPodium
          strategies={filteredStrategies}
          recommendedId={bestStrategy?.strategyId}
          onPositionClick={handlePositionClick}
          isLoading={isCalculating}
        />

        {/* Strategy Filters - AC-5.6.1, AC-5.6.2, AC-5.6.8 */}
        {strategies.length > 0 && !isCalculating && (
          <StrategyFilters
            filters={filters}
            onToggleEffortLevel={toggleEffortLevel}
            onSetMinSavings={setMinSavings}
            onResetFilters={resetFilters}
            hasActiveFilters={hasActiveFilters}
          />
        )}

        {/* Empty state when filters result in no matches - AC-5.6.9 */}
        {showFilterEmptyState && (
          <Card className="border-dashed border-2 border-muted-foreground/25">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <FilterX className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No strategies match your filters
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your criteria to see more options.
              </p>
              <Button onClick={resetFilters} variant="outline">
                Reset Filters
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Comparison Table - uses filtered strategies - AC-5.6.3 */}
        {!showFilterEmptyState && (
          <div ref={comparisonTableRef}>
            <ComparisonTable
              strategies={filteredStrategies}
              baselineId={baseline?.strategyId ?? ''}
              recommendedId={bestStrategy?.strategyId}
              selectedId={selectedStrategyId ?? undefined}
              isLoading={isCalculating}
              onSelectStrategy={handleSelectStrategy}
            />
          </div>
        )}

        {/* Debt Reduction Chart - uses filtered strategies - AC-5.6.3 */}
        {!showFilterEmptyState && (
          <DebtReductionChart
            strategies={filteredStrategies}
            baselineId={baseline?.strategyId ?? ''}
            recommendedId={bestStrategy?.strategyId}
            isLoading={isCalculating}
          />
        )}

        {/* Interest Comparison Chart - uses filtered strategies - AC-5.6.3 */}
        {!showFilterEmptyState && (
          <InterestComparisonChart
            strategies={filteredStrategies}
            baselineId={baseline?.strategyId ?? ''}
            isLoading={isCalculating}
          />
        )}
      </div>
    </div>
  )
}
