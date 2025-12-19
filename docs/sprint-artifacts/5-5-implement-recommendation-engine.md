# Story 5.5: Implement Recommendation Engine

Status: review

## Story

As a **user**,
I want **the system to recommend an optimal debt payoff strategy**,
so that **I have data-driven guidance on which approach to follow based on my financial situation**.

## Acceptance Criteria

1. **AC-5.5.1:** Given strategies have been calculated, when I view recommendations, then the algorithm scores strategies based on: interest savings (primary weight), effort level (secondary), and risk profile (tertiary).

2. **AC-5.5.2:** The scoring formula is: `score = interestSaved - effortPenalty - riskPenalty`, where higher scores indicate better recommendations.

3. **AC-5.5.3:** Effort penalties are applied as follows: high effort = -5000, medium effort = -2000, low effort = 0.

4. **AC-5.5.4:** Risk penalties are applied as follows: strategies requiring flexi facility = -1000, strategies not requiring flexi = 0.

5. **AC-5.5.5:** The recommendation displays as a highlighted card showing: "Recommended for You" header, strategy name, key metrics (interest saved, debt-free date, effort level), and rationale explaining why this strategy was chosen.

6. **AC-5.5.6:** If the user has no flexi facility configured, all flexi-based strategies (Flexi Chunking, Aggressive Flexi, Velocity Banking, Hybrid Snowball, Hybrid Avalanche) are excluded from the recommendation algorithm.

7. **AC-5.5.7:** Component shows skeleton loading state while `isCalculating` is true from calculation store.

8. **AC-5.5.8:** If no strategies are calculated (empty results), show an appropriate empty state message prompting user to calculate strategies.

9. **AC-5.5.9:** The recommendation card is visually prominent with teal accent color and positioned at the top of the Compare page.

## Tasks / Subtasks

- [x] Task 1: Create recommendation algorithm module (AC: 1, 2, 3, 4, 6)
  - [x] Create `src/lib/calculations/recommendation.ts`
  - [x] Define `RecommendationResult` interface: `{ recommendedStrategyId: string, score: number, rationale: string }`
  - [x] Define `RecommendationOptions` interface with optional `hasFlexiFacility: boolean`
  - [x] Implement scoring formula: `score = interestSaved.toNumber() - effortPenalty - riskPenalty`
  - [x] Implement effort penalty mapping: `{ high: -5000, medium: -2000, low: 0 }`
  - [x] Implement risk penalty: flexi-required strategies get -1000
  - [x] Filter out flexi strategies when `hasFlexiFacility === false`
  - [x] Return strategy with highest score as recommendation
  - [x] Generate rationale string: "Saves R[X] vs baseline with [effort] effort"

- [x] Task 2: Identify flexi-required strategies (AC: 4, 6)
  - [x] Create constant `FLEXI_REQUIRED_STRATEGY_IDS` listing: 'flexi-chunking', 'aggressive-flexi', 'velocity-banking', 'hybrid-snowball', 'hybrid-avalanche'
  - [x] Use this list for both risk penalty and exclusion logic
  - [x] Ensure baseline and traditional strategies (snowball, avalanche) are never excluded

- [x] Task 3: Create RecommendationCard component structure (AC: 5, 7, 8, 9)
  - [x] Create `src/components/strategies/RecommendationCard.tsx`
  - [x] Define props interface: `{ strategies: StrategyProjection[], baseline: StrategyProjection, hasFlexiFacility: boolean, isLoading?: boolean }`
  - [x] Import recommendation algorithm from `src/lib/calculations/recommendation.ts`
  - [x] Add export to `src/components/strategies/index.ts`

- [x] Task 4: Implement recommendation card UI (AC: 5, 9)
  - [x] Use shadcn/ui Card with teal accent styling (`border-teal-600`, `bg-teal-50`)
  - [x] Add header: "Recommended for You" with Trophy icon from lucide-react
  - [x] Display strategy name prominently
  - [x] Show key metrics: Interest Saved (ZAR), Debt-Free Date, Effort Level badge
  - [x] Display rationale text explaining the recommendation
  - [x] Add "Select This Strategy" button

- [x] Task 5: Implement effort level badge (AC: 5)
  - [x] Reuse Badge component pattern from ComparisonTable
  - [x] Colors: green for Low, amber for Medium, red for High
  - [x] Display effort text: "Low Effort", "Medium Effort", "High Effort"

