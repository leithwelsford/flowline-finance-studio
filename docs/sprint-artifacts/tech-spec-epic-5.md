# Epic Technical Specification: Strategy Comparison & Recommendations

Date: 2025-12-05
Author: Leith
Epic ID: 5
Status: Draft

---

## Overview

Epic 5 delivers the visual comparison interface that shows all debt payoff strategies side-by-side with charts, metrics, and recommendations. This is the "aha moment" of Flowline Finance Studio - where users see 8 different debt strategies compared visually against their real financial data, understand which approach saves the most money and time, and receive a data-driven recommendation.

Building directly on Epic 4's calculation engine (which computes StrategyProjection results for all strategies), this epic creates the Compare page with Winner's Podium visualization, detailed comparison table, interactive charts (debt reduction curves, interest comparison), recommendation engine, and filtering/selection capabilities.

## Objectives and Scope

### In Scope

- **Story 5.1:** Winner's Podium Component - Visual display of top 3 strategies by interest saved
- **Story 5.2:** Strategy Comparison Table - Side-by-side metrics for all 8 strategies with sorting
- **Story 5.3:** Debt Reduction Curve Chart - Recharts line chart showing all strategy trajectories
- **Story 5.4:** Interest Comparison Bar Chart - Horizontal bar chart comparing total interest paid
- **Story 5.5:** Recommendation Engine - Algorithm identifying optimal strategy based on savings/effort/risk
- **Story 5.6:** Strategy Selection & Filtering - Filter controls and strategy selection for tracking

### Out of Scope

