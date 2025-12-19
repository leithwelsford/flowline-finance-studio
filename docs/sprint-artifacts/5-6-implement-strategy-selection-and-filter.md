# Story 5.6: Implement Strategy Selection and Filter

Status: ready-for-dev

## Story

As a **user**,
I want **to filter strategies and select one to track**,
so that **I can focus on strategies that match my preferences and commit to tracking my chosen approach**.

## Acceptance Criteria

1. **AC-5.6.1:** Given I'm viewing strategy comparison, when I use effort level filters, then I can filter to show only strategies with Low, Medium, or High effort levels (multi-select or single-select toggle).

2. **AC-5.6.2:** Given I'm viewing strategy comparison, when I set a minimum savings threshold (e.g., R5,000), then only strategies saving at least that amount vs baseline are displayed.

3. **AC-5.6.3:** Given I apply filters, when the comparison table updates, then the WinnersPodium, DebtReductionChart, and InterestComparisonChart also update to show only filtered strategies.

4. **AC-5.6.4:** Given I've decided on a strategy, when I click "Select Strategy" on any strategy row/card, then that strategy is saved as my "tracked strategy" in the uiStore.

5. **AC-5.6.5:** Given I select a strategy, when the selection is saved, then the selection is persisted to Dexie settings table (`{ key: 'selectedStrategy', value: strategyId }`).

6. **AC-5.6.6:** Given I select a strategy, when the action completes, then a success toast appears: "Strategy selected: [strategy name]".

7. **AC-5.6.7:** Given I select a strategy, when the toast is shown, then I'm offered an option to navigate to the Track page (via toast action or modal).

8. **AC-5.6.8:** Given no filters are applied (default state), when I view the Compare page, then all calculated strategies are displayed.

9. **AC-5.6.9:** Given filters result in zero matching strategies, when the table updates, then an empty state message is shown: "No strategies match your filters. Try adjusting your criteria."

10. **AC-5.6.10:** Given I reload the page, when filters were previously applied, then filter state should reset to default (no persistence required for filters).

## Tasks / Subtasks

- [ ] Task 1: Create StrategyFilters component structure (AC: 1, 2, 8)
  - [ ] Create `src/components/strategies/StrategyFilters.tsx`
  - [ ] Define props interface: `{ strategies: StrategyProjection[], onFiltersChange: (filters: FilterState) => void }`
  - [ ] Define `FilterState` type: `{ effortLevels: ('low' | 'medium' | 'high')[], minSavings: number | null }`
  - [ ] Add export to `src/components/strategies/index.ts`

- [ ] Task 2: Implement effort level filter UI (AC: 1)
  - [ ] Create toggle button group for effort levels (Low, Medium, High)
  - [ ] Use shadcn/ui Toggle or ToggleGroup components
  - [ ] Style with effort level colors: green=Low, amber=Medium, red=High
  - [ ] Allow multi-select (all selected by default)
  - [ ] When all deselected, treat as "show all"

- [ ] Task 3: Implement minimum savings threshold filter (AC: 2)
  - [ ] Add numeric input field for minimum savings (ZAR)
  - [ ] Use shadcn/ui Input with currency formatting
  - [ ] Add clear button (X) to reset threshold
  - [ ] Debounce input to prevent excessive re-filtering
  - [ ] Validate: must be >= 0, show error if negative

- [ ] Task 4: Create useStrategyFilters hook (AC: 1, 2, 3, 8, 9)
  - [ ] Create `src/hooks/useStrategyFilters.ts`
  - [ ] Accept strategies array and return filtered strategies + filter state
  - [ ] Implement effort level filtering logic
  - [ ] Implement minimum savings filtering logic
  - [ ] Return empty array when no strategies match (for empty state)
  - [ ] Memoize filtered results

- [ ] Task 5: Integrate filters with ComparisonTable (AC: 3)
  - [ ] Import useStrategyFilters hook in ComparePage
  - [ ] Pass filtered strategies to ComparisonTable
  - [ ] Table rows update based on filter state
  - [ ] Maintain sort state when filters change

- [ ] Task 6: Integrate filters with WinnersPodium (AC: 3)
  - [ ] Pass filtered strategies to WinnersPodium
  - [ ] Podium recalculates top 3 from filtered set
  - [ ] Handle edge cases: <3 strategies, 0 strategies

- [ ] Task 7: Integrate filters with charts (AC: 3)
  - [ ] Pass filtered strategies to DebtReductionChart
  - [ ] Pass filtered strategies to InterestComparisonChart
  - [ ] Charts update to show only filtered strategies
  - [ ] Handle empty filtered set gracefully

