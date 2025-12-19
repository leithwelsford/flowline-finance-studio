import { useMemo } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  LabelList,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { formatCurrency } from '@/lib/format/currency'
import type { StrategyProjection } from '@/lib/calculations/types'
import { BarChart2 } from 'lucide-react'

/**
 * Props for InterestComparisonChart component
 */
export interface InterestComparisonChartProps {
  /** Array of calculated strategy projections */
  strategies: StrategyProjection[]
  /** Strategy ID for baseline (renders as gray) */
  baselineId: string
  /** Whether calculation is in progress (show skeleton) */
  isLoading?: boolean
}

/**
 * Data format for Recharts BarChart
 */
interface ChartDataPoint {
  strategyName: string
  strategyId: string
  interestPaid: number
  isBaseline: boolean
  savings: number
}

/**
 * Color constants (AC-5.4.4)
 * Teal for top performers, gray for baseline
 */
const COLORS = {
  performer: '#0d9488', // teal-600
  baseline: '#9ca3af', // gray-400
}

/**
 * Get bar color based on baseline status and savings
 */
function getBarColor(isBaseline: boolean, savings: number): string {
  if (isBaseline) return COLORS.baseline
  if (savings > 0) return COLORS.performer
  return COLORS.baseline
}

/**
 * Format large numbers for X-axis ticks (abbreviate)
 */
