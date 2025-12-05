import { useEffect, useRef } from 'react'
import { useStrategies } from '@/hooks/useStrategies'
import { WinnersPodium, ComparisonTable } from '@/components/strategies'

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

  const comparisonTableRef = useRef<HTMLDivElement>(null)

  // Trigger calculation on mount if data is loaded
  useEffect(() => {
    if (!isDataLoading && strategies.length === 0 && !isCalculating) {
      calculateStrategies()
    }
  }, [isDataLoading, strategies.length, isCalculating, calculateStrategies])

  const handlePositionClick = (_strategyId: string) => {
    // Scroll to comparison table (to be implemented in Story 5.2)
    // _strategyId will be used in Story 5.2 to highlight the selected strategy in the table
    comparisonTableRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

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

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-2xl font-bold mb-6">Compare</h1>

      <div className="space-y-8">
        {/* Winner's Podium */}
        <WinnersPodium
          strategies={strategies}
          recommendedId={bestStrategy?.strategyId}
          onPositionClick={handlePositionClick}
          isLoading={isCalculating}
        />

        {/* Comparison Table */}
        <div ref={comparisonTableRef}>
          <ComparisonTable
            strategies={strategies}
            baselineId={baseline?.strategyId ?? ''}
            recommendedId={bestStrategy?.strategyId}
            isLoading={isCalculating}
          />
        </div>
      </div>
    </div>
  )
}
