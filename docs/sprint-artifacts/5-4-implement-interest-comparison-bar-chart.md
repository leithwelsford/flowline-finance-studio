# Story 5.4: Implement Interest Comparison Bar Chart

Status: in-progress

## Story

As a **user**,
I want **to see a horizontal bar chart comparing total interest paid across all strategies**,
so that **I can clearly see the cost difference between strategies and quickly identify which saves the most money**.

## Acceptance Criteria

1. **AC-5.4.1:** Given strategies have been calculated, when I view the Compare page, then I see a Recharts horizontal bar chart (layout="vertical") with Y-axis = strategy names and X-axis = total interest paid (ZAR).

2. **AC-5.4.2:** Bars are sorted by total interest paid (lowest/best at top), making it immediately clear which strategy costs the least.

3. **AC-5.4.3:** Each bar displays the ZAR amount at the end of the bar using `formatCurrency` utility for proper South African formatting.

4. **AC-5.4.4:** Top performers (strategies with interest below baseline) use teal gradient coloring, while the baseline strategy bar is rendered in gray.

5. **AC-5.4.5:** Savings vs baseline is shown as an annotation (e.g., "Saves R X,XXX" or percentage) for strategies that outperform baseline.

6. **AC-5.4.6:** Component shows skeleton loading state while `isCalculating` is true from calculation store.

7. **AC-5.4.7:** If no strategies are calculated (empty results), show an appropriate empty state message.

8. **AC-5.4.8:** Chart is responsive: on mobile (<640px), adapts to smaller viewport with readable labels.

9. **AC-5.4.9:** Accessibility: Include a hidden data table alternative for screen readers with the same information.

## Tasks / Subtasks

- [ ] Task 1: Create InterestComparisonChart component structure (AC: 1, 7)
  - [ ] Create `src/components/charts/InterestComparisonChart.tsx`
  - [ ] Define props interface: `strategies: StrategyProjection[]`, `baselineId: string`, `isLoading?: boolean`
  - [ ] Set up Recharts BarChart with ResponsiveContainer wrapper and layout="vertical"
  - [ ] Add export to `src/components/charts/index.ts`

- [ ] Task 2: Transform strategy data for chart consumption (AC: 1, 2)
  - [ ] Extract `totalInterestPaid` from each StrategyProjection
  - [ ] Transform to chart data format: `{ strategyName: string, interestPaid: number, strategyId: string, isBaseline: boolean }[]`
  - [ ] Sort data by interestPaid ascending (best/lowest at top)
  - [ ] Use memoization (useMemo) to prevent unnecessary recalculations
  - [ ] Convert Big.js values to numbers for Recharts

- [ ] Task 3: Configure chart axes and layout (AC: 1)
  - [ ] Y-axis: strategy names (CategoryAxis)
  - [ ] X-axis: total interest in ZAR (NumberAxis with tick formatter)
  - [ ] Set appropriate height based on number of strategies (e.g., 50px per strategy + padding)
  - [ ] Configure margins for label visibility

- [ ] Task 4: Implement bar coloring logic (AC: 4)
  - [ ] Define color scheme: teal-600 for top performers, gray-400 for baseline
  - [ ] Use Cell component from Recharts for per-bar coloring
  - [ ] Identify baseline strategy by `baselineId` prop
  - [ ] Apply gradient or solid teal for strategies beating baseline

- [ ] Task 5: Add ZAR labels at bar ends (AC: 3)
  - [ ] Create custom LabelList or use Recharts label prop
  - [ ] Format values using `formatCurrency` utility from `src/lib/format/currency.ts`
  - [ ] Position labels at end of bars with appropriate offset
  - [ ] Ensure labels don't overlap with axis

- [ ] Task 6: Implement savings annotation (AC: 5)
  - [ ] Calculate savings vs baseline: `baseline.totalInterestPaid - strategy.totalInterestPaid`
  - [ ] Display "Saves R X,XXX" text for strategies that save money
  - [ ] Use custom tooltip or secondary label for annotations
  - [ ] Style annotations with green color for positive savings

- [ ] Task 7: Implement loading skeleton state (AC: 6)
  - [ ] Create ChartSkeleton sub-component (reuse pattern from DebtReductionChart)
  - [ ] Use shadcn/ui Skeleton with chart-like proportions
  - [ ] Show skeleton when `isLoading` prop is true
  - [ ] Add proper aria-busy attribute

