# Story 5.2: Implement Strategy Comparison Table

Status: ready-for-review

## Story

As a **user**,
I want **to see all debt payoff strategies compared side-by-side in a detailed table**,
so that **I can make an informed decision by examining metrics like debt-free date, interest paid, and effort required for each strategy**.

## Acceptance Criteria

1. **AC-5.2.1:** Given strategies have been calculated (via `useStrategies` hook), when I view the Compare page, then I see a table with columns: Strategy Name, Debt-Free Date, Total Interest Paid (ZAR), Interest Saved vs Baseline (ZAR), Months Saved, Effort Rating.

2. **AC-5.2.2:** Default sort order is by interest saved (best/highest savings first), displaying the most advantageous strategies at the top.

3. **AC-5.2.3:** Clicking any column header toggles sort between ascending and descending order for that column.

4. **AC-5.2.4:** The baseline strategy row is visually distinct (gray/muted styling) to differentiate it from optimized strategies.

5. **AC-5.2.5:** The recommended strategy row has teal highlight (using teal-600 border or background accent) to draw attention.

6. **AC-5.2.6:** Effort rating displays as a Badge component with semantic colors: green for Low, amber for Medium, red for High.

7. **AC-5.2.7:** On mobile (<640px), the table converts to cards or enables horizontal scroll with fixed first column (Strategy Name) for usability.

8. **AC-5.2.8:** Component shows skeleton loading state while `isCalculating` is true from calculation store.

9. **AC-5.2.9:** Each strategy row includes a "Select" button that will trigger strategy selection (full implementation in Story 5.6).

10. **AC-5.2.10:** The table has an `id="comparison-table"` attribute to support scroll-to-table functionality from Winner's Podium (Story 5.1).

## Tasks / Subtasks