- [x] Task 6: Implement loading skeleton state (AC: 7)
  - [x] Create skeleton matching card layout
  - [x] Use shadcn/ui Skeleton components
  - [x] Show skeleton when `isLoading` prop is true
  - [x] Add proper aria-busy attribute

- [x] Task 7: Implement empty state (AC: 8)
  - [x] Check if strategies array is empty or recommendation returns null
  - [x] Display empty state with message: "Calculate strategies to see our recommendation"
  - [x] Include Calculator icon from lucide-react
  - [x] Show "Calculate Now" button linking to calculation trigger

- [x] Task 8: Implement strategy selection from card (AC: 5)
  - [x] Add "Select This Strategy" button to card
  - [x] On click, update `selectedStrategyId` in uiStore
  - [x] Persist selection to Dexie settings table
  - [x] Show success toast: "Strategy selected: [name]"
  - [x] Optionally offer navigation to Track page

- [x] Task 9: Write unit tests for recommendation algorithm
  - [x] Test: Returns highest-scoring strategy (AC-5.5.1)
  - [x] Test: Scoring formula calculation is correct (AC-5.5.2)
  - [x] Test: Effort penalties applied correctly (AC-5.5.3)
  - [x] Test: Risk penalties applied for flexi strategies (AC-5.5.4)
  - [x] Test: Flexi strategies excluded when no flexi facility (AC-5.5.6)
  - [x] Test: Rationale string generated correctly (AC-5.5.5)
  - [x] Test: Returns null/empty when no strategies provided

- [x] Task 10: Write component tests for RecommendationCard
  - [x] Test: Renders recommended strategy name and metrics (AC-5.5.5)
  - [x] Test: Shows rationale text (AC-5.5.5)
  - [x] Test: Loading state shows skeleton (AC-5.5.7)
  - [x] Test: Empty state renders when no strategies (AC-5.5.8)
  - [x] Test: Card has teal accent styling (AC-5.5.9)
  - [x] Test: Select button triggers uiStore update

- [x] Task 11: Integrate with ComparePage (AC: 9)
  - [x] Import RecommendationCard into `src/pages/ComparePage.tsx`
  - [x] Position at top of page, before WinnersPodium
  - [x] Pass strategies from `useStrategies` hook
  - [x] Determine `hasFlexiFacility` from useFlexiFacility hook or database
  - [x] Pass isCalculating for loading state

- [x] Task 12: Update useStrategies hook (if needed)
  - [x] Ensure hook exposes baseline strategy for comparison
  - [x] Consider adding `recommendedStrategy` derived value
  - [x] Memoize recommendation calculation to prevent recalculation

- [x] Task 13: Verify build and all tests pass (AC: all)
  - [x] Run `npm run test` - verify all new tests pass
  - [x] Run `npm run build` - verify no type errors
  - [x] Manual test: recommendation displays with real strategy data
  - [x] Verify recommendation changes when flexi facility is removed

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── lib/
│   └── calculations/
│       ├── recommendation.ts         # NEW: Recommendation algorithm
│       └── types.ts                   # RecommendationResult interface (if needed)
├── components/
│   └── strategies/
│       ├── RecommendationCard.tsx    # NEW: Recommendation display card
│       └── index.ts                   # MODIFY: Export RecommendationCard
├── pages/
│   └── ComparePage.tsx                # MODIFY: Add RecommendationCard integration
```

**Data Flow:**
```
calculationStore.results (StrategyProjection[])
    │
    ├── useStrategies() hook
    │       ├── strategies - array of calculated projections
    │       ├── baseline - baseline strategy projection
    │       └── isCalculating - loading state
    │
    ├── useFlexiFacility() hook
    │       └── hasFlexiFacility - boolean for filtering
    │
    └── recommendation.ts algorithm
            ├── Score each applicable strategy
            ├── Apply effort and risk penalties
            ├── Return highest-scoring strategy
            └── Generate rationale string
                    │
                    └── RecommendationCard component
                            ├── Display recommendation details
                            ├── Show rationale
                            └── Select strategy action
