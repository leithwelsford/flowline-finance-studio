# Story 3.4: Assemble Dashboard Page with Three Numbers Grid

Status: ready-for-dev

## Story

As a **user**,
I want **the dashboard to be my primary landing page with a three-column grid of financial health cards**,
so that **I immediately see my financial health when I open the app**.

## Acceptance Criteria

1. **AC-3.4.1:** Given I open the application, when the app loads, then I land on the Dashboard page (not a login screen or blank page)

2. **AC-3.4.2:** Page header shows "Financial Health Dashboard" with current date in SA format (DD/MM/YYYY)

3. **AC-3.4.3:** Three Numbers Grid displays:
   - 3-column layout on desktop (≥1024px)
   - 2-column layout on tablet (768px-1023px)
   - 1-column layout on mobile (<768px)

4. **AC-3.4.4:** Cards animate in with subtle fade (Tailwind animate-in, fade-in, slide-in-from-bottom)

5. **AC-3.4.5:** Quick Actions section includes:
   - "Update Balances" button (links to Data Entry page, balance update section)
   - "View Full Comparison" button (links to Compare page) - disabled if no accounts

6. **AC-3.4.6:** All monetary values formatted as ZAR (R X,XXX.XX) using formatCurrency utility

7. **AC-3.4.7:** Empty state shown if no financial data entered:
   - Friendly message: "Let's get started!"
   - Prompt to add first account
   - CTA button: "Add Your First Account" linking to Data Entry

8. **AC-3.4.8:** Loading state with skeleton placeholders for all three cards while data loads

## Tasks / Subtasks

- [ ] Task 1: Create ThreeNumbersGrid component (AC: 3, 4)
  - [ ] Create `src/components/dashboard/ThreeNumbersGrid.tsx`
  - [ ] Implement responsive CSS Grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`
  - [ ] Import and render CashFlowHealth, IncomeExpenseCard, TrueCostCard
  - [ ] Add entrance animations: `animate-in fade-in slide-in-from-bottom-4 duration-500`
  - [ ] Stagger animation delays: 0ms, 100ms, 200ms for visual sequence
  - [ ] Handle loading state with skeleton grid

- [ ] Task 2: Create date formatting utility (AC: 2)
  - [ ] Create `src/lib/format/date.ts` (if not exists)
  - [ ] Implement `formatDate(date: Date): string` using date-fns
  - [ ] SA format: DD/MM/YYYY (e.g., "04/12/2025")
  - [ ] Export from `src/lib/format/index.ts`
  - [ ] Write unit tests in `tests/lib/format/date.test.ts`

- [ ] Task 3: Create DashboardHeader component (AC: 2)
  - [ ] Create `src/components/dashboard/DashboardHeader.tsx`
  - [ ] Display "Financial Health Dashboard" as page title
  - [ ] Display current date formatted with formatDate utility
  - [ ] Use semantic HTML: h1 for title, time element for date
  - [ ] Style with Tailwind: title in slate-900, date in slate-500

- [ ] Task 4: Create QuickActions component (AC: 5)
  - [ ] Create `src/components/dashboard/QuickActions.tsx`
  - [ ] "Update Balances" button - uses uiStore.setCurrentPage('data-entry')
  - [ ] "View Full Comparison" button - uses uiStore.setCurrentPage('compare')
  - [ ] Disable "View Full Comparison" if no accounts exist (use useAccounts hook)
  - [ ] Style buttons with shadcn/ui Button (primary and secondary variants)
  - [ ] Add subtle hover animations

- [ ] Task 5: Create EmptyState component (AC: 7)
  - [ ] Create `src/components/dashboard/EmptyState.tsx`
  - [ ] Display friendly illustration or icon (use Wallet icon from lucide-react)
  - [ ] Title: "Let's get started!"
  - [ ] Description: "Add your first account to see your financial health dashboard"
  - [ ] CTA button: "Add Your First Account"
  - [ ] Button navigates to Data Entry page via uiStore.setCurrentPage('data-entry')

- [ ] Task 6: Update DashboardPage to assemble all components (AC: 1, 3, 6, 7, 8)
  - [ ] Import DashboardHeader, ThreeNumbersGrid, QuickActions, EmptyState
  - [ ] Use useAccounts and useFinancialSnapshot hooks to detect data state
  - [ ] Conditional rendering: EmptyState if no accounts, ThreeNumbersGrid if accounts exist
  - [ ] Add loading state with skeleton components
  - [ ] Page layout: header → grid → quick actions (vertical stack)
  - [ ] Ensure page is set as default in App.tsx (verify, already done from Story 1.3)

- [ ] Task 7: Update dashboard barrel exports (AC: all)
  - [ ] Update `src/components/dashboard/index.ts` with new exports:
    - ThreeNumbersGrid
    - DashboardHeader
    - QuickActions
    - EmptyState

- [ ] Task 8: Write unit tests for formatDate (AC: 2)
  - [ ] Create `tests/lib/format/date.test.ts`
  - [ ] Test SA format: Date(2025, 11, 4) → "04/12/2025"
  - [ ] Test month padding: Date(2025, 0, 1) → "01/01/2025"
  - [ ] Test various dates across year

- [ ] Task 9: Write component tests for ThreeNumbersGrid (AC: 3, 4)
  - [ ] Create `tests/components/dashboard/ThreeNumbersGrid.test.tsx`
  - [ ] Test renders all three cards
  - [ ] Test responsive classes present (grid-cols-1, md:grid-cols-2, lg:grid-cols-3)
  - [ ] Test animation classes present
  - [ ] Test loading state renders skeletons

- [ ] Task 10: Write component tests for DashboardPage integration (AC: 1, 7, 8)
  - [ ] Create/update `tests/pages/DashboardPage.test.tsx`
  - [ ] Test empty state renders when no accounts
  - [ ] Test ThreeNumbersGrid renders when accounts exist
  - [ ] Test header with date is visible
  - [ ] Test quick actions buttons present
  - [ ] Test loading state behavior

- [ ] Task 11: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Manual verification: responsive layout at 375px, 768px, 1024px widths
  - [ ] Manual verification: empty state and populated state

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/dashboard/
│   ├── HealthCard.tsx           # Available from Story 3.1
│   ├── CashFlowHealth.tsx       # Available from Story 3.1
│   ├── ProportionBar.tsx        # Available from Story 3.2
│   ├── IncomeExpenseCard.tsx    # Available from Story 3.2
│   ├── TrueCostCard.tsx         # Available from Story 3.3
│   ├── ThreeNumbersGrid.tsx     # NEW: Grid container for 3 cards
│   ├── DashboardHeader.tsx      # NEW: Page header with title and date
│   ├── QuickActions.tsx         # NEW: Action buttons section
│   ├── EmptyState.tsx           # NEW: Empty data state
│   └── index.ts                 # Update barrel exports
├── lib/format/
│   ├── currency.ts              # Existing from Story 3.1
│   └── date.ts                  # NEW: SA date formatting
├── pages/
│   └── DashboardPage.tsx        # MODIFY: Assemble all dashboard components
```

