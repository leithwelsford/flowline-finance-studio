# Story 5.3: Implement Debt Reduction Curve Chart

Status: ready-for-dev

## Story

As a **user**,
I want **to see a line chart visualizing how my total debt decreases over time for each strategy**,
so that **I can visually compare strategy trajectories and understand the path to becoming debt-free**.

## Acceptance Criteria

1. **AC-5.3.1:** Given strategies have been calculated, when I view the Compare page, then I see a Recharts line chart with X-axis = months (0 to debt-free) and Y-axis = total debt (ZAR).

2. **AC-5.3.2:** Each strategy is represented by a distinct line with a unique color from the defined color palette.

3. **AC-5.3.3:** The baseline strategy line is rendered as a dashed gray line (`strokeDasharray`) to visually distinguish it from optimized strategies.

4. **AC-5.3.4:** The recommended strategy (highest interestSaved) is rendered as a solid teal line (teal-600) for visual emphasis.

5. **AC-5.3.5:** Hovering over any data point shows a Recharts tooltip displaying: month number, strategy name, and exact debt value (ZAR formatted).

6. **AC-5.3.6:** A clickable legend allows users to toggle individual strategy lines on/off to reduce visual clutter and focus on specific strategies.

7. **AC-5.3.7:** Chart renders in under 2 seconds for projections up to 360 months (NFR-P3 performance requirement).

8. **AC-5.3.8:** On mobile (<640px), the chart simplifies: reduced legend visibility, larger touch targets, and potentially sampled data points for performance.

9. **AC-5.3.9:** Component shows skeleton loading state while `isCalculating` is true from calculation store.

10. **AC-5.3.10:** If no strategies are calculated (empty results), show an appropriate empty state message.

## Tasks / Subtasks

- [ ] Task 1: Create DebtReductionChart component structure (AC: 1, 10)
  - [ ] Create `src/components/charts/DebtReductionChart.tsx`
  - [ ] Define props interface: `strategies: StrategyProjection[]`, `baselineId: string`, `recommendedId?: string`, `isLoading?: boolean`
  - [ ] Set up Recharts LineChart with ResponsiveContainer wrapper
  - [ ] Add exports to `src/components/charts/index.ts`

- [ ] Task 2: Transform strategy data for chart consumption (AC: 1, 2)
  - [ ] Extract `monthlyProjections` from each StrategyProjection
  - [ ] Transform to chart data format: `{ month: number, [strategyId]: number }[]`
  - [ ] Use memoization (useMemo) to prevent unnecessary recalculations
  - [ ] Handle varying projection lengths (strategies may have different debt-free months)

- [ ] Task 3: Configure chart axes (AC: 1)
  - [ ] X-axis: months (0 to max debtFreeMonth across all strategies)
  - [ ] Y-axis: total debt in ZAR (formatted with formatCurrency abbreviation for large values)
  - [ ] Add axis labels: "Months" and "Total Debt (ZAR)"
  - [ ] Configure tick formatting for readability

- [ ] Task 4: Define color palette and line styles (AC: 2, 3, 4)
  - [ ] Create STRATEGY_COLORS constant with distinct colors for each strategy
  - [ ] Baseline: gray-400 with `strokeDasharray="5 5"`
  - [ ] Recommended: teal-600, solid line, increased strokeWidth
  - [ ] Other strategies: distinct colors (blue, purple, orange, pink, cyan, amber)
  - [ ] Ensure color contrast meets WCAG AA guidelines

- [ ] Task 5: Implement interactive tooltip (AC: 5)
  - [ ] Create custom Recharts Tooltip component
  - [ ] Format debt values using `formatCurrency` utility
  - [ ] Display: "Month X: Strategy Name - R X,XXX.XX"
  - [ ] Style tooltip with consistent theme (white background, shadow, rounded)

- [ ] Task 6: Implement legend with toggle functionality (AC: 6)
  - [ ] Use Recharts Legend component with onClick handler
  - [ ] Track hidden strategies in component state
  - [ ] Toggle line visibility when legend item clicked
  - [ ] Style hidden legend items with reduced opacity
  - [ ] Ensure legend is keyboard accessible

- [ ] Task 7: Optimize performance for large datasets (AC: 7)
  - [ ] Implement data sampling for projections > 120 months (sample every 3rd point)
  - [ ] Use `isAnimationActive={false}` for initial render performance
  - [ ] Memoize chart data transformation
  - [ ] Test with 360-month projections (30-year maximum)

