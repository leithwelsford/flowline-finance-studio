# Story 5.1: Implement Winner's Podium Component

Status: ready-for-dev

## Story

As a **user**,
I want **to see the top 3 debt payoff strategies highlighted visually on a podium**,
so that **I immediately know which approaches perform best for my situation without scanning a full table of results**.

## Acceptance Criteria

1. **AC-5.1.1:** Given strategies have been calculated (via `useStrategies` hook), when I view the Compare page, then I see a "Winner's Podium" component showing the top 3 strategies ranked by interest saved (highest savings = 1st place).

2. **AC-5.1.2:** The podium displays for each position (1st, 2nd, 3rd):
   - Strategy name
   - Interest saved vs baseline (ZAR formatted)
   - Debt-free date (SA DD/MM/YYYY format)

3. **AC-5.1.3:** Visual layout follows Olympic podium style:
   - 1st place: Center position, tallest (largest card)
   - 2nd place: Left position, medium height
   - 3rd place: Right position, shortest height

4. **AC-5.1.4:** If the recommended strategy (from recommendation engine) is in 1st place, it displays a "Recommended" badge (teal Badge component from shadcn/ui).

5. **AC-5.1.5:** Clicking a podium position scrolls the page to the detailed comparison table (smooth scroll behavior).

6. **AC-5.1.6:** Podium uses the Balanced Teal theme:
   - Cards use teal-600 (#0d9488) accent for 1st place
   - Gold/Silver/Bronze visual indicators (CSS colors: #FFD700, #C0C0C0, #CD7F32)
   - Text follows semantic colors from UX spec

7. **AC-5.1.7:** If fewer than 3 valid strategies exist (e.g., no flexi facility), the podium gracefully displays only the available strategies (2 or 1) without empty placeholders.

8. **AC-5.1.8:** Component is responsive:
   - Desktop (>1024px): Horizontal podium layout
   - Mobile (<640px): Vertical stacked layout (1st on top, then 2nd, then 3rd)

9. **AC-5.1.9:** Podium animates entrance with subtle fade-in using Tailwind CSS animate-in class.

10. **AC-5.1.10:** Component shows skeleton loading state while `isCalculating` is true from calculation store.

## Tasks / Subtasks

- [ ] Task 1: Create WinnersPodium component structure (AC: 1, 2, 3)
  - [ ] Create `src/components/strategies/WinnersPodium.tsx`
  - [ ] Define props interface: `strategies: StrategyProjection[]`, `recommendedId?: string`
  - [ ] Implement sorting to get top 3 by `interestSaved` descending
  - [ ] Create podium layout with 3 position slots (1st center, 2nd left, 3rd right)
  - [ ] Use shadcn/ui Card component for each position

- [ ] Task 2: Create PodiumPosition sub-component (AC: 2, 6)
  - [ ] Create position component showing: rank, strategy name, interest saved, debt-free date
  - [ ] Style each position with appropriate height (1st tallest, 3rd shortest)
  - [ ] Apply medal color indicators (gold/silver/bronze)
  - [ ] Use `formatCurrency` for ZAR amounts, `formatDate` for dates

- [ ] Task 3: Implement recommended badge logic (AC: 4)
  - [ ] Accept `recommendedId` prop
  - [ ] Compare 1st place strategy ID with recommendedId
  - [ ] Conditionally render "Recommended" Badge from shadcn/ui

- [ ] Task 4: Implement scroll-to-table functionality (AC: 5)
  - [ ] Add `onClick` handler to each podium position
  - [ ] Use `scrollIntoView({ behavior: 'smooth' })` to scroll to comparison table
  - [ ] Ensure comparison table has appropriate `id` attribute for scroll target

- [ ] Task 5: Handle edge cases for fewer than 3 strategies (AC: 7)
  - [ ] Check strategies array length
  - [ ] Render 1 or 2 positions if fewer strategies available
  - [ ] Maintain layout integrity (no empty/broken positions)

- [ ] Task 6: Implement responsive layout (AC: 8)
  - [ ] Desktop: `flex-row` with center position elevated
  - [ ] Mobile: `flex-col` stack with 1st at top
  - [ ] Use Tailwind responsive classes (`md:flex-row`, etc.)

- [ ] Task 7: Add entrance animation (AC: 9)
  - [ ] Apply `animate-in fade-in` Tailwind classes
  - [ ] Stagger animation for each position (optional enhancement)

- [ ] Task 8: Implement loading state (AC: 10)
  - [ ] Create loading skeleton version of podium
  - [ ] Use shadcn/ui Skeleton component
  - [ ] Show skeleton when `isCalculating` is true

- [ ] Task 9: Write unit tests for WinnersPodium
  - [ ] Test: Renders 3 strategies in correct order
  - [ ] Test: First place shows recommended badge when applicable
  - [ ] Test: Handles 2 or 1 strategy gracefully
  - [ ] Test: Clicking triggers scroll
  - [ ] Test: Loading state displays skeleton

- [ ] Task 10: Integrate with ComparePage
  - [ ] Import WinnersPodium into `src/pages/ComparePage.tsx`
  - [ ] Connect to `useStrategies` hook for data
  - [ ] Position above comparison table
  - [ ] Verify full flow from calculation to display

- [ ] Task 11: Verify build and all tests pass (AC: all)
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
│       ├── WinnersPodium.tsx       # NEW: Podium visualization
│       ├── PodiumPosition.tsx      # NEW: Individual position (optional sub-component)
│       └── index.ts                # MODIFY: Export WinnersPodium
├── pages/
│   └── ComparePage.tsx             # MODIFY: Add WinnersPodium integration
```

**Data Flow:**
```
calculationStore.results (StrategyProjection[])
    │
    ├── useStrategies() hook
    │       ├── strategies - array of calculated projections
    │       └── bestStrategy - highest interest savings
    │
    └── WinnersPodium component
            ├── Sort by interestSaved
            ├── Take top 3
            └── Render podium positions
```

### UX Spec Alignment

From [ux-design-specification.md](../ux-design-specification.md):

**Section 2.2 Novel UX Patterns:**
> Level 1 (Overview): Visual "winner's podium" showing top 3 strategies by interest saved

**Section 6.1 Component Strategy - Custom Components:**
> WinnersPodium - Visual display of top 3 strategies
> - Props: strategies (array of top 3)

### Tech Spec Alignment

From [tech-spec-epic-5.md](./tech-spec-epic-5.md):

**Story 5.1 Acceptance Criteria (Authoritative):**
- AC-5.1.1: Top 3 by interest saved
- AC-5.1.2: Display name, interest saved, debt-free date
- AC-5.1.3: Center tallest, left medium, right shortest
- AC-5.1.4: Recommended badge on 1st if applicable
- AC-5.1.5: Click scrolls to comparison table

### Learnings from Previous Story

**From Story 4.8 (Status: done)**

- **Available Infrastructure:**
  - `useStrategies()` hook provides `{ strategies, baseline, isCalculating, calculateStrategies, bestStrategy }`
  - `calculationStore` holds StrategyProjection[] results (already sorted by interestSaved descending)
  - Results already sorted by interest saved in orchestrator

- **Key Implementation Insight:**
  - Results from `useStrategies().strategies` are already sorted by `interestSaved` descending
  - Simply take first 3 items for podium (no re-sorting needed)
  - `bestStrategy` from hook can be used as `recommendedId` initially (until recommendation engine in Story 5.5)

- **Test Infrastructure:**
  - 1306 tests passing
  - Build succeeds (641KB bundle)
  - Testing patterns established in `tests/hooks/useStrategies.test.ts`

- **Performance:**
  - Strategy calculation <82ms (well under 3 second target)
  - UI updates should be instantaneous

[Source: docs/sprint-artifacts/4-8-create-strategy-calculation-orchestrator.md#Dev-Agent-Record]

### Project Structure Notes

**Files to Create:**
- `src/components/strategies/WinnersPodium.tsx` - Main podium component
- `tests/components/strategies/WinnersPodium.test.tsx` - Component tests

**Files to Modify:**
- `src/components/strategies/index.ts` - Export WinnersPodium
- `src/pages/ComparePage.tsx` - Integrate WinnersPodium

### Visual Reference

Podium layout concept:
```
        ┌───────────┐
        │    1st    │  ← Tallest (center)
        │   Gold    │
   ┌────┴───────────┴────┐
   │ 2nd │         │ 3rd │
   │Silver│        │Bronze│
   └──────┘        └──────┘
     Left           Right
```

### Existing Utilities to Use

- `formatCurrency(amount)` from `src/lib/format/currency.ts`
- `formatDate(date)` from `src/lib/format/date.ts`
- `Badge` from shadcn/ui for "Recommended" label
- `Card`, `CardHeader`, `CardContent` from shadcn/ui
- `Skeleton` from shadcn/ui for loading state

### References

- [Source: docs/epics.md#Story-5.1] - Original story definition
- [Source: docs/prd.md#FR24] - "User can view side-by-side comparison of all calculated strategies"
- [Source: docs/ux-design-specification.md#2.2] - Novel UX Patterns - Winner's Podium
- [Source: docs/architecture.md#Project-Structure] - Component locations
- [Source: docs/sprint-artifacts/tech-spec-epic-5.md#Story-5.1] - Authoritative acceptance criteria
- [Source: docs/sprint-artifacts/4-8-create-strategy-calculation-orchestrator.md] - Previous story with useStrategies hook

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/5-1-implement-winners-podium-component.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 5 tech-spec, PRD (FR24), UX Design (Section 2.2), Architecture, and Story 4.8 learnings | SM Agent (Bob) |
