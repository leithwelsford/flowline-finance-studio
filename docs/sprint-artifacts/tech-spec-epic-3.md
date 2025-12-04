# Epic Technical Specification: Financial Health Dashboard

Date: 2025-12-03
Author: Leith
Epic ID: 3
Status: Draft

---

## Overview

Epic 3 delivers the "Three Critical Numbers" Financial Health Dashboard - the primary landing page that gives users instant visibility into their financial health. This epic transforms the existing placeholder Dashboard page into a fully functional financial health visualization with three core metric cards: Cash Flow Health, Income vs Expenditure, and True Cost of Debt.

This epic builds directly on the data foundation established in Epic 2 (Account & Data Management), consuming the persisted account, income, and expense data to calculate and display meaningful financial health metrics. The dashboard embodies the UX emotional goals of **Hope** (showing the path forward) and **Empowerment** (clear, honest truth-telling through color-coded indicators).

---

## Objectives and Scope

### In Scope

- **Story 3.1:** Cash Flow Health Card - displays available surplus, status indicator (Breathing/Tight/Drowning), debt consumption percentage
- **Story 3.2:** Income vs Expenditure Card - displays totals, discretionary amount, savings rate with visual bar
- **Story 3.3:** True Cost of Debt Card - displays monthly/annual interest charges, interest-to-income ratio
- **Story 3.4:** Dashboard Page Assembly - three-column grid layout, ZAR/SA date formatting, quick action buttons
- ZAR currency formatting with `Intl.NumberFormat` (R 1,234.56)
- SA date formatting (DD/MM/YYYY) using date-fns
- Semantic color indicators (green-500, amber-500, red-500) per UX spec
- Responsive layout: 3-column desktop, 2-column tablet, 1-column mobile

### Out of Scope

- Strategy calculation engine (Epic 4)
- Strategy comparison charts (Epic 5)
- Progress tracking (Epic 6)
- Data entry forms (completed in Epic 2)
- Balance logging functionality (Epic 6)

---

## System Architecture Alignment

This epic aligns with the established architecture from `docs/architecture.md`:

**Component Location:**
- Dashboard components: `src/components/dashboard/`
- Page component: `src/pages/DashboardPage.tsx`
- Format utilities: `src/lib/format/` (currency.ts, date.ts)
- Custom hook: `src/hooks/useFinancialHealth.ts`

**Data Flow:**
```
Dexie DB (accounts, income, expenses)
    ↓
useLiveQuery() in useFinancialSnapshot (existing)
    ↓
useFinancialHealth hook (new - derives metrics)
    ↓
Dashboard Components (HealthCard, ThreeNumbersGrid)
    ↓
React UI with shadcn/ui Card components
```

**State Management:**
- No Zustand needed for this epic - all data is derived from Dexie via reactive hooks
- Existing `useFinancialSnapshot` hook provides base data
- New `useFinancialHealth` hook calculates derived metrics

**Dependencies Used:**
- big.js (v7.0.1) - precision calculations for financial metrics
- date-fns (v4.1.0) - SA date formatting
- Intl.NumberFormat - ZAR currency formatting (native)
- shadcn/ui Card, Badge - UI components
- lucide-react - status icons

---

## Detailed Design

### Services and Modules

| Module | Responsibility | Location |
|--------|---------------|----------|
| `useFinancialHealth` | Calculate cash flow, income/expense breakdown, debt cost metrics | `src/hooks/useFinancialHealth.ts` |
| `HealthCard` | Reusable card displaying a metric with status indicator | `src/components/dashboard/HealthCard.tsx` |
| `CashFlowHealth` | Cash flow specific implementation | `src/components/dashboard/CashFlowHealth.tsx` |
| `IncomeExpenseCard` | Income vs expenditure breakdown | `src/components/dashboard/IncomeExpenseCard.tsx` |
| `TrueCostCard` | True cost of debt display | `src/components/dashboard/TrueCostCard.tsx` |
| `ThreeNumbersGrid` | Grid layout container | `src/components/dashboard/ThreeNumbersGrid.tsx` |
| `formatDate` | SA date formatting utility | `src/lib/format/date.ts` |

