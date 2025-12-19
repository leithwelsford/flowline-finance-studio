# Epic Technical Specification: Progress Tracking & Validation

Date: 2025-12-19
Author: Leith
Epic ID: 6
Status: Draft

---

## Overview

Epic 6 implements the **Progress Tracking & Validation** system that enables users to validate their chosen debt strategy through real-world tracking. This is the critical "validation loop" that transforms Flowline Finance Studio from a theoretical comparison tool into a practical validation engine.

Users can log actual account balances over time, compare them against strategy projections, calculate variance, and determine whether the chosen strategy is delivering promised results. This epic fulfills the core validation-first philosophy: prove the methodology works with real data before scaling.

The system captures balance snapshots, computes actual vs. projected comparisons, tracks variance percentages, displays historical progress timelines, and flags significant deviations for review with annotation support.

## Objectives and Scope

### In Scope

- **Balance Logging (FR32):** Manual entry of actual account balances on weekly/monthly basis
- **Actual vs Projected Comparison (FR33):** Chart overlay showing projected debt curve vs. actual logged data
- **Variance Calculation (FR34):** Compute variance percentage between actual and projected results
- **Accuracy Assessment (FR35):** Determine if projections track within 10% acceptable margin
- **Historical Progress View (FR36):** Timeline showing actual debt reduction, cumulative interest, strategy adherence
- **Deviation Flagging (FR37):** System identifies significant variance and flags for review
- **Notes/Annotations (FR38):** User can document variances with explanations (life events, unexpected expenses)
- **Progress Charts (FR43, FR45, FR46):** Interactive debt reduction visualization with historical data views and status indicators

### Out of Scope

- Automated balance imports (bank API integration deferred)
- Projection recalculation based on actual data (strategy remains fixed)
- Multi-user progress sharing
- Export of progress reports to PDF/CSV
- Predictive variance forecasting

## System Architecture Alignment

This epic integrates with the established architecture:

- **Data Layer:** Dexie.js `balanceSnapshots` table stores all logged balance data with date, accountId, balance, and notes fields
- **State Management:** Zustand `calculationStore` provides projected strategy data; new `progressStore` manages tracking state
- **UI Components:** Recharts for progress visualization; shadcn/ui for forms and indicators
- **Calculation Layer:** Extends `src/lib/calculations/` with variance computation functions
- **Hooks:** New `useProgress.ts` hook for querying snapshots and computing variance metrics

**Key Architectural Constraints:**
- All calculations client-side (no server)
- big.js for precision in variance calculations
- Date-fns for date handling and period filtering
- Semantic colors (green/yellow/red) for variance status per UX spec

---

## Detailed Design

### Services and Modules

| Module | Responsibility | Location |
|--------|----------------|----------|
| Balance Logger | Capture and persist balance snapshots | `src/components/tracking/BalanceLogger.tsx` |
| Progress Calculator | Compute variance, accuracy metrics | `src/lib/calculations/progress.ts` |
| Progress Hook | Query snapshots, provide computed metrics | `src/hooks/useProgress.ts` |
| Variance Indicator | Display on-track/off-track status | `src/components/tracking/VarianceIndicator.tsx` |
| Progress Chart | Visualize actual vs projected | `src/components/charts/ProgressChart.tsx` |
| Progress Timeline | Historical progress with annotations | `src/components/tracking/ProgressTimeline.tsx` |
| Deviation Alert | Flag significant variance | `src/components/tracking/DeviationAlert.tsx` |
| Notes Annotation | Capture and display variance explanations | `src/components/tracking/NotesAnnotation.tsx` |

### Data Models and Contracts

```typescript
// src/types/tracking.ts

/** Balance snapshot for a single account at a point in time */
interface BalanceSnapshot {
  id?: number;
  accountId: number;
  date: string;           // ISO date string (YYYY-MM-DD)
  balance: string;        // big.js string for precision
  notes?: string;         // User annotation explaining variance
  createdAt: string;      // ISO timestamp
}

/** Aggregated snapshot for total debt at a date */
interface TotalDebtSnapshot {
  date: string;
  totalDebt: string;      // Sum of all account balances
  accountSnapshots: BalanceSnapshot[];
}

/** Variance calculation result */
interface VarianceResult {
  date: string;
  projectedDebt: string;
  actualDebt: string;
  varianceAmount: string;      // Actual - Projected
  variancePercent: number;     // (Actual - Projected) / Projected * 100
  status: 'on-track' | 'minor-variance' | 'off-track';
}

/** Progress summary metrics */
interface ProgressSummary {
  totalSnapshots: number;
  latestSnapshot: TotalDebtSnapshot | null;
  averageVariance: number;
  onTrackCount: number;
  offTrackCount: number;
  overallStatus: 'on-track' | 'minor-variance' | 'off-track';
}

/** Time period filter options */
type TimePeriod = 'week' | 'month' | 'quarter' | 'ytd' | 'all';
```