**ADR-005 (Zustand vs Dexie):** Use uiStore for page navigation (setCurrentPage), use Dexie hooks (useAccounts, useFinancialSnapshot) for data state detection.

**Data Flow (from architecture):**
```
App.tsx (currentPage === 'dashboard')
    ↓
DashboardPage.tsx
    ├── DashboardHeader (static, uses formatDate)
    ├── useAccounts + useFinancialSnapshot (detect data state)
    │   ├── EmptyState (if no accounts)
    │   └── ThreeNumbersGrid (if accounts exist)
    │       ├── CashFlowHealth (from Story 3.1)
    │       ├── IncomeExpenseCard (from Story 3.2)
    │       └── TrueCostCard (from Story 3.3)
    └── QuickActions (navigation buttons)
```

### Responsive Grid Strategy

From [ux-design-specification.md](../ux-design-specification.md) Section 8:

**Breakpoint Strategy (Tailwind defaults):**
- Mobile: < 768px → Single column (`grid-cols-1`)
- Tablet: 768px - 1023px → Two columns (`md:grid-cols-2`)
- Desktop: ≥ 1024px → Three columns (`lg:grid-cols-3`)

**Grid Implementation:**
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <CashFlowHealth className="animate-in fade-in slide-in-from-bottom-4 duration-500" />
  <IncomeExpenseCard className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100" />
  <TrueCostCard className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200" />
</div>
```

### Date Formatting (SA Standard)

From [prd.md](../prd.md) FR48:

**Format:** DD/MM/YYYY (e.g., "04/12/2025")

**Implementation with date-fns:**
```typescript
import { format } from 'date-fns';