- [x] Task 1: Create ComparisonTable component structure (AC: 1, 10)
  - [x] Create `src/components/strategies/ComparisonTable.tsx`
  - [x] Define props interface: `strategies: StrategyProjection[]`, `baselineId: string`, `recommendedId?: string`, `isLoading?: boolean`
  - [x] Set up shadcn/ui Table structure (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
  - [x] Add `id="comparison-table"` to root element for scroll targeting

- [x] Task 2: Implement table columns and data mapping (AC: 1, 2)
  - [x] Map StrategyProjection fields to columns:
    - Strategy Name: `strategyName`
    - Debt-Free Date: `debtFreeDate` (formatted via `formatDate`)
    - Total Interest Paid: `totalInterestPaid` (formatted via `formatCurrency`)
    - Interest Saved vs Baseline: `interestSaved` (formatted via `formatCurrency`)
    - Months Saved: `monthsSaved`
    - Effort Rating: `effortLevel`
  - [x] Default sort by `interestSaved` descending

- [x] Task 3: Implement column sorting functionality (AC: 3)
  - [x] Create sort state: `{ column: string, direction: 'asc' | 'desc' }`
  - [x] Handle column header click to toggle sort
  - [x] Implement sort comparison for each column type (string, number, Big)
  - [x] Add sort indicator icons (ArrowUpDown/ArrowUp/ArrowDown from lucide-react)

- [x] Task 4: Style baseline row distinctly (AC: 4)
  - [x] Identify baseline row by comparing `strategyId` with `baselineId` prop
  - [x] Apply muted/gray styling: `bg-slate-100 text-muted-foreground`
  - [x] Add "Baseline" badge to distinguish row

- [x] Task 5: Highlight recommended strategy row (AC: 5)
  - [x] Identify recommended row by comparing `strategyId` with `recommendedId` prop
  - [x] Apply teal highlight: `border-l-4 border-teal-600 bg-teal-50`
  - [x] Add star icon indicator on recommended row

- [x] Task 6: Implement effort rating badges (AC: 6)
  - [x] Create EffortBadge sub-component
  - [x] Map effort levels to colors:
    - Low: `bg-green-100 text-green-800 border-green-300`
    - Medium: `bg-amber-100 text-amber-800 border-amber-300`
    - High: `bg-red-100 text-red-800 border-red-300`
  - [x] Include effort level text in badge

- [x] Task 7: Implement responsive mobile layout (AC: 7)
  - [x] Option A: Horizontal scroll with sticky first column (desktop)
    - [x] Use `overflow-x-auto` on table container
    - [x] Apply `sticky left-0 bg-inherit` to Strategy Name column
  - [x] Option B: Convert to card layout on mobile (< 640px)
    - [x] Create StrategyCard sub-component
    - [x] Show cards on mobile, table on desktop via Tailwind breakpoints

- [x] Task 8: Implement loading skeleton state (AC: 8)
  - [x] Create TableSkeleton sub-component
  - [x] Use shadcn/ui Skeleton for header and 6 rows
  - [x] Show skeleton when `isLoading` prop is true
  - [x] Proper aria-busy and aria-label attributes

- [x] Task 9: Add Select button placeholder (AC: 9)
  - [x] Add "Select" column with Button component
  - [x] Button disabled when onSelectStrategy not provided
  - [x] Use small/outline variant: `<Button variant="outline" size="sm">`

- [x] Task 10: Write unit tests for ComparisonTable
  - [x] Test: Renders all 6 data columns (AC-5.2.1)
  - [x] Test: Default sort is by interest saved descending (AC-5.2.2)
  - [x] Test: Clicking column header changes sort order (AC-5.2.3)
  - [x] Test: Baseline row has muted styling (AC-5.2.4)
  - [x] Test: Recommended row has teal highlight (AC-5.2.5)
  - [x] Test: Effort badges have correct colors (AC-5.2.6)
  - [x] Test: Mobile responsive layout classes (AC-5.2.7)
  - [x] Test: Loading state shows skeleton (AC-5.2.8)
  - [x] Test: Select buttons render and callback works (AC-5.2.9)
  - [x] Test: Table has id="comparison-table" (AC-5.2.10)
  - [x] 43 tests passing

- [x] Task 11: Integrate with ComparePage (AC: 1, 10)
  - [x] Import ComparisonTable into `src/pages/ComparePage.tsx`
  - [x] Pass strategies from `useStrategies` hook
  - [x] Pass baseline.strategyId as baselineId
  - [x] Pass bestStrategy.strategyId as recommendedId
  - [x] Position below WinnersPodium component

- [x] Task 12: Verify build and all tests pass (AC: all)
  - [x] Run `npm run test` - 1392 tests passing (72 test files)
  - [x] Run `npm run build` - success (no type errors)
  - [x] Component ready for responsive testing in browser

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/
│   └── strategies/
│       ├── WinnersPodium.tsx       # Story 5.1 (done)
│       ├── ComparisonTable.tsx     # NEW: Strategy comparison table
│       └── index.ts                # MODIFY: Export ComparisonTable
├── pages/
│   └── ComparePage.tsx             # MODIFY: Add ComparisonTable integration
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
    └── ComparisonTable component
            ├── Sort by column (internal state)
            ├── Format values (currency, date)
            └── Render rows with styling
```

### UX Spec Alignment

From [ux-design-specification.md](../ux-design-specification.md):

**Section 2.2 Novel UX Patterns - Level 2 (Details):**
> Sortable table with all metrics (debt-free date, total interest, savings, effort)

**Section 6.1 Component Strategy - Custom Components:**
> ComparisonTable - Side-by-side strategy metrics
> - Props: strategies (all), sortColumn, sortDirection

**Section 8 Responsive Strategy:**
> Mobile: Tables become horizontally scrollable with pinned first column

### Tech Spec Alignment

From [tech-spec-epic-5.md](./tech-spec-epic-5.md):

**Story 5.2 Acceptance Criteria (Authoritative):**
- AC-5.2.1: Six columns specified
- AC-5.2.2: Default sort by interest saved
- AC-5.2.3: Column header click toggles sort
- AC-5.2.4: Baseline row visually distinct
- AC-5.2.5: Recommended row teal highlight
- AC-5.2.6: Effort badges with semantic colors
- AC-5.2.7: Mobile converts to cards or horizontal scroll

### Learnings from Previous Story

**From Story 5.1 (Status: done)**

- **Available Infrastructure:**
  - `useStrategies()` hook provides `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`
  - Results already sorted by interestSaved descending from calculationStore
  - `formatCurrency` and `formatDate` utilities available in `src/lib/format/`

- **Scroll Target:**
  - Story 5.1 implemented scroll-to-table with `id="comparison-table"` target
  - ComparisonTable MUST have this id attribute for scroll functionality to work

- **Component Patterns:**
  - Use shadcn/ui Card, Badge, Skeleton components (already imported)
  - Follow same animate-in pattern for consistency
  - Use same loading skeleton approach

- **Test Infrastructure:**
  - 1349 tests passing
  - Build succeeds (662KB bundle)
  - Testing patterns established - follow same structure

- **bestStrategy as recommendedId:**
  - Until Story 5.5 recommendation engine is implemented, use `bestStrategy.strategyId` as the recommendedId
  - bestStrategy is the strategy with highest interestSaved

[Source: docs/sprint-artifacts/5-1-implement-winners-podium-component.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `src/components/strategies/ComparisonTable.tsx` - Main table component
- `tests/components/strategies/ComparisonTable.test.tsx` - Component tests

**Files to Modify:**
- `src/components/strategies/index.ts` - Export ComparisonTable
- `src/pages/ComparePage.tsx` - Integrate ComparisonTable below WinnersPodium

### Sorting Implementation Notes

```typescript
type SortColumn = 'strategyName' | 'debtFreeDate' | 'totalInterestPaid' | 'interestSaved' | 'monthsSaved' | 'effortLevel';
type SortDirection = 'asc' | 'desc';

interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

// Effort level sort order: low < medium < high
const effortOrder = { low: 1, medium: 2, high: 3 };
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ Strategy Comparison                                                         │
├────────────┬──────────────┬───────────────┬─────────────┬────────┬─────────┤
│ Strategy ↓ │ Debt-Free    │ Total Interest│ Interest    │ Months │ Effort  │
│ Name       │ Date         │ Paid          │ Saved       │ Saved  │ Rating  │
├────────────┼──────────────┼───────────────┼─────────────┼────────┼─────────┤
│ ★ Velocity │ 15/03/2027   │ R 45,230      │ R 87,500    │ 42     │ [High]  │ ← Recommended (teal)
│ Banking    │              │               │             │        │         │
├────────────┼──────────────┼───────────────┼─────────────┼────────┼─────────┤
│ Hybrid     │ 22/06/2027   │ R 52,100      │ R 80,630    │ 38     │ [Med]   │
│ Avalanche  │              │               │             │        │         │
├────────────┼──────────────┼───────────────┼─────────────┼────────┼─────────┤
│ Avalanche  │ 08/09/2028   │ R 78,450      │ R 54,280    │ 24     │ [Low]   │
├────────────┼──────────────┼───────────────┼─────────────┼────────┼─────────┤
│ Baseline   │ 15/12/2030   │ R 132,730     │ R 0         │ 0      │ [Low]   │ ← Baseline (gray)
└────────────┴──────────────┴───────────────┴─────────────┴────────┴─────────┘
```

### Existing Utilities to Use

- `formatCurrency(amount)` from `src/lib/format/currency.ts` - ZAR formatting
- `formatDate(date)` from `src/lib/format/date.ts` - SA DD/MM/YYYY format
- `Badge` from shadcn/ui for effort ratings
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from shadcn/ui
- `Button` from shadcn/ui for Select button
- `Skeleton` from shadcn/ui for loading state
- `ChevronUp`, `ChevronDown` from lucide-react for sort indicators

### References

- [Source: docs/epics.md#Story-5.2] - Original story definition
- [Source: docs/prd.md#FR24] - "User can view side-by-side comparison of all calculated strategies"
- [Source: docs/prd.md#FR25] - "System displays key comparison metrics"
- [Source: docs/prd.md#FR28] - "System assigns effort rating to each strategy"
- [Source: docs/ux-design-specification.md#2.2] - Novel UX Patterns - Sortable table
- [Source: docs/architecture.md#Project-Structure] - Component locations
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Story-5.2] - Authoritative acceptance criteria
- [Source: docs/sprint-artifacts/5-1-implement-winners-podium-component.md] - Previous story context

## Dev Agent Record

### Context Reference

- `docs/sprint-artifacts/5-2-implement-strategy-comparison-table.context.xml`

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

N/A

### Completion Notes List

- All 10 ACs implemented and tested
- 43 unit tests covering all acceptance criteria
- Desktop table with sortable columns (6 data columns + Action)
- Mobile card layout with responsive breakpoint at 640px
- Effort badges with semantic colors (green/amber/red)
- Baseline row with muted gray styling and "Baseline" badge
- Recommended row with teal highlight and star icon
- Loading skeleton with proper ARIA attributes
- Select button placeholder (disabled until Story 5.6)
- Scroll target id="comparison-table" for podium integration

### File List

**Created:**
- `src/components/strategies/ComparisonTable.tsx` (369 lines)
- `tests/components/strategies/ComparisonTable.test.tsx` (773 lines)

**Modified:**
- `src/components/strategies/index.ts` - Added ComparisonTable export
- `src/pages/ComparePage.tsx` - Integrated ComparisonTable below WinnersPodium

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 5 tech-spec, PRD (FR24, FR25, FR28), UX Design, Architecture, and Story 5.1 learnings | SM Agent (Bob) |
| 2025-12-05 | Implementation complete - all 12 tasks done, 43 tests passing, build successful | Dev Agent (Amelia) |
