import { useMemo, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format/currency'
import type { StrategyProjection } from '@/lib/calculations/types'
import { cn } from '@/lib/utils'
import { TrendingDown } from 'lucide-react'

/**
 * Props for DebtReductionChart component
 */
export interface DebtReductionChartProps {
  /** Array of calculated strategy projections */
  strategies: StrategyProjection[]
  /** Strategy ID for baseline (renders as dashed gray) */
  baselineId: string
  /** Strategy ID for recommended (renders as solid teal) */
  recommendedId?: string
  /** Whether calculation is in progress (show skeleton) */
  isLoading?: boolean
}

/**
 * Data format for Recharts LineChart
 */
interface ChartDataPoint {
  month: number
  [strategyId: string]: number
}

/**
 * Color palette for strategies (AC-5.3.2)
 * Baseline is gray, recommended is teal, others have distinct colors
 */
const STRATEGY_COLORS: Record<string, string> = {
  baseline: '#9ca3af', // gray-400
  snowball: '#3b82f6', // blue-500
  avalanche: '#8b5cf6', // violet-500
  'flexi-chunking': '#f97316', // orange-500
  'aggressive-flexi': '#ec4899', // pink-500
  'velocity-banking': '#0d9488', // teal-600
  'hybrid-snowball': '#06b6d4', // cyan-500
  'hybrid-avalanche': '#f59e0b', // amber-500
}

/**
 * Get color for a strategy with fallback
 */
function getStrategyColor(strategyId: string, isRecommended: boolean): string {
  if (isRecommended) return '#0d9488' // teal-600 for recommended (AC-5.3.4)
  return STRATEGY_COLORS[strategyId] || '#64748b' // gray-500 fallback
}

/**
 * Format large numbers for Y-axis (abbreviate)
 */
function formatYAxisTick(value: number): string {
  if (value >= 1000000) {
    return `R${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R${(value / 1000).toFixed(0)}K`
  }
  return `R${value}`
}

/**
 * Custom tooltip props
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    dataKey?: string | number
    value?: number
    color?: string
  }>
  label?: string | number
  strategyNames: Record<string, string>
}

/**
 * Custom tooltip component (AC-5.3.5)
 */
function CustomTooltip({
  active,
  payload,
  label,
  strategyNames,
}: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-2">Month {label}</p>
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-slate-600">
              {strategyNames[String(entry.dataKey)] || entry.dataKey}:
            </span>
            <span className="font-medium">
              {formatCurrency(String(entry.value ?? 0))}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Loading skeleton for chart (AC-5.3.9)
 */
function ChartSkeleton() {
  return (
    <Card aria-label="Loading debt reduction chart" aria-busy="true">
      <CardHeader>
        <Skeleton className="h-6 w-48" />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] sm:h-[400px] flex flex-col gap-4">
          <Skeleton className="flex-1 w-full" />
          <div className="flex justify-center gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state when no strategies (AC-5.3.10)
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <TrendingDown className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          No strategies calculated yet
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Add your debt accounts and income details to see how different
          strategies compare over time.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Sample data for performance optimization (AC-5.3.7)
 * For projections > 120 months, sample every 3rd point
 */
function sampleDataForPerformance(
  data: ChartDataPoint[],
  threshold = 120
): ChartDataPoint[] {
  if (data.length <= threshold) {
    return data
  }

  const sampled: ChartDataPoint[] = []
  for (let i = 0; i < data.length; i++) {
    // Always include first, last, and every 3rd point
    if (i === 0 || i === data.length - 1 || i % 3 === 0) {
      sampled.push(data[i])
    }
  }
  return sampled
}

/**
 * Debt Reduction Curve Chart Component
 *
 * Visualizes how total debt decreases over time for each strategy using
 * a Recharts line chart. Supports legend toggle, custom tooltips, and
 * responsive layout.
 *
 * @example
 * ```tsx
 * <DebtReductionChart
 *   strategies={strategies}
 *   baselineId={baseline.strategyId}
 *   recommendedId={bestStrategy?.strategyId}
 *   isLoading={isCalculating}
 * />
 * ```
 */
export function DebtReductionChart({
  strategies,
  baselineId,
  recommendedId,
  isLoading = false,
}: DebtReductionChartProps) {
  // Track hidden strategies for legend toggle (AC-5.3.6)
  const [hiddenStrategies, setHiddenStrategies] = useState<Set<string>>(
    new Set()
  )

  // Map strategy IDs to names for tooltip
  const strategyNames = useMemo(() => {
    const names: Record<string, string> = {}
    strategies.forEach((s) => {
      names[s.strategyId] = s.strategyName
    })
    return names
  }, [strategies])

  // Transform strategy data for chart (AC-5.3.1, AC-5.3.2)
  const chartData = useMemo(() => {
    if (strategies.length === 0) return []

    // Find max month across all strategies
    const maxMonth = Math.max(...strategies.map((s) => s.debtFreeMonth))

    // Build data points for each month
    const data: ChartDataPoint[] = []
    for (let month = 0; month <= maxMonth; month++) {
      const point: ChartDataPoint = { month }

      strategies.forEach((strategy) => {
        // Find the projection for this month
        const projection = strategy.monthlyProjections.find(
          (p) => p.month === month
        )
        if (projection) {
          // Convert Big to number for chart
          point[strategy.strategyId] = Number(projection.totalDebt.toString())
        } else if (month === 0 && strategy.monthlyProjections.length > 0) {
          // Use first projection's starting debt for month 0
          const firstProjection = strategy.monthlyProjections[0]
          // Calculate initial debt from first month data
          const initialDebt = firstProjection.accounts.reduce(
            (sum, acc) => sum + Number(acc.startBalance.toString()),
            0
          )
          point[strategy.strategyId] = initialDebt
        } else if (month > strategy.debtFreeMonth) {
          // Strategy is debt-free, set to 0
          point[strategy.strategyId] = 0
        }
      })

      data.push(point)
    }

    return data
  }, [strategies])

  // Apply performance sampling (AC-5.3.7)
  const displayData = useMemo(
    () => sampleDataForPerformance(chartData),
    [chartData]
  )

  // Handle legend click to toggle strategy visibility (AC-5.3.6)
  const handleLegendClick = (strategyId: string) => {
    setHiddenStrategies((prev) => {
      const next = new Set(prev)
      if (next.has(strategyId)) {
        next.delete(strategyId)
      } else {
        next.add(strategyId)
      }
      return next
    })
  }

  // Show skeleton while loading (AC-5.3.9)
  if (isLoading) {
    return <ChartSkeleton />
  }

  // Show empty state if no strategies (AC-5.3.10)
  if (strategies.length === 0) {
    return <EmptyState />
  }

  return (
    <Card className="animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Debt Reduction Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container - responsive height (AC-5.3.8) */}
        <div className="h-[280px] sm:h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={displayData}
              margin={{
                top: 10,
                right: 10,
                left: 10,
                bottom: 10,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />

              {/* X-axis: months (AC-5.3.1) */}
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                label={{
                  value: 'Months',
                  position: 'insideBottom',
                  offset: -5,
                  className: 'fill-slate-500 text-xs',
                }}
              />

              {/* Y-axis: total debt in ZAR (AC-5.3.1) */}
              <YAxis
                tickFormatter={formatYAxisTick}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                tickMargin={8}
                width={60}
              />

              {/* Custom tooltip (AC-5.3.5) */}
              <Tooltip
                content={<CustomTooltip strategyNames={strategyNames} />}
              />

              {/* Legend with toggle (AC-5.3.6) - hidden on mobile (AC-5.3.8) */}
              <Legend
                onClick={(e) => {
                  if (e.dataKey) {
                    handleLegendClick(e.dataKey as string)
                  }
                }}
                wrapperStyle={{
                  paddingTop: '16px',
                  cursor: 'pointer',
                }}
                formatter={(value, entry) => {
                  const strategyId = entry.dataKey as string
                  const isHidden = hiddenStrategies.has(strategyId)
                  return (
                    <span
                      className={cn(
                        'text-sm',
                        isHidden && 'opacity-40 line-through'
                      )}
                    >
                      {strategyNames[strategyId] || value}
                    </span>
                  )
                }}
                className="hidden sm:flex"
              />

              {/* Strategy lines */}
              {strategies.map((strategy) => {
                const isBaseline = strategy.strategyId === baselineId
                const isRecommended = strategy.strategyId === recommendedId
                const isHidden = hiddenStrategies.has(strategy.strategyId)

                return (
                  <Line
                    key={strategy.strategyId}
                    type="monotone"
                    dataKey={strategy.strategyId}
                    name={strategy.strategyName}
                    stroke={getStrategyColor(strategy.strategyId, isRecommended && !isBaseline)}
                    strokeWidth={isRecommended && !isBaseline ? 3 : 2}
                    // AC-5.3.3: Baseline is dashed gray
                    strokeDasharray={isBaseline ? '5 5' : undefined}
                    dot={false}
                    activeDot={{ r: 4 }}
                    hide={isHidden}
                    // Disable animation for performance (AC-5.3.7)
                    isAnimationActive={false}
                  />
                )
              })}
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Mobile legend - simplified (AC-5.3.8) */}
        <div className="sm:hidden mt-4 flex flex-wrap gap-2 justify-center">
          {strategies.map((strategy) => {
            const isBaseline = strategy.strategyId === baselineId
            const isRecommended = strategy.strategyId === recommendedId
            const isHidden = hiddenStrategies.has(strategy.strategyId)

            return (
              <button
                key={strategy.strategyId}
                onClick={() => handleLegendClick(strategy.strategyId)}
                className={cn(
                  'flex items-center gap-1.5 px-2 py-1 rounded text-xs',
                  'border border-slate-200 transition-opacity',
                  isHidden && 'opacity-40'
                )}
              >
                <span
                  className={cn(
                    'w-3 h-0.5 rounded',
                    isBaseline && 'border-dashed border border-slate-400'
                  )}
                  style={{
                    backgroundColor: isBaseline
                      ? 'transparent'
                      : getStrategyColor(
                          strategy.strategyId,
                          isRecommended && !isBaseline
                        ),
                  }}
                />
                <span className={cn(isHidden && 'line-through')}>
                  {strategy.strategyName}
                </span>
              </button>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