export function formatDate(date: Date): string {
  return format(date, 'dd/MM/yyyy');
}
```

### Quick Actions Navigation

**Using uiStore (from Story 1.4):**
```typescript
import { useUIStore } from '@/store/uiStore';

function QuickActions() {
  const setCurrentPage = useUIStore((state) => state.setCurrentPage);

  return (
    <div className="flex gap-4">
      <Button onClick={() => setCurrentPage('data-entry')}>
        Update Balances
      </Button>
      <Button
        variant="secondary"
        onClick={() => setCurrentPage('compare')}
        disabled={!hasAccounts}
      >
        View Full Comparison
      </Button>
    </div>
  );
}
```

### Empty State Design

From [ux-design-specification.md](../ux-design-specification.md) emotional goals:

**Emotional Goal:** Hope - show the path forward, not criticism

**Empty State Pattern:**
```tsx
<div className="flex flex-col items-center justify-center py-12 text-center">
  <Wallet className="h-16 w-16 text-slate-300 mb-4" />
  <h2 className="text-xl font-semibold text-slate-700 mb-2">
    Let's get started!
  </h2>
  <p className="text-slate-500 mb-6 max-w-md">
    Add your first account to see your financial health dashboard
  </p>
  <Button onClick={() => setCurrentPage('data-entry')}>
    Add Your First Account
  </Button>
</div>
```

### Project Structure Notes

**Files to Create:**
- `src/lib/format/date.ts` - SA date formatting utility
- `src/components/dashboard/ThreeNumbersGrid.tsx` - Grid container
- `src/components/dashboard/DashboardHeader.tsx` - Page header
- `src/components/dashboard/QuickActions.tsx` - Action buttons
- `src/components/dashboard/EmptyState.tsx` - Empty data state
- `tests/lib/format/date.test.ts`
- `tests/components/dashboard/ThreeNumbersGrid.test.tsx`
- `tests/pages/DashboardPage.test.tsx`

**Files to Modify:**
- `src/lib/format/index.ts` - Export formatDate
- `src/components/dashboard/index.ts` - Export new components
- `src/pages/DashboardPage.tsx` - Assemble all components

### Learnings from Previous Story

**From Story 3.3 (Status: done)**

- **Hook composition pattern well-established** - continue using for data detection
- **formatCurrency available** from `@/lib/format/currency` - use for any monetary displays
- **Card component patterns from 3.1, 3.2, 3.3** - all three cards ready for integration
- **Skeleton component** available at `src/components/ui/skeleton.tsx`
- **big.js pattern** - already used in all three card hooks
- **801 tests passing** - maintain test hygiene
- **Bundle size: 638KB** - advisory threshold, monitor additions
- **Animation classes** - Tailwind animate-in available for card entrance

**Files Available from Previous Stories:**
- `src/components/dashboard/CashFlowHealth.tsx` - Story 3.1
- `src/components/dashboard/IncomeExpenseCard.tsx` - Story 3.2
- `src/components/dashboard/TrueCostCard.tsx` - Story 3.3
- `src/lib/format/currency.ts` - Already exists
- All three card hooks: useCashFlowHealth, useIncomeExpense, useTrueCost

**Review Notes from Story 3.3:**
- All acceptance criteria verified complete
- No unresolved action items or blockers
- Advisory: Bundle size at 638KB - consider code-splitting when approaching 750KB

[Source: docs/sprint-artifacts/3-3-implement-true-cost-of-debt-card.md#Dev-Agent-Record]

### References

- [Source: docs/epics.md#Story-3.4] - Original story definition and acceptance criteria
- [Source: docs/prd.md#FR42] - Dashboard as landing page requirement
- [Source: docs/prd.md#FR47-48] - ZAR and SA date formatting requirements
- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#FR-Category-Mapping] - FR39-42 → components/dashboard/
- [Source: docs/ux-design-specification.md#Executive-Summary] - Primary user flow
- [Source: docs/ux-design-specification.md#Section-8] - Responsive strategy
- [Source: docs/sprint-artifacts/tech-spec-epic-3.md#Story-3.4-Acceptance-Criteria] - Authoritative AC definitions

## Dev Agent Record

### Context Reference

- [3-4-assemble-dashboard-page-with-three-numbers-grid.context.xml](3-4-assemble-dashboard-page-with-three-numbers-grid.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-04 | Story drafted with full context from Epic 3 tech spec, Story 3.3 learnings, PRD (FR42, FR47-48), Architecture, and UX Spec | SM Agent (Bob) |