- [ ] Task 8: Implement strategy selection in ComparisonTable (AC: 4, 5, 6, 7)
  - [ ] Add "Select" button to each strategy row
  - [ ] On click, update `selectedStrategyId` in uiStore
  - [ ] Persist selection to Dexie settings table
  - [ ] Show success toast with strategy name
  - [ ] Toast includes "View Progress" action button

- [ ] Task 9: Add selection visual indicator (AC: 4)
  - [ ] Highlight selected strategy row in ComparisonTable (teal background/border)
  - [ ] Show checkmark or selected badge on selected row
  - [ ] Sync visual state with uiStore.selectedStrategyId

- [ ] Task 10: Implement empty state for filters (AC: 9)
  - [ ] Create empty state component for zero matches
  - [ ] Display message: "No strategies match your filters"
  - [ ] Include suggestion: "Try adjusting your criteria"
  - [ ] Add "Reset Filters" button

- [ ] Task 11: Add filter controls to ComparePage layout (AC: 1, 2, 8)
  - [ ] Position StrategyFilters above ComparisonTable
  - [ ] Below RecommendationCard and WinnersPodium
  - [ ] Responsive layout: inline on desktop, stacked on mobile
  - [ ] Add subtle border/separator between filters and table

- [ ] Task 12: Write unit tests for useStrategyFilters hook
  - [ ] Test: Returns all strategies when no filters applied (AC-5.6.8)
  - [ ] Test: Filters by effort level correctly (AC-5.6.1)
  - [ ] Test: Filters by minimum savings correctly (AC-5.6.2)
  - [ ] Test: Combines effort and savings filters (AC-5.6.1, AC-5.6.2)
  - [ ] Test: Returns empty array when no matches (AC-5.6.9)
  - [ ] Test: Handles edge cases (empty strategies, null values)

- [ ] Task 13: Write component tests for StrategyFilters
  - [ ] Test: Renders effort level toggles (AC-5.6.1)
  - [ ] Test: Renders savings threshold input (AC-5.6.2)
  - [ ] Test: Calls onFiltersChange when effort levels toggled
  - [ ] Test: Calls onFiltersChange when savings threshold changed
  - [ ] Test: Clear button resets threshold

- [ ] Task 14: Write integration tests for selection flow
  - [ ] Test: Select button updates uiStore (AC-5.6.4)
  - [ ] Test: Selection persists to Dexie (AC-5.6.5)
  - [ ] Test: Success toast appears (AC-5.6.6)
  - [ ] Test: Toast has "View Progress" action (AC-5.6.7)
  - [ ] Test: Selected row has visual highlight (AC-5.6.4)

- [ ] Task 15: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` - verify all new tests pass
  - [ ] Run `npm run build` - verify no type errors
  - [ ] Manual test: filters work with real strategy data
  - [ ] Manual test: selection persists across page navigation
  - [ ] Manual test: charts update when filters applied

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── hooks/
│   └── useStrategyFilters.ts     # NEW: Filter logic hook
├── components/
│   └── strategies/
│       ├── StrategyFilters.tsx   # NEW: Filter controls component
│       ├── ComparisonTable.tsx   # MODIFY: Add Select button, selection highlight
│       └── index.ts              # MODIFY: Export StrategyFilters
├── pages/
│   └── ComparePage.tsx           # MODIFY: Integrate filters, pass filtered strategies
```

**Data Flow:**
```
calculationStore.results (StrategyProjection[])
    │
    ├── useStrategies() hook
    │       └── strategies - array of calculated projections
    │
    ├── useStrategyFilters(strategies)
    │       ├── filteredStrategies - filtered array
    │       ├── filterState - current filter values
    │       └── setFilters - update function
    │
    └── ComparePage
            ├── StrategyFilters (filter controls)
            ├── WinnersPodium (filtered strategies)
            ├── ComparisonTable (filtered strategies + selection)
            ├── DebtReductionChart (filtered strategies)
            └── InterestComparisonChart (filtered strategies)
```

### PRD Requirements Alignment

From [prd.md](../prd.md):

**FR30:** "User can filter comparison view to show only strategies meeting selected criteria (effort level, minimum savings threshold)"

**FR31:** "User can select preferred strategy to track for validation"

This story directly implements both FR30 and FR31, completing Epic 5's core functionality.

### Learnings from Previous Story

**From Story 5.5 (Status: done)**

- **Strategy Selection Already Implemented in RecommendationCard:**
  - `RecommendationCard.tsx:196-210` has "Select This Strategy" button
  - Updates uiStore: `uiStore.getState().setSelectedStrategy(strategyId)`
  - Persists to Dexie: `db.settings.put({ key: 'selectedStrategy', value: strategyId })`
  - Shows toast: `toast.success('Strategy selected: ' + strategyName)`
  - Pattern to REUSE in ComparisonTable