**Dexie Schema Extension:**
```typescript
// Already defined in schema.ts
balanceSnapshots: '++id, accountId, date'
```

### APIs and Interfaces

**No external APIs.** All operations are local via Dexie.

**Internal Hook Interface:**

```typescript
// src/hooks/useProgress.ts

interface UseProgressReturn {
  // Data
  snapshots: TotalDebtSnapshot[];
  varianceHistory: VarianceResult[];
  summary: ProgressSummary;

  // Actions
  logBalances: (date: string, balances: {accountId: number, balance: string}[], notes?: string) => Promise<void>;
  deleteSnapshot: (snapshotId: number) => Promise<void>;

  // Filters
  filterPeriod: (period: TimePeriod) => void;

  // State
  isLoading: boolean;
  error: Error | null;
}
```

### Workflows and Sequencing

**Balance Logging Flow:**
```
1. User navigates to Track page
2. User clicks "Log Balances"
3. System displays all accounts with current balance fields
4. User enters actual balances for each account
5. User optionally adds notes explaining variance
6. User clicks "Save Snapshot"
7. System validates inputs (balance >= 0)
8. System creates BalanceSnapshot records for each account
9. System shows success toast
10. System recalculates variance metrics
11. If variance > 20%, system shows deviation alert
```

**Variance Calculation Flow:**
```
1. Get selected strategy projections from calculationStore
2. For each logged snapshot date:
   a. Find projected total debt at that date (interpolate if needed)
   b. Sum actual balances from snapshot
   c. Compute variance: (actual - projected) / projected * 100
   d. Assign status: <10% = on-track, 10-20% = minor, >20% = off-track
3. Compute summary: average variance, on-track count
4. Return variance history and summary
```

---

## Non-Functional Requirements

### Performance

| Requirement | Target | Implementation |
|-------------|--------|----------------|
| Variance calculation | < 500ms | Optimized big.js operations, memoized results |
| Progress chart render | < 2 seconds | Recharts with data sampling for long histories |
| Snapshot save | < 200ms | Async Dexie writes, non-blocking |
| Timeline filter | < 300ms | In-memory filtering with date-fns |

### Security

- **Data Privacy:** All snapshots stored locally in IndexedDB, no server transmission
- **Input Validation:** Zod schemas validate balance inputs (non-negative numbers)
- **Notes Sanitization:** Escape HTML in notes display to prevent XSS

### Reliability/Availability

- **Data Integrity:** Atomic snapshot saves (all accounts or none via Dexie transactions)
- **Offline Support:** Full functionality without network (client-side only)
- **Recovery:** Auto-recovery from interrupted saves via Dexie durability

### Observability

- **Logging:** Console logs for variance calculations in development
- **Error Tracking:** Toast notifications for save failures
- **State Visibility:** Progress metrics displayed on Track page dashboard

---

## Dependencies and Integrations

### Dependencies (from package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| dexie | ^4.x | IndexedDB persistence for snapshots |
| dexie-react-hooks | ^1.x | React hooks for live queries |
| big.js | ^6.x | Precision variance calculations |
| date-fns | ^3.x | Date filtering and formatting |
| recharts | ^2.x | Progress chart visualization |
| zod | ^3.x | Input validation schemas |

### Internal Dependencies

| Module | Dependency | Purpose |
|--------|------------|---------|
| BalanceLogger | useAccounts hook | Get list of accounts to log |
| ProgressChart | calculationStore | Get projected strategy data |
| VarianceIndicator | useProgress hook | Get variance metrics |
| ProgressTimeline | useProgress hook | Get filtered snapshot history |

---

## Acceptance Criteria (Authoritative)

### AC-6.1: Balance Logging
1. User can select a date for logging (defaults to today)
2. User sees all active accounts with balance input fields
3. User can enter balance for each account in ZAR
4. User can add optional notes explaining variance
5. System validates balances are non-negative
6. System saves snapshot with success confirmation
7. System timestamps each snapshot with createdAt

### AC-6.2: Actual vs Projected Comparison
1. Chart displays projected debt curve from selected strategy
2. Chart overlays actual debt points from logged snapshots
3. Chart shows current date marker
4. Tooltip displays projected vs actual values at each point
5. Chart renders within 2 seconds
6. Chart adapts responsively on mobile

### AC-6.3: Variance Calculation
1. Variance computed as: (Actual - Projected) / Projected * 100
2. Status assigned: <10% = on-track (green), 10-20% = minor-variance (yellow), >20% = off-track (red)
3. Status indicator shows appropriate icon (✓, ⚠, ✕)
4. Summary shows average variance across all snapshots
5. Summary shows count of on-track vs off-track snapshots

### AC-6.4: Historical Progress Timeline
1. Timeline shows each snapshot with date and total debt
2. Timeline shows debt reduction from previous snapshot
3. Timeline shows notes/annotations inline
4. User can filter by: week, month, quarter, ytd, all
5. Timeline scrolls horizontally on mobile