```

### Tech Spec Alignment

From [tech-spec-epic-5.md](./tech-spec-epic-5.md):

**Story 5.5 Acceptance Criteria (Authoritative):**
- AC-5.5.1: Algorithm scores strategies based on: interest savings (primary), effort level (secondary), risk profile (tertiary)
- AC-5.5.2: Scoring formula: score = interestSaved - effortPenalty - riskPenalty
- AC-5.5.3: Effort penalties: high=-5000, medium=-2000, low=0
- AC-5.5.4: Risk penalties: flexi-required=-1000, no-flexi=0
- AC-5.5.5: Recommendation card shows: "Recommended for You" header, strategy name, key metrics, rationale
- AC-5.5.6: If no flexi facility, flexi strategies excluded from recommendation

**Technical Notes from Epics:**
> - Create `src/lib/calculations/recommendation.ts`
> - Simple scoring algorithm: score = (interestSaved × 1.0) + (effortPenalty) + (riskPenalty)
> - effortPenalty: high = -5000, medium = -2000, low = 0
> - riskPenalty: flexi-required = -1000, no-flexi = 0
> - Display in `src/components/strategies/RecommendationCard.tsx`

### PRD Requirements Alignment

From [prd.md](../prd.md):

**FR29:** "System provides recommendation identifying optimal strategy based on: best interest savings, acceptable effort level, lowest risk profile"

This story directly implements FR29 by creating an algorithm that weighs these three factors to produce a single recommended strategy.

### Learnings from Previous Story

**From Story 5.4 (Status: done)**

- **Available Infrastructure:**
  - `useStrategies()` hook provides `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`
  - `formatCurrency` utility in `src/lib/format/currency.ts` for ZAR formatting
  - `formatDate` utility for date formatting
  - Badge component pattern for effort levels (green=Low, amber=Medium, red=High)

- **Patterns to Reuse:**
  - Skeleton loading state pattern from chart components
  - Empty state with icon and message pattern
  - Card component with teal accent styling
  - useMemo for expensive calculations
  - Toast notifications for user feedback

- **Files from 5.4:**
  - `src/components/charts/InterestComparisonChart.tsx` - Reference for skeleton/empty patterns
  - `src/pages/ComparePage.tsx` - Integration target
  - `src/components/strategies/ComparisonTable.tsx` - Badge styling reference

[Source: docs/sprint-artifacts/5-4-implement-interest-comparison-bar-chart.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `src/lib/calculations/recommendation.ts` - Recommendation algorithm
- `src/components/strategies/RecommendationCard.tsx` - Display component
- `tests/lib/calculations/recommendation.test.ts` - Algorithm unit tests
- `tests/components/strategies/RecommendationCard.test.tsx` - Component tests

**Files to Modify:**
- `src/components/strategies/index.ts` - Add RecommendationCard export
- `src/pages/ComparePage.tsx` - Integrate RecommendationCard at top
- `src/lib/calculations/types.ts` - Add RecommendationResult interface (optional)

### Algorithm Implementation Notes

```typescript
// src/lib/calculations/recommendation.ts

import Big from 'big.js';
import { StrategyProjection } from './types';

export interface RecommendationResult {
  recommendedStrategyId: string;
  recommendedStrategy: StrategyProjection;
  score: number;
  rationale: string;
}

// Flexi-required strategies (for exclusion and risk penalty)
const FLEXI_REQUIRED_STRATEGY_IDS = [
  'flexi-chunking',
  'aggressive-flexi',
  'velocity-banking',
  'hybrid-snowball',
  'hybrid-avalanche',
];

// Effort penalties
const EFFORT_PENALTIES: Record<'low' | 'medium' | 'high', number> = {
  low: 0,
  medium: -2000,
  high: -5000,
};

// Risk penalty for flexi-required strategies
const FLEXI_RISK_PENALTY = -1000;