- [ ] Task 8: Implement responsive mobile layout (AC: 8)
  - [ ] Detect mobile viewport using Tailwind breakpoints
  - [ ] On mobile: hide legend, show simplified tooltip
  - [ ] Increase stroke width for better touch visibility
  - [ ] Consider vertical legend placement or collapsible legend on mobile

- [ ] Task 9: Implement loading skeleton state (AC: 9)
  - [ ] Create ChartSkeleton sub-component
  - [ ] Use shadcn/ui Skeleton with chart-like proportions
  - [ ] Show skeleton when `isLoading` prop is true
  - [ ] Add proper aria-busy and aria-label attributes

- [ ] Task 10: Implement empty state (AC: 10)
  - [ ] Check if strategies array is empty
  - [ ] Display empty state card with message: "No strategies calculated yet"
  - [ ] Include action button to trigger calculation or navigate to data entry

- [ ] Task 11: Write unit tests for DebtReductionChart
  - [ ] Test: Renders LineChart with correct number of lines (AC-5.3.1, AC-5.3.2)
  - [ ] Test: Baseline line has dashed stroke (AC-5.3.3)
  - [ ] Test: Recommended line has teal color (AC-5.3.4)
  - [ ] Test: Tooltip displays formatted values (AC-5.3.5)
  - [ ] Test: Legend toggle hides/shows lines (AC-5.3.6)
  - [ ] Test: Data sampling for long projections (AC-5.3.7)
  - [ ] Test: Loading state shows skeleton (AC-5.3.9)
  - [ ] Test: Empty state renders when no strategies (AC-5.3.10)

- [ ] Task 12: Integrate with ComparePage (AC: 1)
  - [ ] Import DebtReductionChart into `src/pages/ComparePage.tsx`
  - [ ] Pass strategies from `useStrategies` hook
  - [ ] Pass baseline.strategyId as baselineId
  - [ ] Pass bestStrategy.strategyId as recommendedId
  - [ ] Position below ComparisonTable component

- [ ] Task 13: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` - verify all new tests pass
  - [ ] Run `npm run build` - verify no type errors
  - [ ] Manual test: chart renders with real strategy data

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/
│   └── charts/
│       ├── DebtReductionChart.tsx     # NEW: Debt reduction curve visualization
│       └── index.ts                    # MODIFY: Export DebtReductionChart
├── pages/
│   └── ComparePage.tsx                 # MODIFY: Add DebtReductionChart integration
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
    └── DebtReductionChart component
            ├── Transform monthlyProjections to chart data
            ├── Render Recharts LineChart
            └── Handle legend interactions
```

### UX Spec Alignment

From [ux-design-specification.md](../ux-design-specification.md):

**Section 2.2 Novel UX Patterns - Level 1 (Overview):**
> Visual "winner's podium" showing top 3 strategies by interest saved

**Section 2.2 - Visual Hierarchy:**
> Debt reduction curves (all strategies overlaid on one chart)

**Section 2.3 - 2025 Financial Dashboard Best Practices:**
> Interactive Charts: Line charts for trends

### Tech Spec Alignment

From [tech-spec-epic-5.md](./tech-spec-epic-5.md):

**Story 5.3 Acceptance Criteria (Authoritative):**
- AC-5.3.1: Line chart with X-axis = months, Y-axis = total debt (ZAR)
- AC-5.3.2: One line per strategy with distinct colors
- AC-5.3.3: Baseline shows as dashed gray line
- AC-5.3.4: Recommended strategy shows as solid teal line
- AC-5.3.5: Hover tooltip shows exact values at data point
- AC-5.3.6: Legend allows toggling strategies on/off
- AC-5.3.7: Chart renders in under 2 seconds

**Performance Risk Mitigation:**
> Risk: Chart performance with 360 months of data may be slow
> Mitigation: Sample every 3rd data point for long projections

### Learnings from Previous Story

**From Story 5.2 (Status: done)**

- **Available Infrastructure:**
  - `useStrategies()` hook provides `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`
  - `formatCurrency` and `formatDate` utilities available in `src/lib/format/`
  - Results sorted by interestSaved descending from calculationStore