### Data Models and Contracts

**Existing Types Used (from Epic 2):**
```typescript
// src/types/financial-snapshot.ts (existing)
interface FinancialSnapshotData {
  totalDebt: Big;
  totalMonthlyIncome: Big;
  totalMonthlyExpenses: Big;
  totalMinimumPayments: Big;
  availableSurplus: Big;
  accountCount: number;
  hasFlexiFacility: boolean;
}
```

**New Types for Epic 3:**
```typescript
// src/types/financial-health.ts (new)
type HealthStatus = 'healthy' | 'warning' | 'critical';

interface CashFlowHealth {
  availableSurplus: Big;          // Income - Expenses - MinPayments
  status: HealthStatus;            // Based on surplus % of income
  statusLabel: string;             // "Breathing" | "Tight" | "Drowning"
  debtConsumptionPercent: Big;     // MinPayments / Income * 100
}

interface IncomeExpenseBreakdown {
  totalIncome: Big;
  totalExpenses: Big;
  discretionary: Big;              // Income - Expenses
  savingsRate: Big;                // (Income - Expenses) / Income * 100
  expenseRatio: number;            // For visual bar width (0-1)
}

interface TrueCostOfDebt {
  monthlyInterest: Big;            // Sum of all account interest
  annualInterest: Big;             // Monthly * 12
  interestToIncomePercent: Big;    // Monthly interest / Income * 100
  isHighBurden: boolean;           // > 20% of income
}

interface FinancialHealthMetrics {
  cashFlow: CashFlowHealth;
  incomeExpense: IncomeExpenseBreakdown;
  debtCost: TrueCostOfDebt;
  lastUpdated: Date;
}
```

### APIs and Interfaces

**No external APIs.** All calculations are client-side using existing Dexie data.

**Hook Interface:**
```typescript
// src/hooks/useFinancialHealth.ts
function useFinancialHealth(): {
  metrics: FinancialHealthMetrics | null;
  isLoading: boolean;
  error: Error | null;
}
```

**Component Props:**
```typescript
// HealthCard (reusable)
interface HealthCardProps {
  title: string;
  value: string;            // Pre-formatted display value
  status: HealthStatus;
  statusLabel: string;
  icon: React.ReactNode;
  subtitle?: string;
  trend?: 'up' | 'down' | 'stable';
}

// ThreeNumbersGrid
interface ThreeNumbersGridProps {
  metrics: FinancialHealthMetrics;
}
```

### Workflows and Sequencing

**Dashboard Load Sequence:**
```
1. User navigates to Dashboard (default page)
2. DashboardPage renders
3. useFinancialHealth hook triggers
   3a. useLiveQuery fetches accounts, income, expenses from Dexie
   3b. Snapshot data passed to calculation functions
   3c. CashFlow, IncomeExpense, DebtCost metrics derived
4. ThreeNumbersGrid receives metrics
5. Three HealthCard components render with data
6. Cards animate in with Tailwind animate-in
```

**Status Determination Logic:**
```
Cash Flow Status:
- surplus > 10% of income → "healthy" → "Breathing" (green)
- surplus 0-10% of income → "warning" → "Tight" (amber)
- surplus < 0 → "critical" → "Drowning" (red)

Debt Burden Status:
- interest < 10% of income → normal display
- interest 10-20% of income → warning display
- interest > 20% of income → "High debt burden" warning (red)
```

---

## Non-Functional Requirements

### Performance

| Metric | Target | Implementation |
|--------|--------|----------------|
| Dashboard load | < 2 seconds (NFR-P1) | Leverage existing useLiveQuery, minimal recalculation |
| Metric calculation | < 100ms | big.js operations are fast, simple arithmetic |
| Card render | < 200ms | shadcn/ui Card is lightweight |

**Optimization:** Metrics are memoized in the hook - only recalculate when underlying data changes.

### Security

- **No external data transmission** - all calculations client-side
- **Input validation** - relies on Epic 2 validation (already validated on entry)
- **No PII exposure** - financial data never leaves browser