export function calculateRecommendation(
  strategies: StrategyProjection[],
  baseline: StrategyProjection,
  hasFlexiFacility: boolean
): RecommendationResult | null {
  // Filter out flexi strategies if no flexi facility
  const applicableStrategies = hasFlexiFacility
    ? strategies
    : strategies.filter(s => !FLEXI_REQUIRED_STRATEGY_IDS.includes(s.strategyId));

  if (applicableStrategies.length === 0) {
    return null;
  }

  // Score each strategy
  const scored = applicableStrategies.map(strategy => {
    const interestSaved = strategy.interestSaved.toNumber();
    const effortPenalty = EFFORT_PENALTIES[strategy.effortLevel];
    const riskPenalty = FLEXI_REQUIRED_STRATEGY_IDS.includes(strategy.strategyId)
      ? FLEXI_RISK_PENALTY
      : 0;

    const score = interestSaved + effortPenalty + riskPenalty;

    return { strategy, score };
  });

  // Find highest-scoring strategy
  const best = scored.reduce((a, b) => (a.score > b.score ? a : b));

  // Generate rationale
  const rationale = generateRationale(best.strategy, baseline);

  return {
    recommendedStrategyId: best.strategy.strategyId,
    recommendedStrategy: best.strategy,
    score: best.score,
    rationale,
  };
}

function generateRationale(strategy: StrategyProjection, baseline: StrategyProjection): string {
  const saved = strategy.interestSaved;
  const effort = strategy.effortLevel;

  return `Saves R${saved.toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')} vs baseline with ${effort} effort`;
}
```

### Visual Reference

```
┌─────────────────────────────────────────────────────────────────┐
│ 🏆 Recommended for You                                   [teal] │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Debt Avalanche Strategy                                         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │ Interest     │  │ Debt-Free    │  │ Effort       │           │
│  │ Saved        │  │ Date         │  │ Level        │           │
│  │ R 45,123     │  │ 15/03/2028   │  │ 🟢 Low       │           │
│  └──────────────┘  └──────────────┘  └──────────────┘           │
│                                                                  │
│  "Saves R45,123 vs baseline with low effort"                     │
│                                                                  │
│  [  Select This Strategy  ]                                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Edge Cases to Handle

1. **No strategies calculated:** Show empty state with "Calculate Now" button
2. **No flexi facility:** Exclude 5 flexi strategies, recommend from remaining 3
3. **Only baseline applicable:** Still recommend baseline (better than nothing)
4. **Tie scores:** Use first strategy in array (deterministic)
5. **All strategies have same effort:** Scoring falls back to interest savings

### References

- [Source: docs/epics.md#Story-5.5] - Original story definition
- [Source: docs/prd.md#FR29] - "System provides recommendation identifying optimal strategy"
- [Source: docs/architecture.md#Novel-Pattern] - Strategy comparison engine
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Story-5.5] - Authoritative acceptance criteria
- [Source: docs/sprint-artifacts/5-4-implement-interest-comparison-bar-chart.md] - Previous story patterns

## Dev Agent Record

### Context Reference

- [5-5-implement-recommendation-engine.context.xml](./5-5-implement-recommendation-engine.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

None required - all tests pass.

### Completion Notes List

1. Implemented recommendation algorithm with scoring formula: `score = interestSaved - effortPenalty - riskPenalty`
2. Effort penalties: high=-5000, medium=-2000, low=0
3. Risk penalty: flexi-required strategies get -1000
4. FLEXI_REQUIRED_STRATEGY_IDS includes 5 strategies: flexi-chunking, aggressive-flexi, velocity-banking, hybrid-snowball, hybrid-avalanche
5. RecommendationCard component displays at top of ComparePage with teal accent styling
6. Skeleton loading state and empty state implemented
7. Select button updates uiStore and shows success toast
8. Algorithm prefers first strategy on tie scores for deterministic behavior
9. All 1509 tests pass, build successful

### File List

**Created:**
- `src/lib/calculations/recommendation.ts` - Recommendation algorithm with scoring formula
- `src/components/strategies/RecommendationCard.tsx` - Recommendation display card component
- `tests/lib/calculations/recommendation.test.ts` - 26 unit tests for algorithm
- `tests/components/strategies/RecommendationCard.test.tsx` - 37 component tests

**Modified:**
- `src/components/strategies/index.ts` - Added RecommendationCard export
- `src/pages/ComparePage.tsx` - Integrated RecommendationCard at top of page

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Story drafted with full context from Epic 5 tech-spec, PRD (FR29), Architecture, and Story 5.4 learnings | SM Agent (Bob) |
| 2025-12-19 | Story context XML generated, status updated to ready-for-dev | SM Agent (Bob) |
| 2025-12-19 | Implementation complete - all 13 tasks done, 63 new tests (26 algorithm + 37 component), build passes | Dev Agent (Amelia) |