- [ ] Task 8: Implement empty state (AC: 7)
  - [ ] Check if strategies array is empty
  - [ ] Display empty state card with message: "No strategies calculated yet"
  - [ ] Include action suggestion to calculate strategies

- [ ] Task 9: Implement responsive layout (AC: 8)
  - [ ] Detect mobile viewport using Tailwind breakpoints or window width
  - [ ] On mobile: adjust font sizes, abbreviate strategy names if needed
  - [ ] Ensure touch targets meet minimum 44x44px
  - [ ] Test at various screen widths

- [ ] Task 10: Add accessibility features (AC: 9)
  - [ ] Add visually hidden table with same data for screen readers
  - [ ] Use sr-only class from Tailwind for hidden table
  - [ ] Include proper table semantics: thead, tbody, th, td
  - [ ] Add aria-label to chart container

- [ ] Task 11: Write unit tests for InterestComparisonChart
  - [ ] Test: Renders BarChart with correct number of bars (AC-5.4.1)
  - [ ] Test: Bars are sorted by interest (lowest first) (AC-5.4.2)
  - [ ] Test: Labels show formatted ZAR amounts (AC-5.4.3)
  - [ ] Test: Baseline bar has gray color (AC-5.4.4)
  - [ ] Test: Savings annotations displayed for outperformers (AC-5.4.5)
  - [ ] Test: Loading state shows skeleton (AC-5.4.6)
  - [ ] Test: Empty state renders when no strategies (AC-5.4.7)
  - [ ] Test: Hidden data table exists for accessibility (AC-5.4.9)

- [ ] Task 12: Integrate with ComparePage (AC: 1)
  - [ ] Import InterestComparisonChart into `src/pages/ComparePage.tsx`
  - [ ] Pass strategies from `useStrategies` hook
  - [ ] Pass baseline.strategyId as baselineId
  - [ ] Position below DebtReductionChart component (or alongside in grid layout)

- [ ] Task 13: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` - verify all new tests pass
  - [ ] Run `npm run build` - verify no type errors
  - [ ] Manual test: chart renders with real strategy data
  - [ ] Verify visual appearance matches spec

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/
│   └── charts/
│       ├── DebtReductionChart.tsx     # Existing: Debt reduction curve
│       ├── InterestComparisonChart.tsx # NEW: Interest comparison bar chart
│       └── index.ts                    # MODIFY: Export InterestComparisonChart
├── pages/
│   └── ComparePage.tsx                 # MODIFY: Add InterestComparisonChart integration
```

**Data Flow:**
```
calculationStore.results (StrategyProjection[])
    │
    ├── useStrategies() hook
    │       ├── strategies - array of calculated projections
    │       ├── baseline - baseline strategy projection
    │       └── bestStrategy - highest interest savings
    │
    └── InterestComparisonChart component
            ├── Extract totalInterestPaid from each strategy
            ├── Sort by interest (lowest first)
            ├── Render Recharts BarChart (vertical layout)
            └── Calculate and display savings vs baseline
```

### UX Spec Alignment

From [ux-design-specification.md](../ux-design-specification.md):

**Section 2.2 - Visual Hierarchy:**
> "Bar charts for comparison, Line charts for trends"

**Section 2.3 - 2025 Financial Dashboard Best Practices:**
> "Interactive Charts: Bar charts for comparisons"

### Tech Spec Alignment

From [tech-spec-epic-5.md](./tech-spec-epic-5.md):

**Story 5.4 Acceptance Criteria (Authoritative):**
- AC-5.4.1: Horizontal bar chart with Y-axis = strategy names, X-axis = total interest (ZAR)
- AC-5.4.2: Bars sorted by interest (lowest/best at top)
- AC-5.4.3: Each bar shows ZAR amount at end
- AC-5.4.4: Top performers use teal gradient, baseline is gray
- AC-5.4.5: Savings vs baseline shown as annotation

**Technical Notes from Epics:**
> - Create `src/components/charts/InterestComparisonChart.tsx`
> - Use Recharts BarChart (horizontal via layout="vertical")
> - Ensure accessible: include data table alternative (hidden, screen reader only)

### Learnings from Previous Story

**From Story 5.3 (Status: done)**

- **Chart Component Pattern Established:**
  - `DebtReductionChart.tsx` provides the pattern to follow (433 lines)
  - Uses ResponsiveContainer wrapper for responsive sizing
  - STRATEGY_COLORS constant for consistent coloring
  - useMemo for expensive data transformations
  - Skeleton loading state with shadcn/ui Skeleton
  - Empty state with Card and descriptive message

