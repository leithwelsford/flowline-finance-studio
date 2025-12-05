import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format/currency'
import { formatDate } from '@/lib/format/date'
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types'
import { ArrowUpDown, ArrowUp, ArrowDown, Star } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Props for ComparisonTable component
 */
export interface ComparisonTableProps {
  /** Array of calculated strategy projections */
  strategies: StrategyProjection[]
  /** Strategy ID for baseline (shown with muted styling) */
  baselineId: string
  /** Strategy ID to highlight as recommended */
  recommendedId?: string
  /** Show loading skeleton while calculating */
  isLoading?: boolean
  /** Callback when Select button is clicked (placeholder for Story 5.6) */
  onSelectStrategy?: (strategyId: string) => void
}

/**
 * Sort column options
 */
type SortColumn =
  | 'strategyName'
  | 'debtFreeDate'
  | 'totalInterestPaid'
  | 'interestSaved'
  | 'monthsSaved'
  | 'effortLevel'

type SortDirection = 'asc' | 'desc'

interface SortState {
  column: SortColumn
  direction: SortDirection
}

/**
 * Effort level sort order (low < medium < high)
 */
const EFFORT_ORDER: Record<EffortLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
}

/**
 * Effort badge colors
 */
const EFFORT_COLORS: Record<EffortLevel, string> = {
  low: 'bg-green-100 text-green-800 border-green-300',
  medium: 'bg-amber-100 text-amber-800 border-amber-300',
  high: 'bg-red-100 text-red-800 border-red-300',
}

/**
 * Column header configuration
 */
const COLUMNS: { key: SortColumn; label: string; className?: string }[] = [
  { key: 'strategyName', label: 'Strategy Name', className: 'sticky left-0 bg-background z-10 min-w-[150px]' },
  { key: 'debtFreeDate', label: 'Debt-Free Date' },
  { key: 'totalInterestPaid', label: 'Total Interest Paid' },
  { key: 'interestSaved', label: 'Interest Saved' },
  { key: 'monthsSaved', label: 'Months Saved' },
  { key: 'effortLevel', label: 'Effort Rating' },
]

/**
 * Sort icon component
 */
function SortIcon({ column, currentSort }: { column: SortColumn; currentSort: SortState }) {
  if (currentSort.column !== column) {
    return <ArrowUpDown className="ml-2 h-4 w-4" />
  }
  return currentSort.direction === 'asc' ? (
    <ArrowUp className="ml-2 h-4 w-4" />
  ) : (
    <ArrowDown className="ml-2 h-4 w-4" />
  )
}

/**
 * Effort rating badge component
 */
function EffortBadge({ level }: { level: EffortLevel }) {
  const label = level.charAt(0).toUpperCase() + level.slice(1)
  return (
    <Badge variant="outline" className={cn('capitalize', EFFORT_COLORS[level])}>
      {label}
    </Badge>
  )
}

/**
 * Loading skeleton for table
 */
function TableSkeleton() {
  return (
    <div className="space-y-3" aria-label="Loading comparison table" aria-busy="true">
      {/* Header skeleton */}
      <Skeleton className="h-10 w-full" />
      {/* Row skeletons */}
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-14 w-full" />
      ))}
    </div>
  )
}

/**
 * Mobile card layout for a single strategy
 */