### Reliability/Availability

- **Graceful empty state** - if no data entered, cards show "No data yet" with prompt to enter data
- **Error boundary** - wrap dashboard in error boundary to prevent full page crash
- **Consistent calculations** - same inputs always produce same outputs (deterministic)

### Observability

- **Console logging** - use existing logger utility for calculation debugging
- **Loading states** - skeleton loaders while data loads
- **Error display** - toast notification if calculation fails

---

## Dependencies and Integrations

### External Dependencies (from package.json)

| Package | Version | Purpose |
|---------|---------|---------|
| big.js | ^7.0.1 | Precision arithmetic for financial calculations |
| date-fns | ^4.1.0 | SA date formatting (DD/MM/YYYY) |
| lucide-react | ^0.555.0 | Status icons (CheckCircle, AlertTriangle, XCircle) |
| recharts | ^3.5.1 | Visual bar for income/expense ratio (optional) |

### Internal Dependencies

| Module | From Epic | Purpose |
|--------|-----------|---------|
| `useFinancialSnapshot` | Epic 2 | Base financial data aggregation |
| `formatCurrency` | Epic 2 | ZAR formatting (R 1,234.56) |
| `db` (Dexie instance) | Epic 1 | Data source |
| shadcn/ui Card | Epic 1 | Card component |
| shadcn/ui Badge | Epic 2 | Status badges |

### Integration Points

- **Epic 2 Data:** Consumes accounts, income, expenses tables
- **Epic 5 Future:** Dashboard will add "View Full Comparison" button linking to Compare page
- **Epic 6 Future:** Dashboard may add "Last logged" indicator from balance snapshots

---

## Acceptance Criteria (Authoritative)

### Story 3.1: Cash Flow Health Card

1. **AC-3.1.1:** Given income, expenses, and debt accounts are entered, when I view the Dashboard, then I see a "Cash Flow Health" card
2. **AC-3.1.2:** Card displays Available Monthly Surplus in ZAR format (R X,XXX.XX)
3. **AC-3.1.3:** Card displays status indicator:
   - Green + "Breathing" if surplus > 10% of income
   - Amber + "Tight" if surplus is 0-10% of income
   - Red + "Drowning" if surplus is negative
