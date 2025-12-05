# Story 5.2: Implement Strategy Comparison Table

Status: drafted

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

- [ ] Task 1: Create ComparisonTable component structure (AC: 1, 10)
  - [ ] Create `src/components/strategies/ComparisonTable.tsx`
  - [ ] Define props interface: `strategies: StrategyProjection[]`, `baselineId: string`, `recommendedId?: string`, `isLoading?: boolean`
  - [ ] Set up shadcn/ui Table structure (Table, TableHeader, TableBody, TableRow, TableHead, TableCell)
  - [ ] Add `id="comparison-table"` to root element for scroll targeting

- [ ] Task 2: Implement table columns and data mapping (AC: 1, 2)
  - [ ] Map StrategyProjection fields to columns:
    - Strategy Name: `strategyName`
    - Debt-Free Date: `debtFreeDate` (formatted via `formatDate`)
    - Total Interest Paid: `totalInterestPaid` (formatted via `formatCurrency`)
    - Interest Saved vs Baseline: `interestSaved` (formatted via `formatCurrency`)
    - Months Saved: `monthsSaved`
    - Effort Rating: `effortLevel`
  - [ ] Default sort by `interestSaved` descending

- [ ] Task 3: Implement column sorting functionality (AC: 3)
  - [ ] Create sort state: `{ column: string, direction: 'asc' | 'desc' }`
  - [ ] Handle column header click to toggle sort
  - [ ] Implement sort comparison for each column type (string, number, Big)
  - [ ] Add sort indicator icons (ChevronUp/ChevronDown from lucide-react)

- [ ] Task 4: Style baseline row distinctly (AC: 4)
  - [ ] Identify baseline row by comparing `strategyId` with `baselineId` prop
  - [ ] Apply muted/gray styling: `bg-muted text-muted-foreground`
  - [ ] Optionally add "Baseline" label or icon

- [ ] Task 5: Highlight recommended strategy row (AC: 5)
  - [ ] Identify recommended row by comparing `strategyId` with `recommendedId` prop
  - [ ] Apply teal highlight: `border-l-4 border-teal-600 bg-teal-50`
  - [ ] Add "Recommended" badge or indicator

- [ ] Task 6: Implement effort rating badges (AC: 6)
  - [ ] Create EffortBadge sub-component or inline logic
  - [ ] Map effort levels to Badge variants:
    - Low: `variant="outline"` with `className="text-green-600 border-green-600"`
    - Medium: `variant="outline"` with `className="text-amber-600 border-amber-600"`
    - High: `variant="outline"` with `className="text-red-600 border-red-600"`
  - [ ] Include effort level text in badge

- [ ] Task 7: Implement responsive mobile layout (AC: 7)
  - [ ] Option A: Horizontal scroll with sticky first column
    - [ ] Use `overflow-x-auto` on table container
    - [ ] Apply `sticky left-0 bg-background` to Strategy Name column
  - [ ] Option B: Convert to card layout on mobile (< 640px)
    - [ ] Create ComparisonCard sub-component
    - [ ] Show/hide table vs cards based on breakpoint
  - [ ] Ensure touch targets minimum 44x44px

- [ ] Task 8: Implement loading skeleton state (AC: 8)
  - [ ] Create TableSkeleton sub-component
  - [ ] Use shadcn/ui Skeleton for header and 6 rows
  - [ ] Show skeleton when `isLoading` prop is true

- [ ] Task 9: Add Select button placeholder (AC: 9)
  - [ ] Add "Select" column with Button component
  - [ ] Button is disabled or shows placeholder (full logic in Story 5.6)
  - [ ] Use small/secondary variant: `<Button variant="outline" size="sm">`

- [ ] Task 10: Write unit tests for ComparisonTable
  - [ ] Test: Renders all 6 data columns
  - [ ] Test: Default sort is by interest saved descending
  - [ ] Test: Clicking column header changes sort order
  - [ ] Test: Baseline row has muted styling
  - [ ] Test: Recommended row has teal highlight
  - [ ] Test: Effort badges have correct colors
  - [ ] Test: Loading state shows skeleton
  - [ ] Test: Table has id="comparison-table"

- [ ] Task 11: Integrate with ComparePage (AC: 1, 10)
  - [ ] Import ComparisonTable into `src/pages/ComparePage.tsx`
  - [ ] Pass strategies from `useStrategies` hook
  - [ ] Pass baseline.strategyId as baselineId
  - [ ] Pass bestStrategy.strategyId as recommendedId (until Story 5.5 recommendation engine)
  - [ ] Position below WinnersPodium component

- [ ] Task 12: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Test responsive behavior in browser devtools

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

<!-- Path(s) to story context XML will be added here by context workflow -->

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 5 tech-spec, PRD (FR24, FR25, FR28), UX Design, Architecture, and Story 5.1 learnings | SM Agent (Bob) |