- **Available Infrastructure:**
  - `useStrategies()` hook provides `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`
  - `formatCurrency` utility in `src/lib/format/currency.ts` for ZAR formatting
  - `src/components/charts/index.ts` already exists for barrel exports

- **Patterns to Reuse:**
  - ChartSkeleton component pattern
  - Empty state pattern with Card component
  - Data transformation with useMemo
  - Consistent color scheme (teal-600 for recommended, gray-400 for baseline)

- **Files from 5.3:**
  - `src/components/charts/DebtReductionChart.tsx` (433 lines)
  - `src/components/charts/index.ts` - barrel export exists
  - Integration pattern in ComparePage.tsx established

[Source: docs/sprint-artifacts/5-3-implement-debt-reduction-curve-chart.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `src/components/charts/InterestComparisonChart.tsx` - Main chart component
- `tests/components/charts/InterestComparisonChart.test.tsx` - Component tests

**Files to Modify:**
- `src/components/charts/index.ts` - Add InterestComparisonChart export
- `src/pages/ComparePage.tsx` - Integrate InterestComparisonChart

### Recharts Implementation Notes

```typescript
import { BarChart, Bar, XAxis, YAxis, Cell, LabelList, ResponsiveContainer, Tooltip } from 'recharts';

// Data structure for chart
interface ChartDataPoint {
  strategyName: string;
  strategyId: string;
  interestPaid: number;  // Converted from Big.js for Recharts
  isBaseline: boolean;
  savings: number;       // vs baseline (negative means worse than baseline)
}

// Color logic
const getBarColor = (isBaseline: boolean, savings: number): string => {
  if (isBaseline) return '#9ca3af';  // gray-400
  if (savings > 0) return '#0d9488'; // teal-600
  return '#9ca3af';                   // gray-400 for worse performers
};
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│ Total Interest Comparison                                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ Velocity Banking  ████████████░░░░░░░░░░░░░░░░░░  R 85,432  -R 45,123 │
│ Avalanche         █████████████████░░░░░░░░░░░░░  R 98,765  -R 31,790 │
│ Hybrid Avalanche  ██████████████████░░░░░░░░░░░░  R 102,340 -R 28,215 │
│ Snowball          ███████████████████░░░░░░░░░░░  R 108,432 -R 22,123 │
│ Flexi Chunking    ████████████████████░░░░░░░░░░  R 112,890 -R 17,665 │
│ Aggressive Flexi  █████████████████████░░░░░░░░░  R 118,234 -R 12,321 │
│ Hybrid Snowball   ██████████████████████░░░░░░░░  R 121,456  -R 9,099 │
│ Baseline (gray)   ████████████████████████████░░  R 130,555    (ref)  │
│                                                                  │
│                   0      50k     100k     150k                   │
│                        Total Interest (ZAR)                      │
└─────────────────────────────────────────────────────────────────┘
```

### Accessibility Implementation

```tsx
{/* Visually hidden table for screen readers */}
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
      {sortedStrategies.map(strategy => (
        <tr key={strategy.strategyId}>
          <td>{strategy.strategyName}</td>
          <td>{formatCurrency(strategy.totalInterestPaid)}</td>
          <td>{strategy.isBaseline ? 'Baseline' : formatCurrency(strategy.savings)}</td>
        </tr>
      ))}
    </tbody>
  </table>
</div>
```

### References

- [Source: docs/epics.md#Story-5.4] - Original story definition
- [Source: docs/prd.md#FR27] - "System generates visual comparison of total interest paid across all strategies (bar chart)"
- [Source: docs/prd.md#FR44] - "System generates interest payment comparison visualizations across strategies"
- [Source: docs/architecture.md#Project-Structure] - Component locations, Recharts usage
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Story-5.4] - Authoritative acceptance criteria
- [Source: docs/sprint-artifacts/5-3-implement-debt-reduction-curve-chart.md] - Previous story patterns

## Dev Agent Record

### Context Reference

- [5-4-implement-interest-comparison-bar-chart.context.xml](5-4-implement-interest-comparison-bar-chart.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-18 | Story drafted with full context from Epic 5 tech-spec, PRD (FR27, FR44), Architecture, and Story 5.3 learnings | SM Agent (Bob) |
| 2025-12-18 | Story context XML generated, status changed to ready-for-dev | SM Agent (Bob) |
