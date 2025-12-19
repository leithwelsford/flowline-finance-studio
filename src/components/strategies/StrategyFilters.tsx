import { useCallback, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Filter, X, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FilterState } from '@/hooks/useStrategyFilters'
import type { EffortLevel } from '@/lib/calculations/types'

/**
 * Props for StrategyFilters component
 */
export interface StrategyFiltersProps {
  /** Current filter state */
  filters: FilterState
  /** Toggle effort level selection */
  onToggleEffortLevel: (level: EffortLevel) => void
  /** Set minimum savings threshold */
  onSetMinSavings: (value: number | null) => void
  /** Reset all filters to default */
  onResetFilters: () => void
  /** Whether any filters are active */
  hasActiveFilters: boolean
}

/**
 * Effort level configuration
 */
const EFFORT_LEVELS: { level: EffortLevel; label: string; color: string; activeColor: string }[] = [
  {
    level: 'low',
    label: 'Low',
    color: 'border-green-300 text-green-700 hover:bg-green-50',
    activeColor: 'bg-green-100 border-green-500 text-green-800',
  },
  {
    level: 'medium',
    label: 'Medium',
    color: 'border-amber-300 text-amber-700 hover:bg-amber-50',
    activeColor: 'bg-amber-100 border-amber-500 text-amber-800',
  },
  {
    level: 'high',
    label: 'High',
    color: 'border-red-300 text-red-700 hover:bg-red-50',
    activeColor: 'bg-red-100 border-red-500 text-red-800',
  },
]

/**
 * Strategy Filters Component
 *
 * Provides filter controls for strategy comparison view:
 * - Effort level toggle buttons (Low/Medium/High)
 * - Minimum savings threshold input
 * - Reset filters button
 *
 * @see AC-5.6.1, AC-5.6.2, AC-5.6.8
 *
 * @example
 * ```tsx
 * <StrategyFilters
 *   filters={filters}
 *   onToggleEffortLevel={toggleEffortLevel}
 *   onSetMinSavings={setMinSavings}
 *   onResetFilters={resetFilters}
 *   hasActiveFilters={hasActiveFilters}
 * />
 * ```
 */
export function StrategyFilters({
  filters,
  onToggleEffortLevel,
  onSetMinSavings,
  onResetFilters,
  hasActiveFilters,
}: StrategyFiltersProps) {
  // Local state for debounced savings input
  const [savingsInput, setSavingsInput] = useState<string>(
    filters.minSavings !== null ? filters.minSavings.toString() : ''
  )

  // Sync local state when filters change externally (e.g., reset)
  useEffect(() => {
    setSavingsInput(filters.minSavings !== null ? filters.minSavings.toString() : '')
  }, [filters.minSavings])

  /**
   * Handle savings input change with debounce
   * @see AC-5.6.2
   */
  const handleSavingsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value

      // Allow empty input
      if (value === '') {
        setSavingsInput('')
        onSetMinSavings(null)
        return
      }

      // Parse and validate
      const numValue = parseFloat(value)
      if (!isNaN(numValue) && numValue >= 0) {
        setSavingsInput(value)
        onSetMinSavings(numValue)
      }
    },
    [onSetMinSavings]
  )

  /**
   * Clear savings threshold
   */
  const handleClearSavings = useCallback(() => {
    setSavingsInput('')
    onSetMinSavings(null)
  }, [onSetMinSavings])

  return (
    <Card className="border-dashed">
      <CardContent className="pt-4 pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          {/* Filter controls container */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:gap-6">
            {/* Effort Level Filter - AC-5.6.1 */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
                <Filter className="h-3 w-3" />
                Effort Level
              </Label>
              <div className="flex gap-1.5">
                {EFFORT_LEVELS.map(({ level, label, color, activeColor }) => {
                  const isSelected = filters.effortLevels.includes(level)
                  return (
                    <Button
                      key={level}
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleEffortLevel(level)}
                      className={cn(
                        'px-3 py-1 h-8 text-xs font-medium transition-colors',
                        isSelected ? activeColor : color
                      )}
                      aria-pressed={isSelected}
                      aria-label={`Filter by ${label} effort`}
                    >
                      {label}
                    </Button>
                  )
                })}
              </div>
            </div>

            {/* Minimum Savings Filter - AC-5.6.2 */}
            <div className="space-y-2">
              <Label
                htmlFor="min-savings"
                className="text-xs font-medium text-muted-foreground"
              >
                Minimum Savings (R)
              </Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                  R
                </span>
                <Input
                  id="min-savings"
                  type="number"
                  min="0"
                  step="1000"
                  placeholder="0"
                  value={savingsInput}
                  onChange={handleSavingsChange}
                  className="pl-7 pr-8 h-8 w-32 text-sm"
                  aria-label="Minimum savings threshold in Rand"
                />
                {savingsInput && (
                  <button
                    type="button"
                    onClick={handleClearSavings}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label="Clear minimum savings"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Reset button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="text-muted-foreground hover:text-foreground self-start sm:self-auto"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Reset Filters
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