- **Available Infrastructure:**
  - `useStrategies()` hook provides strategies array
  - `useUIStore()` for selectedStrategyId
  - `db.settings` table for persistence
  - `formatCurrency()` for ZAR formatting
  - Badge component pattern for effort levels

- **Files from 5.5:**
  - `src/lib/calculations/recommendation.ts` - FLEXI_REQUIRED_STRATEGY_IDS constant
  - `src/components/strategies/RecommendationCard.tsx` - Selection pattern reference
  - `src/pages/ComparePage.tsx` - Integration target

[Source: docs/sprint-artifacts/5-5-implement-recommendation-engine.md#Dev-Agent-Record]

### UX Design Notes

From [ux-design-specification.md](../ux-design-specification.md):

- Use shadcn/ui ToggleGroup for effort level filters
- Use shadcn/ui Input with currency formatting for savings threshold
- Effort badge colors: green=Low, amber=Medium, red=High (from Section 1.2)
- Filter controls should be visually subtle, not compete with charts
- Responsive: inline on desktop, stacked on mobile

### Technical Implementation Notes

**FilterState Type:**
```typescript
// src/hooks/useStrategyFilters.ts

export interface FilterState {
  effortLevels: ('low' | 'medium' | 'high')[];
  minSavings: number | null;
}

export function useStrategyFilters(strategies: StrategyProjection[]) {
  const [filters, setFilters] = useState<FilterState>({
    effortLevels: ['low', 'medium', 'high'], // All selected by default
    minSavings: null,
  });

  const filteredStrategies = useMemo(() => {
    return strategies.filter(strategy => {
      // Effort level filter
      if (filters.effortLevels.length > 0 &&
          !filters.effortLevels.includes(strategy.effortLevel)) {
        return false;
      }

      // Minimum savings filter
      if (filters.minSavings !== null &&
          strategy.interestSaved.toNumber() < filters.minSavings) {
        return false;
      }

      return true;
    });
  }, [strategies, filters]);

  return { filteredStrategies, filters, setFilters };
}
```

**Selection Handler Pattern (from RecommendationCard):**
```typescript
const handleSelectStrategy = async (strategy: StrategyProjection) => {
  // Update UI store
  useUIStore.getState().setSelectedStrategy(strategy.strategyId);

  // Persist to Dexie
  await db.settings.put({
    key: 'selectedStrategy',
    value: strategy.strategyId
  });

  // Show toast with action
  toast.success(`Strategy selected: ${strategy.strategyName}`, {
    action: {
      label: 'View Progress',
      onClick: () => {
        useUIStore.getState().setCurrentPage('track');
      },
    },
  });
};
```

### Visual Reference

**Filter Controls Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Filter Strategies                                                │
│                                                                  │
│  Effort Level:  [Low ✓] [Medium ✓] [High ✓]                     │
│                                                                  │
│  Minimum Savings: [R 5,000        ] [✕]                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Strategy         │ Debt-Free │ Interest │ Saved │ Effort │      │
├──────────────────┼───────────┼──────────┼───────┼────────┼──────┤
│ ✓ Avalanche      │ 15/03/28  │ R45,123  │R12.5K │ 🟢 Low │Select│
│   Snowball       │ 18/06/28  │ R48,000  │R10.1K │ 🟢 Low │Select│
│   Flexi-Avalanche│ 12/01/28  │ R42,000  │R16.1K │ 🟡 Med │Select│
└─────────────────────────────────────────────────────────────────┘
```

### Edge Cases to Handle

1. **All effort levels deselected:** Treat as "show all" (don't hide everything)
2. **Threshold exceeds max savings:** Show empty state
3. **Negative threshold entered:** Validate and reject
4. **0 strategies after filter:** Show empty state with reset option
5. **Selecting already-selected strategy:** No-op or show "Already selected" toast
6. **Filter + baseline only:** Still show baseline even if savings = 0

### References

- [Source: docs/epics.md#Story-5.6] - Original story definition
- [Source: docs/prd.md#FR30] - "User can filter comparison view"
- [Source: docs/prd.md#FR31] - "User can select preferred strategy to track"
- [Source: docs/architecture.md#Implementation-Patterns] - Naming conventions, error handling
- [Source: docs/sprint-artifacts/5-5-implement-recommendation-engine.md] - Selection pattern reference

## Dev Agent Record

### Context Reference

- [5-6-implement-strategy-selection-and-filter.context.xml](5-6-implement-strategy-selection-and-filter.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Story drafted with full context from Epic 5, PRD (FR30, FR31), Architecture, UX Design, and Story 5.5 learnings | SM Agent (Bob) |