function formatXAxisTick(value: number): string {
  if (value >= 1000000) {
    return `R${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `R${(value / 1000).toFixed(0)}K`
  }
  return `R${value}`
}

/**
 * Custom label component for bar end labels (AC-5.4.3)
 */
function CustomLabel(props: {
  x?: number
  y?: number
  width?: number
  height?: number
  value?: number
}) {
  const { x, y, width, height, value } = props
  if (x === undefined || y === undefined || width === undefined || height === undefined) {
    return null
  }

  return (
    <text
      x={x + width + 8}
      y={y + height / 2}
      fill="#374151"
      textAnchor="start"
      dominantBaseline="middle"
      className="text-xs sm:text-sm"
      fontSize={12}
    >
      {formatCurrency(String(value ?? 0))}
    </text>
  )
}

/**
 * Custom tooltip component
 */
interface CustomTooltipProps {
  active?: boolean
  payload?: Array<{
    payload?: ChartDataPoint
  }>
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) {
    return null
  }

  const data = payload[0].payload
  if (!data) return null

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-sm">
      <p className="font-semibold text-slate-700 mb-1">{data.strategyName}</p>
      <p className="text-slate-600">
        Total Interest: {formatCurrency(String(data.interestPaid))}
      </p>
      {!data.isBaseline && data.savings > 0 && (
        <p className="text-teal-600 font-medium mt-1">
          Saves {formatCurrency(String(data.savings))}
        </p>
      )}
    </div>
  )
}

/**
 * Loading skeleton for chart (AC-5.4.6)
 */
function ChartSkeleton() {
  return (
    <Card aria-label="Loading interest comparison chart" aria-busy="true">
      <CardHeader>
        <Skeleton className="h-6 w-56" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <Skeleton className="h-4 w-32 shrink-0" />
              <Skeleton className="h-8 flex-1" />
              <Skeleton className="h-4 w-20 shrink-0" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Empty state when no strategies (AC-5.4.7)
 */
function EmptyState() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <BarChart2 className="w-12 h-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold text-slate-700 mb-2">
          No strategies calculated yet
        </h3>
        <p className="text-muted-foreground max-w-sm">
          Add your debt accounts and income details to compare total interest
          across different repayment strategies.
        </p>
      </CardContent>
    </Card>
  )
}

/**
 * Interest Comparison Bar Chart Component
 *
 * Visualizes total interest paid across strategies using a horizontal bar chart.
 * Bars are sorted by interest (lowest/best at top), with color coding for
 * baseline vs performers, and savings annotations.
 *
 * @example
 * ```tsx
 * <InterestComparisonChart
 *   strategies={strategies}
 *   baselineId={baseline.strategyId}
 *   isLoading={isCalculating}
 * />
 * ```
 */
export function InterestComparisonChart({
  strategies,
  baselineId,
  isLoading = false,
}: InterestComparisonChartProps) {
  // Find baseline interest for calculating savings
  const baselineInterest = useMemo(() => {
    const baseline = strategies.find((s) => s.strategyId === baselineId)
    return baseline ? Number(baseline.totalInterestPaid.toString()) : 0
  }, [strategies, baselineId])

  // Transform and sort strategy data for chart (AC-5.4.1, AC-5.4.2)
  const chartData = useMemo((): ChartDataPoint[] => {
    if (strategies.length === 0) return []

    return strategies
      .map((strategy) => {
        const interestPaid = Number(strategy.totalInterestPaid.toString())
        const isBaseline = strategy.strategyId === baselineId
        const savings = baselineInterest - interestPaid

        return {
          strategyName: strategy.strategyName,
          strategyId: strategy.strategyId,
          interestPaid,
          isBaseline,
          savings,
        }
      })
      // Sort by interest paid ascending (lowest/best at top) - AC-5.4.2
      .sort((a, b) => a.interestPaid - b.interestPaid)
  }, [strategies, baselineId, baselineInterest])

  // Calculate dynamic height based on number of strategies
  const chartHeight = useMemo(() => {
    const barHeight = 50
    const padding = 60
    return Math.max(200, chartData.length * barHeight + padding)
  }, [chartData.length])

  // Show skeleton while loading (AC-5.4.6)
  if (isLoading) {
    return <ChartSkeleton />
  }

  // Show empty state if no strategies (AC-5.4.7)
  if (strategies.length === 0) {
    return <EmptyState />
  }

  return (
    <Card className="animate-in fade-in duration-300">
      <CardHeader>
        <CardTitle className="text-lg">Total Interest Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Chart container - responsive (AC-5.4.8) */}
        <div
          className="w-full"
          style={{ height: chartHeight }}
          aria-label="Bar chart comparing total interest paid across strategies"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{
                top: 10,
                right: 100,
                left: 10,
                bottom: 10,
              }}
            >
              {/* X-axis: total interest in ZAR (AC-5.4.1) */}
              <XAxis
                type="number"
                tickFormatter={formatXAxisTick}
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickMargin={8}
              />

              {/* Y-axis: strategy names (AC-5.4.1) */}
              <YAxis
                type="category"
                dataKey="strategyName"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11 }}
                tickMargin={8}
                width={120}
              />

              {/* Custom tooltip */}
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />

              {/* Bars with per-bar coloring (AC-5.4.4) */}
              <Bar
                dataKey="interestPaid"
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                {chartData.map((entry) => (
                  <Cell
                    key={entry.strategyId}
                    fill={getBarColor(entry.isBaseline, entry.savings)}
                  />
                ))}
                {/* ZAR labels at bar ends (AC-5.4.3) */}
                <LabelList
                  dataKey="interestPaid"
                  content={<CustomLabel />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Savings annotations below chart (AC-5.4.5) */}
        <div className="mt-4 space-y-1">
          {chartData
            .filter((d) => !d.isBaseline && d.savings > 0)
            .slice(0, 3) // Show top 3 savers
            .map((data) => (
              <div
                key={data.strategyId}
                className="flex items-center gap-2 text-sm"
              >
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS.performer }}
                />
                <span className="text-slate-600">{data.strategyName}:</span>
                <span className="text-teal-600 font-medium">
                  Saves {formatCurrency(String(data.savings))}
                </span>
              </div>
            ))}
        </div>

        {/* Hidden data table for screen readers (AC-5.4.9) */}
        <div className="sr-only">
          <table>
            <caption>Interest comparison by strategy</caption>
            <thead>
              <tr>
                <th>Strategy</th>
                <th>Total Interest Paid (ZAR)</th>
                <th>Savings vs Baseline</th>
              </tr>
            </thead>
            <tbody>
              {chartData.map((data) => (
                <tr key={data.strategyId}>
                  <td>{data.strategyName}</td>
                  <td>{formatCurrency(String(data.interestPaid))}</td>
                  <td>
                    {data.isBaseline
                      ? 'Baseline'
                      : data.savings > 0
                        ? `Saves ${formatCurrency(String(data.savings))}`
                        : 'No savings'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