function StrategyCard({
  strategy,
  isBaseline,
  isRecommended,
  onSelect,
}: {
  strategy: StrategyProjection
  isBaseline: boolean
  isRecommended: boolean
  onSelect?: () => void
}) {
  return (
    <Card
      className={cn(
        'animate-in fade-in duration-300',
        isBaseline && 'bg-slate-100 text-muted-foreground',
        isRecommended && !isBaseline && 'border-l-4 border-teal-600 bg-teal-50'
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {isRecommended && !isBaseline && (
              <Star className="w-4 h-4 text-teal-600 fill-teal-600" />
            )}
            <h3 className="font-semibold">{strategy.strategyName}</h3>
          </div>
          <EffortBadge level={strategy.effortLevel} />
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Debt-Free Date</p>
            <p className="font-medium">{formatDate(new Date(strategy.debtFreeDate))}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Interest</p>
            <p className="font-medium">{formatCurrency(strategy.totalInterestPaid.toString())}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Interest Saved</p>
            <p className={cn('font-medium', !isBaseline && 'text-green-600')}>
              {formatCurrency(strategy.interestSaved.toString())}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Months Saved</p>
            <p className="font-medium">{strategy.monthsSaved}</p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-4 w-full"
          onClick={onSelect}
          disabled={!onSelect}
        >
          Select
        </Button>
      </CardContent>
    </Card>
  )
}

/**
 * Strategy Comparison Table Component
 *
 * Displays all debt payoff strategies in a sortable table with columns for
 * key metrics. Supports column sorting, baseline/recommended highlighting,
 * and responsive mobile layout.
 *
 * @example
 * ```tsx
 * <ComparisonTable
 *   strategies={strategies}
 *   baselineId={baseline.strategyId}
 *   recommendedId={bestStrategy?.strategyId}
 *   isLoading={isCalculating}
 *   onSelectStrategy={(id) => handleSelect(id)}
 * />
 * ```
 */
export function ComparisonTable({
  strategies,
  baselineId,
  recommendedId,
  isLoading = false,
  onSelectStrategy,
}: ComparisonTableProps) {
  // Sort state - default sort by interestSaved descending (AC-5.2.2)
  const [sortState, setSortState] = useState<SortState>({
    column: 'interestSaved',
    direction: 'desc',
  })

  // Sorted strategies
  const sortedStrategies = useMemo(() => {
    const sorted = [...strategies]

    sorted.sort((a, b) => {
      let comparison = 0

      switch (sortState.column) {
        case 'strategyName':
          comparison = a.strategyName.localeCompare(b.strategyName)
          break
        case 'debtFreeDate':
          comparison = new Date(a.debtFreeDate).getTime() - new Date(b.debtFreeDate).getTime()
          break
        case 'totalInterestPaid':
          comparison = a.totalInterestPaid.cmp(b.totalInterestPaid)
          break
        case 'interestSaved':
          comparison = a.interestSaved.cmp(b.interestSaved)
          break
        case 'monthsSaved':
          comparison = a.monthsSaved - b.monthsSaved
          break
        case 'effortLevel':
          comparison = EFFORT_ORDER[a.effortLevel] - EFFORT_ORDER[b.effortLevel]
          break
      }

      return sortState.direction === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [strategies, sortState])

  // Handle column header click (AC-5.2.3)
  const handleSort = (column: SortColumn) => {
    setSortState((prev) => ({
      column,
      direction: prev.column === column && prev.direction === 'desc' ? 'asc' : 'desc',
    }))
  }

  // Show skeleton while loading (AC-5.2.8)
  if (isLoading) {
    return (
      <div id="comparison-table">
        <TableSkeleton />
      </div>
    )
  }

  // Don't render if no strategies
  if (strategies.length === 0) {
    return null
  }

  return (
    <section aria-label="Strategy Comparison Table" id="comparison-table">
      <h2 className="text-xl font-semibold mb-4">Strategy Comparison</h2>

      {/* Desktop table view (AC-5.2.7 - horizontal scroll on mobile) */}
      <div className="hidden sm:block overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {COLUMNS.map((col) => (
                <TableHead
                  key={col.key}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50 select-none whitespace-nowrap',
                    col.className
                  )}
                  onClick={() => handleSort(col.key)}
                  role="columnheader"
                  aria-sort={
                    sortState.column === col.key
                      ? sortState.direction === 'asc'
                        ? 'ascending'
                        : 'descending'
                      : 'none'
                  }
                >
                  <div className="flex items-center">
                    {col.label}
                    <SortIcon column={col.key} currentSort={sortState} />
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-[100px]">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedStrategies.map((strategy) => {
              const isBaseline = strategy.strategyId === baselineId
              const isRecommended = strategy.strategyId === recommendedId

              return (
                <TableRow
                  key={strategy.strategyId}
                  className={cn(
                    'transition-colors',
                    // AC-5.2.4: Baseline row muted/gray styling
                    isBaseline && 'bg-slate-100 text-muted-foreground',
                    // AC-5.2.5: Recommended row teal highlight (not if baseline)
                    isRecommended && !isBaseline && 'bg-teal-50 border-l-4 border-teal-600'
                  )}
                >
                  {/* Strategy Name - sticky on mobile scroll */}
                  <TableCell className="sticky left-0 bg-inherit z-10 font-medium whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      {isRecommended && !isBaseline && (
                        <Star
                          className="w-4 h-4 text-teal-600 fill-teal-600"
                          aria-label="Recommended"
                        />
                      )}
                      {strategy.strategyName}
                      {isBaseline && (
                        <Badge variant="secondary" className="text-xs">
                          Baseline
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  {/* Debt-Free Date */}
                  <TableCell className="whitespace-nowrap">
                    {formatDate(new Date(strategy.debtFreeDate))}
                  </TableCell>

                  {/* Total Interest Paid */}
                  <TableCell className="whitespace-nowrap">
                    {formatCurrency(strategy.totalInterestPaid.toString())}
                  </TableCell>

                  {/* Interest Saved */}
                  <TableCell
                    className={cn(
                      'whitespace-nowrap font-medium',
                      !isBaseline && 'text-green-600'
                    )}
                  >
                    {formatCurrency(strategy.interestSaved.toString())}
                  </TableCell>

                  {/* Months Saved */}
                  <TableCell className="whitespace-nowrap">{strategy.monthsSaved}</TableCell>

                  {/* Effort Rating (AC-5.2.6) */}
                  <TableCell>
                    <EffortBadge level={strategy.effortLevel} />
                  </TableCell>

                  {/* Select button (AC-5.2.9) */}
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectStrategy?.(strategy.strategyId)}
                      disabled={!onSelectStrategy}
                    >
                      Select
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Mobile card view (AC-5.2.7) */}
      <div className="sm:hidden space-y-3">
        {sortedStrategies.map((strategy) => (
          <StrategyCard
            key={strategy.strategyId}
            strategy={strategy}
            isBaseline={strategy.strategyId === baselineId}
            isRecommended={strategy.strategyId === recommendedId}
            onSelect={onSelectStrategy ? () => onSelectStrategy(strategy.strategyId) : undefined}
          />
        ))}
      </div>
    </section>
  )
}