- **Component Patterns:**
  - Use shadcn/ui Card, Skeleton components (already imported)
  - Follow same animate-in pattern for consistency
  - Use same loading skeleton approach established in WinnersPodium and ComparisonTable

- **Test Infrastructure:**
  - 1392 tests passing across 72 test files
  - Build succeeds
  - Testing patterns established - follow same structure

- **Files Created in 5.2:**
  - `src/components/strategies/ComparisonTable.tsx` (369 lines)
  - Established patterns for handling strategy data and formatting

- **bestStrategy as recommendedId:**
  - Until Story 5.5 recommendation engine is implemented, use `bestStrategy.strategyId` as the recommendedId
  - bestStrategy is the strategy with highest interestSaved

[Source: docs/sprint-artifacts/5-2-implement-strategy-comparison-table.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `src/components/charts/DebtReductionChart.tsx` - Main chart component
- `tests/components/charts/DebtReductionChart.test.tsx` - Component tests

**Files to Modify:**
- `src/components/charts/index.ts` - Export DebtReductionChart (create if doesn't exist)
- `src/pages/ComparePage.tsx` - Integrate DebtReductionChart below ComparisonTable

### Recharts Implementation Notes

```typescript
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Color palette for strategies
const STRATEGY_COLORS: Record<string, string> = {
  'baseline': '#9ca3af',      // gray-400
  'snowball': '#3b82f6',      // blue-500
  'avalanche': '#8b5cf6',     // violet-500
  'flexi-chunking': '#f97316', // orange-500
  'aggressive-flexi': '#ec4899', // pink-500
  'velocity-banking': '#0d9488', // teal-600 (also for recommended)
  'hybrid-snowball': '#06b6d4', // cyan-500
  'hybrid-avalanche': '#f59e0b', // amber-500
};

// Data transformation
interface ChartDataPoint {
  month: number;
  [strategyId: string]: number; // debt value per strategy
}
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│ Debt Reduction Over Time                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  R 500,000 ┤                                                     │
│            │ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ (Baseline - dashed gray) │
│            │ \                                                    │
│  R 400,000 ┤  \  ────────── (Velocity - solid teal)              │
│            │   \    \                                             │
│            │    \    ──────── (Avalanche)                         │
│  R 300,000 ┤     \       \                                        │
│            │      \       \                                       │
│            │       \       ─── (Snowball)                         │
│  R 200,000 ┤        \                                             │
│            │         \                                            │
│            │          \                                           │
│  R 100,000 ┤           \                                          │
│            │            \                                         │
│          0 ┼─────┬─────┬─────┬─────┬─────┬─────┬─────┬─────┬────│
│            0    12    24    36    48    60    72    84    96     │
│                              Months                               │
├─────────────────────────────────────────────────────────────────┤
│ [●] Baseline  [●] Velocity Banking  [●] Avalanche  [●] Snowball │
└─────────────────────────────────────────────────────────────────┘
```

### Existing Utilities to Use

- `formatCurrency(amount)` from `src/lib/format/currency.ts` - ZAR formatting
- `formatDate(date)` from `src/lib/format/date.ts` - SA DD/MM/YYYY format
- `Skeleton` from shadcn/ui for loading state
- `Card`, `CardHeader`, `CardTitle`, `CardContent` from shadcn/ui
- `ResponsiveContainer`, `LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `Legend` from recharts

### References

- [Source: docs/epics.md#Story-5.3] - Original story definition
- [Source: docs/prd.md#FR26] - "System generates visual comparison charts showing debt reduction curves over time"
- [Source: docs/prd.md#FR43] - "System generates interactive debt reduction curve charts"
- [Source: docs/ux-design-specification.md#2.2] - Novel UX Patterns - Debt reduction curves
- [Source: docs/architecture.md#Project-Structure] - Component locations, Recharts usage
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Story-5.3] - Authoritative acceptance criteria
- [Source: docs/sprint-artifacts/5-2-implement-strategy-comparison-table.md] - Previous story context

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/5-3-implement-debt-reduction-curve-chart.context.xml](5-3-implement-debt-reduction-curve-chart.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-06 | Story drafted with full context from Epic 5 tech-spec, PRD (FR26, FR43), UX Design, Architecture, and Story 5.2 learnings | SM Agent (Bob) |
| 2025-12-18 | Story context XML generated, status changed to ready-for-dev | SM Agent (Bob) |