### AC-6.5: Deviation Alerts
1. System alerts when variance exceeds 20%
2. Alert prompts user to add explanation note
3. Notes appear as annotations on timeline
4. System flags 3+ consecutive off-track months
5. System recognizes improving variance trends

---

## Traceability Mapping

| AC | Spec Section | Component | Test Approach |
|----|--------------|-----------|---------------|
| AC-6.1.1 | Workflows | BalanceLogger | Integration: date picker defaults to today |
| AC-6.1.2 | Data Models | BalanceLogger | Unit: renders all accounts from hook |
| AC-6.1.3 | Data Models | BalanceLogger | Integration: ZAR input formatting |
| AC-6.1.4 | Data Models | NotesAnnotation | Integration: notes field saves |
| AC-6.1.5 | APIs | BalanceLogger | Unit: Zod validation rejects negative |
| AC-6.1.6 | Workflows | BalanceLogger | Integration: toast on save |
| AC-6.1.7 | Data Models | BalanceSnapshot | Unit: createdAt populated |
| AC-6.2.1 | APIs | ProgressChart | Integration: loads from calculationStore |
| AC-6.2.2 | APIs | ProgressChart | Integration: two line series rendered |
| AC-6.2.3 | APIs | ProgressChart | Integration: reference line at current date |
| AC-6.2.4 | APIs | ProgressChart | E2E: tooltip content correct |
| AC-6.2.5 | Performance | ProgressChart | Performance: render < 2s benchmark |
| AC-6.2.6 | Responsive | ProgressChart | Visual: mobile screenshot test |
| AC-6.3.1 | APIs | progress.ts | Unit: variance formula correct |
| AC-6.3.2 | APIs | VarianceIndicator | Unit: status assignment thresholds |
| AC-6.3.3 | Detailed Design | VarianceIndicator | Visual: icons render correctly |
| AC-6.3.4 | APIs | useProgress | Unit: average variance computed |
| AC-6.3.5 | APIs | useProgress | Unit: on/off track counts |
| AC-6.4.1 | Workflows | ProgressTimeline | Integration: renders snapshots |
| AC-6.4.2 | Workflows | ProgressTimeline | Unit: debt delta computed |
| AC-6.4.3 | Data Models | ProgressTimeline | Integration: notes displayed |
| AC-6.4.4 | APIs | useProgress | Integration: period filtering works |
| AC-6.4.5 | Responsive | ProgressTimeline | Visual: mobile scroll test |
| AC-6.5.1 | Workflows | DeviationAlert | Unit: triggers at >20% |
| AC-6.5.2 | Workflows | DeviationAlert | Integration: prompts note entry |
| AC-6.5.3 | Workflows | ProgressTimeline | Integration: notes visible |
| AC-6.5.4 | APIs | useProgress | Unit: consecutive off-track detection |
| AC-6.5.5 | APIs | useProgress | Unit: improving trend detection |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1:** Variance calculation edge cases (no projections) | Medium | Return null variance if no selected strategy; prompt user to select one |
| **R2:** Large snapshot history slows chart | Low | Sample data points for charts > 100 entries |
| **R3:** User logs balances on wrong date | Medium | Allow editing/deleting snapshots; show recent snapshots for review |

### Assumptions

| Assumption | Rationale |
|------------|-----------|
| **A1:** User has selected a strategy before tracking | Variance requires projected values from a selected strategy |
| **A2:** Snapshots are logged weekly or monthly | Design optimized for periodic manual entry, not daily |
| **A3:** User enters accurate balances | No validation against bank data; trust user input |

### Open Questions

| Question | Status | Resolution |
|----------|--------|------------|
| **Q1:** Should we allow backdated snapshot entry? | Resolved: Yes, via date picker |
| **Q2:** Maximum snapshot history to retain? | Resolved: Unlimited (local storage handles) |
| **Q3:** Interpolate projections for dates between months? | Resolved: Yes, linear interpolation |

---

## Test Strategy Summary

### Test Levels

| Level | Coverage | Tools |
|-------|----------|-------|
| Unit Tests | Variance calculation, status assignment, filtering | Vitest |
| Integration Tests | Hook queries, snapshot save flow, chart data binding | Vitest + React Testing Library |
| Visual Tests | Responsive layouts, chart rendering, color coding | Manual + Playwright screenshots |
| E2E Tests | Complete tracking flow from logging to timeline | Playwright |

### Test Focus Areas

1. **Variance Calculation Accuracy:** Test edge cases (zero debt, equal values, large variance)
2. **Status Thresholds:** Verify 10% and 20% boundaries
3. **Date Handling:** Test filtering by period, date formatting
4. **Chart Performance:** Benchmark render time with 100+ data points
5. **Accessibility:** Keyboard navigation, screen reader compatibility

### Test Data

- **Known Scenario:** 5 accounts, 12 months of projections, 6 snapshots at varying variance levels
- **Edge Cases:** No snapshots, single snapshot, all on-track, all off-track
- **Performance:** 100+ snapshots for chart render testing