4. **AC-3.1.4:** Card displays Debt Consumption percentage (min payments / income)
5. **AC-3.1.5:** Card uses teal header (#0d9488) per UX spec
6. **AC-3.1.6:** Status icon accompanies label (checkmark, warning, X)

### Story 3.2: Income vs Expenditure Card

1. **AC-3.2.1:** Card displays Total Monthly Income in ZAR format
2. **AC-3.2.2:** Card displays Total Monthly Expenses in ZAR format
3. **AC-3.2.3:** Card displays Discretionary Amount (Income - Expenses)
4. **AC-3.2.4:** Card displays Savings Rate as percentage
5. **AC-3.2.5:** Visual bar shows income vs expense proportions
6. **AC-3.2.6:** Savings rate shows green if positive, red if negative

### Story 3.3: True Cost of Debt Card

1. **AC-3.3.1:** Card displays Monthly Interest Charges (sum across all accounts) in ZAR
2. **AC-3.3.2:** Card displays Annual Interest Projection (monthly × 12)
3. **AC-3.3.3:** Card displays Interest-to-Income Ratio as percentage
4. **AC-3.3.4:** Values display in red (truth-telling per UX spec)
5. **AC-3.3.5:** If interest > 20% of income, shows "High debt burden" warning

### Story 3.4: Dashboard Page Assembly

1. **AC-3.4.1:** Dashboard is the default landing page when app opens
2. **AC-3.4.2:** Page header shows "Financial Health Dashboard" with current date (DD/MM/YYYY)
3. **AC-3.4.3:** Three Numbers Grid: 3-column on desktop, 2-column on tablet, 1-column on mobile
4. **AC-3.4.4:** Cards animate in with subtle fade (Tailwind animate-in)
5. **AC-3.4.5:** Quick Actions section with "Update Balances" button (links to Data Entry)
6. **AC-3.4.6:** All monetary values formatted as ZAR (R X,XXX.XX)
7. **AC-3.4.7:** Empty state shown if no financial data entered

---

## Traceability Mapping

| AC | Spec Section | Component(s) | Test Approach |
|----|--------------|--------------|---------------|
| AC-3.1.1 | Data Models | CashFlowHealth, DashboardPage | Component render test |
| AC-3.1.2 | APIs | formatCurrency, HealthCard | Unit test formatCurrency |
| AC-3.1.3 | Workflows | useFinancialHealth | Unit test status logic |
| AC-3.1.4 | Data Models | CashFlowHealth.debtConsumptionPercent | Calculation unit test |
| AC-3.1.5 | n/a | HealthCard | Visual inspection |
| AC-3.1.6 | n/a | HealthCard | Visual inspection |
| AC-3.2.1-6 | Data Models | IncomeExpenseCard | Component + calculation tests |
| AC-3.3.1-5 | Data Models, Workflows | TrueCostCard | Calculation unit tests |
| AC-3.4.1 | Workflows | App.tsx routing | Integration test |
| AC-3.4.2 | APIs | formatDate, DashboardPage | Visual + unit test |
| AC-3.4.3 | n/a | ThreeNumbersGrid | Responsive visual test |
| AC-3.4.4 | n/a | ThreeNumbersGrid | Visual inspection |
| AC-3.4.5 | n/a | DashboardPage | Click navigation test |
| AC-3.4.6 | APIs | formatCurrency | Unit test |
| AC-3.4.7 | Workflows | DashboardPage | Empty state render test |

---

## Risks, Assumptions, Open Questions

### Risks

| Risk | Impact | Mitigation |
|------|--------|------------|
| **R1:** Interest calculation differs from actual bank | Projections off by small margin | Document calculation methodology, allow for ~5% variance |
| **R2:** Empty data state confuses user | Poor first-time experience | Clear empty state with CTA to add data |
| **R3:** Mobile layout too cramped | Reduced usability | Test on real device, use vertical stacking |

### Assumptions

| Assumption | Rationale |
|------------|-----------|
| **A1:** User has entered at least one account to see meaningful data | Epic 2 prerequisite |
| **A2:** Standard loans use monthly interest (balance × rate / 12) | Common SA loan structure |
| **A3:** Flexi facilities use daily interest approximated to monthly | FNB Flexi Option standard |
| **A4:** Income entered represents net monthly income | User understands net vs gross |

### Open Questions

| Question | Decision Needed By | Current Assumption |
|----------|-------------------|-------------------|
| **Q1:** Should empty cards show R0.00 or "No data"? | Story 3.4 | Show "No data yet" with prompt |
| **Q2:** Include mini-trend indicator (up/down arrow)? | Story 3.1 | Defer to Epic 6 (needs historical data) |

---

## Test Strategy Summary

### Unit Tests (Vitest)

| Test File | Coverage |
|-----------|----------|
| `tests/hooks/useFinancialHealth.test.ts` | Status logic, calculation accuracy |
| `tests/lib/format/date.test.ts` | SA date formatting (DD/MM/YYYY) |
| `tests/lib/format/currency.test.ts` | ZAR formatting (already exists, extend) |

**Key Test Cases:**
- Cash flow status transitions at boundary values (10%, 0%)
- Interest calculation for monthly vs daily compounding
- Debt burden warning at 20% threshold
- Empty data handling

### Component Tests (@testing-library/react)

| Test File | Coverage |
|-----------|----------|
| `tests/components/dashboard/HealthCard.test.tsx` | Renders with props, status colors |
| `tests/components/dashboard/ThreeNumbersGrid.test.tsx` | Layout, responsive classes |

### Integration Tests

- Dashboard renders with mock Dexie data
- Navigation to dashboard from other pages
- Empty state → populated state transition

### Manual Testing

- Visual inspection on desktop/tablet/mobile
- Color contrast verification (WCAG AA)
- Animation smoothness

---

_Generated by BMAD Epic Tech Context Workflow_
_Date: 2025-12-03_
_For: Leith_