- Progress tracking visualization (Epic 6)
- Strategy recalculation (handled by Epic 4's engine)
- SARB rate simulation UI (FR12 configuration in Epic 4)
- Data entry (Epic 2)
- Dashboard integration (Epic 3 already provides quick actions)

## System Architecture Alignment

### Components Referenced

| Component | Location | Purpose |
|-----------|----------|---------|
| calculationStore | `src/store/calculationStore.ts` | Zustand store holding StrategyProjection[] results |
| useStrategies | `src/hooks/useStrategies.ts` | Hook triggering calculation and returning results |
| StrategyProjection | `src/lib/calculations/types.ts` | Interface defining strategy result structure |
| ComparePage | `src/pages/ComparePage.tsx` | Page-level component for strategy comparison |

### Architectural Constraints

- **Client-side only:** All comparison logic runs in browser
- **Recharts for visualization:** Use Recharts library (already installed) for all charts
- **Zustand for UI state:** Strategy selection, filters stored in uiStore
- **big.js for calculations:** Any derived metrics use big.js precision
- **shadcn/ui components:** Use Card, Table, Badge, Button, Select from component library
- **Balanced Teal theme:** Follow UX spec color system (teal-600 primary, semantic colors)

---

## Detailed Design

### Services and Modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| WinnersPodium | `src/components/strategies/WinnersPodium.tsx` | Display top 3 strategies visually |
| ComparisonTable | `src/components/strategies/ComparisonTable.tsx` | Sortable table of all strategies |
| DebtReductionChart | `src/components/charts/DebtReductionChart.tsx` | Line chart of debt curves |
| InterestComparisonChart | `src/components/charts/InterestComparisonChart.tsx` | Horizontal bar chart |
| RecommendationCard | `src/components/strategies/RecommendationCard.tsx` | Highlighted recommendation display |
| StrategyFilters | `src/components/strategies/StrategyFilters.tsx` | Filter controls (effort, savings) |
| recommendation.ts | `src/lib/calculations/recommendation.ts` | Algorithm for optimal strategy |

### Data Models and Contracts

```typescript
// Already defined in src/lib/calculations/types.ts
interface StrategyProjection {
  strategyId: string;
  strategyName: string;
  effortLevel: 'low' | 'medium' | 'high';
  debtFreeMonth: number;
  debtFreeDate: string;
  totalInterestPaid: Big;
  monthsSaved: number;        // vs baseline
  interestSaved: Big;         // vs baseline
  monthlyProjections: MonthlyProjection[];
}

// New types for Epic 5
interface StrategyComparisonFilters {
  effortLevels: ('low' | 'medium' | 'high')[];  // empty = show all
  minimumSavings: Big | null;                    // null = no minimum
}

interface RecommendationResult {
  recommendedStrategyId: string;
  score: number;
  rationale: string;
}

// Store additions to uiStore
interface UIStore {
  // ... existing fields
  selectedStrategyId: string | null;
  comparisonFilters: StrategyComparisonFilters;
  setSelectedStrategy: (id: string | null) => void;
  setComparisonFilters: (filters: StrategyComparisonFilters) => void;
}
```

### APIs and Interfaces

**No external APIs.** All data flows from calculationStore (Epic 4 results).

**Internal Data Flow:**

```
calculationStore.strategyResults (StrategyProjection[])
    │
    ├── WinnersPodium: Top 3 by interestSaved
    │
    ├── ComparisonTable: All strategies, sorted by column
    │
    ├── DebtReductionChart: monthlyProjections for each strategy
    │
    ├── InterestComparisonChart: totalInterestPaid per strategy
    │
    ├── recommendation.ts → RecommendationCard
    │
    └── StrategyFilters → filtered view applied to all components
```

### Workflows and Sequencing

**User Flow: View Comparison**

```
1. User navigates to Compare page
2. calculationStore checked for results
   - If empty: show "Calculate Strategies" button
   - If populated: render comparison components
3. Winner's Podium renders immediately (top 3)
4. Comparison table renders with default sort (interest saved desc)
5. Charts render with all strategies
6. Recommendation card highlights optimal strategy
```

**User Flow: Filter and Select**

```
1. User adjusts effort filter (e.g., "Low effort only")
2. Filter state updates in uiStore
3. All components re-render with filtered data
4. User clicks "Select Strategy" on preferred strategy
5. selectedStrategyId stored in uiStore + persisted to Dexie settings
6. Toast confirms: "Strategy selected: [name]"
7. Optional: Navigate to Track page
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Strategy |
|--------|--------|----------|
| Chart rendering | < 2 seconds | Recharts with memoization |
| Table sorting | < 200ms | Client-side array sort |
| Filter application | < 100ms | Derived state in component |
| Initial page load | < 1 second | Lazy load charts if needed |

**NFR-P3 Reference:** Chart rendering must complete within 2 seconds for 12-36 months of data.

### Security

- **No sensitive data exposure:** Strategy comparisons use already-calculated results
- **Local storage only:** Selected strategy persisted to IndexedDB, never transmitted
- **NFR-S1 aligned:** No external API calls in comparison flow

### Reliability/Availability

- **Calculation dependency:** If calculationStore empty, gracefully show "no results" state
- **Strategy selection persistence:** Use Dexie settings table for durability
- **Consistent results:** Same inputs produce identical comparison views (NFR-R3)

### Observability

- **Logging:** Log strategy selection events to console
- **Error handling:** If chart data is malformed, show error state instead of crashing
- **Result type pattern:** Use Result<T, E> for recommendation calculation

---

## Dependencies and Integrations

### Package Dependencies (already installed)

| Package | Version | Purpose |
|---------|---------|---------|
| recharts | ^3.5.1 | Line and bar chart visualization |
| zustand | ^5.0.8 | UI state management (filters, selection) |
| big.js | ^7.0.1 | Precision calculations for derived metrics |
| lucide-react | ^0.555.0 | Icons for effort badges, podium |
| date-fns | ^4.1.0 | Date formatting for debt-free dates |

### Internal Dependencies

| Dependency | Location | Required By |
|------------|----------|-------------|
| calculationStore | `src/store/calculationStore.ts` | All comparison components |
| StrategyProjection | `src/lib/calculations/types.ts` | Type definitions |
| formatCurrency | `src/lib/format/currency.ts` | ZAR formatting |
| formatDate | `src/lib/format/date.ts` | SA date formatting |
| useStrategies | `src/hooks/useStrategies.ts` | Triggering calculations |

### shadcn/ui Components Required

- Card, CardHeader, CardContent, CardTitle
- Table, TableHeader, TableBody, TableRow, TableHead, TableCell
- Badge (effort ratings)
- Button (select strategy, filter toggles)
- Select (filter dropdowns)
- Skeleton (loading states)

---

## Acceptance Criteria (Authoritative)

### Story 5.1: Winner's Podium Component

1. **AC-5.1.1:** Given strategies are calculated, when I view Compare page, then I see a podium showing top 3 strategies by interest saved
2. **AC-5.1.2:** Podium displays: strategy name, interest saved (ZAR), debt-free date for each position
3. **AC-5.1.3:** 1st place is center (tallest), 2nd left (medium), 3rd right (shortest)
4. **AC-5.1.4:** Recommended strategy (if 1st) shows "Recommended" badge
5. **AC-5.1.5:** Clicking podium position scrolls to comparison table

### Story 5.2: Strategy Comparison Table

1. **AC-5.2.1:** Table shows columns: Strategy Name, Debt-Free Date, Total Interest Paid, Interest Saved vs Baseline, Months Saved, Effort Rating
2. **AC-5.2.2:** Default sort is by interest saved (best first)
3. **AC-5.2.3:** Clicking column header toggles sort ascending/descending
4. **AC-5.2.4:** Baseline row is visually distinct (gray/muted)
5. **AC-5.2.5:** Recommended strategy row has teal highlight
6. **AC-5.2.6:** Effort rating shows as badge (green=Low, amber=Medium, red=High)
7. **AC-5.2.7:** On mobile, table converts to cards or horizontal scroll

### Story 5.3: Debt Reduction Curve Chart

1. **AC-5.3.1:** Line chart with X-axis = months, Y-axis = total debt (ZAR)
2. **AC-5.3.2:** One line per strategy with distinct colors
3. **AC-5.3.3:** Baseline shows as dashed gray line
4. **AC-5.3.4:** Recommended strategy shows as solid teal line
5. **AC-5.3.5:** Hover tooltip shows exact values at data point
6. **AC-5.3.6:** Legend allows toggling strategies on/off
7. **AC-5.3.7:** Chart renders in under 2 seconds

### Story 5.4: Interest Comparison Bar Chart

1. **AC-5.4.1:** Horizontal bar chart with Y-axis = strategy names, X-axis = total interest (ZAR)
2. **AC-5.4.2:** Bars sorted by interest (lowest/best at top)
3. **AC-5.4.3:** Each bar shows ZAR amount at end
4. **AC-5.4.4:** Top performers use teal gradient, baseline is gray
5. **AC-5.4.5:** Savings vs baseline shown as annotation

### Story 5.5: Recommendation Engine

1. **AC-5.5.1:** Algorithm scores strategies based on: interest savings (primary), effort level (secondary), risk profile (tertiary)
2. **AC-5.5.2:** Scoring formula: score = interestSaved - effortPenalty - riskPenalty
3. **AC-5.5.3:** Effort penalties: high=-5000, medium=-2000, low=0
4. **AC-5.5.4:** Risk penalties: flexi-required=-1000, no-flexi=0
5. **AC-5.5.5:** Recommendation card shows: "Recommended for You" header, strategy name, key metrics, rationale
6. **AC-5.5.6:** If no flexi facility, flexi strategies excluded from recommendation

### Story 5.6: Strategy Selection and Filter

1. **AC-5.6.1:** Filter by effort level: show only Low, Medium, or High
2. **AC-5.6.2:** Filter by minimum savings threshold
3. **AC-5.6.3:** Filters apply to table and charts
4. **AC-5.6.4:** "Select Strategy" button on each strategy row
5. **AC-5.6.5:** Selection saves to Dexie settings and uiStore
6. **AC-5.6.6:** Toast confirms: "Strategy selected: [name]"
7. **AC-5.6.7:** Optional navigation to Track page after selection

---

## Traceability Mapping

| AC | Spec Section | Component | Test Idea |
|----|--------------|-----------|-----------|
| AC-5.1.1 | WinnersPodium | WinnersPodium.tsx | Render with 3 strategies, verify order |
| AC-5.1.4 | WinnersPodium | WinnersPodium.tsx | First place shows badge when recommended |
| AC-5.2.1 | ComparisonTable | ComparisonTable.tsx | All columns present |
| AC-5.2.3 | ComparisonTable | ComparisonTable.tsx | Click header, verify sort order changes |
| AC-5.2.6 | ComparisonTable | Badge | Effort colors correct |
| AC-5.3.1 | DebtReductionChart | DebtReductionChart.tsx | Axes labeled correctly |
| AC-5.3.5 | DebtReductionChart | Recharts Tooltip | Hover shows values |
| AC-5.4.2 | InterestComparisonChart | InterestComparisonChart.tsx | Bars sorted correctly |
| AC-5.5.2 | recommendation.ts | recommendation.ts | Unit test scoring formula |
| AC-5.5.5 | RecommendationCard | RecommendationCard.tsx | Displays rationale |
| AC-5.6.5 | StrategyFilters | uiStore + Dexie | Selection persists across reload |
| AC-5.6.6 | Toast | Sonner toast | Toast appears on selection |

---

## Risks, Assumptions, Open Questions

### Risks

1. **Risk:** Chart performance with 360 months of data may be slow
   - **Mitigation:** Sample every 3rd data point for long projections

2. **Risk:** Mobile layout for comparison table may be cramped
   - **Mitigation:** Convert to card layout on mobile (< 640px)

3. **Risk:** Color-blind users may struggle with chart lines
   - **Mitigation:** Use distinct line styles (solid, dashed, dotted) + patterns

### Assumptions

1. Epic 4 calculation engine produces valid StrategyProjection[] array
2. Baseline strategy always exists (never null)
3. At least 3 valid strategies for podium display
4. formatCurrency and formatDate utilities exist from Epic 3

### Open Questions

1. **Q:** Should we limit chart legend items to prevent overflow?
   - **A:** Show all 8 strategies; use scroll if needed. User can toggle off.

2. **Q:** What happens if user has no flexi facility?
   - **A:** Flexi strategies return null; podium/table only shows applicable strategies (5 instead of 8)

---

## Test Strategy Summary

### Unit Tests

| Module | Test Focus |
|--------|------------|
| recommendation.ts | Scoring formula with various inputs |
| Sorting logic | Column sort ascending/descending |
| Filter logic | Effort and savings filtering |

### Component Tests

| Component | Test Focus |
|-----------|------------|
| WinnersPodium | Renders 3 strategies in correct order |
| ComparisonTable | Renders all columns, sorts on click |
| RecommendationCard | Shows rationale, handles no-recommendation |
| StrategyFilters | Filter state updates, components re-render |

### Integration Tests

| Scenario | Coverage |
|----------|----------|
| Full comparison flow | Calculate → View podium → Sort table → Select strategy |
| Filter flow | Apply filter → Verify filtered results in table/charts |
| Selection persistence | Select → Reload → Verify selection restored |

### Visual/Responsive Tests

- Chart rendering on mobile (simplified view)
- Table → Cards conversion on mobile
- Touch targets minimum 44x44px
- Color contrast WCAG AA compliance

---

**End of Epic 5 Technical Specification**
