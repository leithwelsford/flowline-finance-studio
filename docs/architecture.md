# Architecture

## Executive Summary

Flowline Finance Studio is a **client-side single-page application (SPA)** for debt strategy validation, built entirely in the browser with no backend requirements. The architecture prioritizes:

1. **Client-side calculations** - All 8-10 debt strategy calculations run in browser JavaScript
2. **Local persistence** - Financial data stored in browser (IndexedDB via Dexie.js)
3. **Offline capability** - Full functionality without internet connection
4. **Zero hosting costs** - Static deployment to free hosting platforms
5. **Calculation accuracy** - Cent-level precision for SA Rand amounts using big.js

This is a validation-first MVP for personal use, designed to prove which debt acceleration strategy works best in the South African context before considering broader rollout.

### Project Context

- **55 Functional Requirements** across 7 capability areas
- **21 Non-Functional Requirements** ensuring performance, security, and usability
- **UX Design System**: shadcn/ui + Tailwind CSS + Recharts (Balanced Teal theme)
- **Target**: Single user (founder validation), no authentication required

## Project Initialization

**Starter Template: Vite + React + TypeScript**

First implementation story should execute:

```bash
# Create project
npm create vite@latest flowline-finance-studio -- --template react-ts
cd flowline-finance-studio
npm install

# Add Tailwind CSS + shadcn/ui
npx shadcn@latest init
# Select: TypeScript, Balanced Teal theme, CSS variables

# Add core dependencies
npm install recharts dexie dexie-react-hooks zustand big.js date-fns
npm install react-hook-form zod @hookform/resolvers
npm install -D @types/big.js vitest @testing-library/react @testing-library/jest-dom

# Development server
npm run dev
```

This establishes the base architecture with these decisions:

| Decision | Provided By |
|----------|-------------|
| Build Tooling | Vite (fast HMR, optimized builds) |
| Language | TypeScript (type safety) |
| Framework | React 19 (component model) |
| UI Components | shadcn/ui (Radix + Tailwind) |
| Styling | Tailwind CSS (utility classes) |
| Charts | Recharts (React charting) |
| Accessibility | Radix UI (WCAG AA) |

**Why This Stack:**
- **Client-side only** - No SSR overhead, perfect for offline-capable SPA
- **Fast calculations** - Vite's speed enables quick iteration on calculation engine
- **Lightweight bundle** - Critical for offline capability and calculation performance
- **Full control** - Copy-paste components, easy to modify as validation reveals needs
- **Zero backend** - Static deployment to GitHub Pages/Netlify/Vercel

## Decision Summary

| Category | Decision | Version | Affects FRs | Rationale |
| -------- | -------- | ------- | ----------- | --------- |
| Data Persistence | Dexie.js (IndexedDB) | 4.x | FR1-8, FR32-38 | Structured data, async queries, React hooks, offline-ready |
| State Management | Zustand | 4.x | All UI | Lightweight, selector-based, no providers needed |
| Precision Math | big.js | 6.x | FR9-23 | Financial calculations without floating-point errors |
| Form Handling | React Hook Form + Zod | 7.x / 3.x | FR1-8 | shadcn/ui native, TypeScript, minimal re-renders |
| Date Library | date-fns | 3.x | FR47-48 | Tree-shakeable, SA date formatting (DD/MM/YYYY) |
| Currency Format | Native Intl | Built-in | FR47 | ZAR formatting via Intl.NumberFormat |
| Testing | Vitest | 1.x | NFR-M2 | Vite-native, fast, TypeScript support |
| Charts | Recharts | 2.x | FR43-46 | React-native, responsive, line/bar charts |

## Project Structure

```
flowline-finance-studio/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.ts
├── components.json                 # shadcn/ui config
│
├── public/
│   └── favicon.svg
│
├── src/
│   ├── main.tsx                    # App entry point
│   ├── App.tsx                     # Root component, routing
│   ├── index.css                   # Tailwind imports
│   │
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components (auto-generated)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── form.tsx
│   │   │   ├── input.tsx
│   │   │   ├── table.tsx
│   │   │   ├── toast.tsx
│   │   │   └── ...
│   │   │
│   │   ├── layout/                 # App shell components
│   │   │   ├── Header.tsx
│   │   │   ├── Navigation.tsx
│   │   │   └── PageContainer.tsx
│   │   │
│   │   ├── dashboard/              # FR39-42: Financial Health Dashboard
│   │   │   ├── HealthCard.tsx
│   │   │   ├── ThreeNumbersGrid.tsx
│   │   │   └── DashboardSummary.tsx
│   │   │
│   │   ├── accounts/               # FR1-8: Account & Data Management
│   │   │   ├── AccountList.tsx
│   │   │   ├── AccountForm.tsx
│   │   │   ├── FlexiFacilityForm.tsx
│   │   │   ├── IncomeForm.tsx
│   │   │   └── ExpenseForm.tsx
│   │   │
│   │   ├── strategies/             # FR24-31: Strategy Comparison
│   │   │   ├── WinnersPodium.tsx
│   │   │   ├── ComparisonTable.tsx
│   │   │   ├── StrategyCard.tsx
│   │   │   └── StrategyDetail.tsx
│   │   │
│   │   ├── charts/                 # FR43-48: Data Visualization
│   │   │   ├── DebtReductionChart.tsx
│   │   │   ├── InterestComparisonChart.tsx
│   │   │   └── ProgressChart.tsx
│   │   │
│   │   └── tracking/               # FR32-38: Progress Tracking
│   │       ├── BalanceLogger.tsx
│   │       ├── VarianceIndicator.tsx
│   │       ├── ProgressTimeline.tsx
│   │       └── NotesAnnotation.tsx
│   │
│   ├── pages/                      # Page-level components
│   │   ├── DashboardPage.tsx       # FR42: Primary landing page
│   │   ├── DataEntryPage.tsx       # FR1-8: Account management
│   │   ├── ComparePage.tsx         # FR24-31: Strategy comparison
│   │   └── TrackPage.tsx           # FR32-38: Progress tracking
│   │
│   ├── lib/                        # Core business logic (framework-agnostic)
│   │   ├── db/
│   │   │   ├── index.ts            # Dexie database instance
│   │   │   ├── schema.ts           # Database schema definitions
│   │   │   └── migrations.ts       # Version migrations
│   │   │
│   │   ├── calculations/           # FR9-23: Calculation Engine
│   │   │   ├── types.ts            # Strategy interfaces, projection types
│   │   │   ├── engine.ts           # Main orchestrator
│   │   │   ├── interest.ts         # FR9-11: Interest formulas
│   │   │   ├── projections.ts      # FR22-23: Month-by-month projections
│   │   │   └── strategies/
│   │   │       ├── index.ts
│   │   │       ├── baseline.ts     # FR13: Minimum payments
│   │   │       ├── snowball.ts     # FR14: Smallest balance first
│   │   │       ├── avalanche.ts    # FR15: Highest rate first
│   │   │       ├── flexi-chunking.ts      # FR16: Regular lump sums
│   │   │       ├── aggressive-flexi.ts    # FR17: Maximum deposits
│   │   │       ├── velocity-banking.ts    # FR18: SA velocity banking
│   │   │       ├── hybrid-snowball.ts     # FR19: Flexi + snowball
│   │   │       └── hybrid-avalanche.ts    # FR20: Flexi + avalanche
│   │   │
│   │   ├── format/                 # FR47-48: Formatting utilities
│   │   │   ├── currency.ts         # ZAR formatting
│   │   │   └── date.ts             # SA date formatting
│   │   │
│   │   ├── validation/             # Form schemas
│   │   │   ├── account.ts
│   │   │   ├── income.ts
│   │   │   └── expense.ts
│   │   │
│   │   └── utils/
│   │       ├── result.ts           # Result type for error handling
│   │       └── logger.ts           # Logging utility
│   │
│   ├── hooks/                      # Custom React hooks
│   │   ├── useAccounts.ts          # Dexie queries for accounts
│   │   ├── useStrategies.ts        # Strategy calculation hook
│   │   ├── useProgress.ts          # Progress tracking queries
│   │   └── useFinancialHealth.ts   # Three numbers calculation
│   │
│   ├── store/                      # Zustand stores
│   │   ├── index.ts
│   │   ├── uiStore.ts              # UI state (selected strategy, modals)
│   │   └── calculationStore.ts     # Calculation state (loading, results)
│   │
│   └── types/                      # Global TypeScript types
│       ├── account.ts
│       ├── strategy.ts
│       ├── projection.ts
│       └── index.ts                # Re-exports
│
└── tests/                          # Test files
    ├── setup.ts                    # Vitest setup
    ├── calculations/
    │   ├── interest.test.ts        # Interest formula tests
    │   ├── snowball.test.ts        # Strategy tests
    │   └── projections.test.ts     # Projection accuracy tests
    └── components/
        └── ...
```

## FR Category to Architecture Mapping

| FR Category | FRs | Location | Description |
|-------------|-----|----------|-------------|
| Account & Data Management | FR1-8 | `components/accounts/`, `lib/db/` | Account CRUD, Dexie persistence |
| Calculation Engine | FR9-23 | `lib/calculations/` | Strategy algorithms, interest formulas |
| Strategy Comparison | FR24-31 | `components/strategies/`, `pages/ComparePage` | Comparison UI, winner's podium |
| Progress Tracking | FR32-38 | `components/tracking/`, `pages/TrackPage` | Actual vs projected validation |
| Financial Health Dashboard | FR39-42 | `components/dashboard/`, `pages/DashboardPage` | Three critical numbers |
| Data Visualization | FR43-48 | `components/charts/` | Recharts implementations |
| User Experience | FR49-55 | `components/layout/`, `pages/` | Navigation, responsiveness |

## Technology Stack Details

### Core Technologies

| Technology | Purpose | Why Chosen |
|------------|---------|------------|
| **Vite** | Build tooling | Fast HMR, optimized production builds, Vitest integration |
| **React 19** | UI framework | Component model, hooks, large ecosystem |
| **TypeScript** | Language | Type safety, IDE support, refactoring confidence |
| **Tailwind CSS** | Styling | Utility-first, responsive, matches shadcn/ui |
| **shadcn/ui** | UI components | Accessible, customizable, React Hook Form integration |
| **Dexie.js** | Data persistence | IndexedDB wrapper, React hooks, offline-ready |
| **Zustand** | State management | Lightweight, selector-based, no providers |
| **big.js** | Precision math | Arbitrary precision decimals for financial calculations |
| **Recharts** | Data visualization | React-native charts, responsive, customizable |
| **date-fns** | Date handling | Tree-shakeable, SA date formatting |
| **React Hook Form** | Form handling | Uncontrolled inputs, Zod integration, shadcn native |
| **Zod** | Validation | TypeScript-first schema validation |
| **Vitest** | Testing | Vite-native, fast, Jest-compatible API |

### Integration Points

**No external integrations for MVP.** All functionality is client-side.

Future integration points (post-validation):
- **Dexie Cloud** - Multi-device sync and authentication
- **Open Banking APIs** - Automated transaction import
- **Export APIs** - PDF generation, CSV export

## Novel Pattern: Multi-Strategy Comparison Engine

### Pattern Overview

The core architectural innovation is a **Multi-Strategy Comparison Engine** that calculates 8-10 different debt payoff strategies simultaneously from the same financial snapshot.

```
┌─────────────────────────────────────────────────────────────────┐
│                     CALCULATION ENGINE                          │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐     ┌──────────────────────────────────────┐ │
│  │   Input      │     │         Strategy Registry            │ │
│  │   Snapshot   │────▶│  ┌─────────┐ ┌─────────┐ ┌─────────┐│ │
│  │              │     │  │Baseline │ │Snowball │ │Avalanche││ │
│  │ - Accounts   │     │  └─────────┘ └─────────┘ └─────────┘│ │
│  │ - Income     │     │  ┌─────────┐ ┌─────────┐ ┌─────────┐│ │
│  │ - Expenses   │     │  │Flexi    │ │Velocity │ │Hybrid   ││ │
│  │ - Flexi      │     │  │Chunking │ │Banking  │ │Strategies│ │
│  └──────────────┘     │  └─────────┘ └─────────┘ └─────────┘│ │
│                       └──────────────────────────────────────┘ │
│                                    │                            │
│                                    ▼                            │
│                       ┌──────────────────────────────────────┐ │
│                       │      Projection Generator            │ │
│                       │  - Month-by-month simulation         │ │
│                       │  - Interest calculations             │ │
│                       │  - Balance tracking                  │ │
│                       └──────────────────────────────────────┘ │
│                                    │                            │
│                                    ▼                            │
│                       ┌──────────────────────────────────────┐ │
│                       │      Comparison Aggregator           │ │
│                       │  - Debt-free date                    │ │
│                       │  - Total interest paid               │ │
│                       │  - Savings vs baseline               │ │
│                       │  - Effort rating                     │ │
│                       └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

### Core Interfaces

```typescript
// src/lib/calculations/types.ts

/** Snapshot of all financial data at calculation time */
interface FinancialSnapshot {
  accounts: DebtAccount[];
  flexiFacility: FlexiFacility | null;
  monthlyIncome: Big;
  monthlyExpenses: Big;
  availableSurplus: Big;
}

/** A single debt strategy definition */
interface DebtStrategy {
  id: string;
  name: string;
  description: string;
  effortLevel: 'low' | 'medium' | 'high';
  calculate(snapshot: FinancialSnapshot): MonthlyProjection[];
  allocatePayment(surplus: Big, accounts: DebtAccount[], flexi: FlexiFacility | null): PaymentAllocation[];
}

/** Complete strategy result for comparison */
interface StrategyProjection {
  strategyId: string;
  strategyName: string;
  effortLevel: 'low' | 'medium' | 'high';
  debtFreeMonth: number;
  debtFreeDate: string;
  totalInterestPaid: Big;
  monthsSaved: number;
  interestSaved: Big;
  monthlyProjections: MonthlyProjection[];
}
```

### Extensibility

Adding a new strategy requires only:
1. Create new file in `lib/calculations/strategies/`
2. Implement the `DebtStrategy` interface
3. Register in `strategies/index.ts`

No changes needed to engine, UI, or database.

## Implementation Patterns

These patterns ensure consistent implementation across all AI agents:

### Naming Conventions

| Category | Pattern | Example |
|----------|---------|---------|
| Files | kebab-case | `debt-account.ts` |
| React Components | PascalCase | `AccountCard.tsx` |
| Hooks | use prefix | `useAccounts.ts` |
| Types/Interfaces | PascalCase | `DebtAccount` |
| Functions | camelCase verb | `calculateInterest` |
| Constants | SCREAMING_SNAKE | `MAX_PROJECTION_MONTHS` |
| Zustand stores | use[Name]Store | `useUIStore` |
| Dexie tables | camelCase plural | `db.accounts` |

### Code Organization

| Pattern | Rule |
|---------|------|
| One component per file | Easier to find, test, refactor |
| Barrel exports | `index.ts` in each folder for clean imports |
| Co-located tests | `__tests__/` folder or `*.test.ts` next to file |
| Path aliases | Use `@/` prefix, avoid deep relative imports |

### Error Handling

**Pattern:** Result Type + Toast Notifications

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Calculation functions return Result
function calculateStrategy(snapshot: FinancialSnapshot): Result<StrategyProjection[]> {
  if (snapshot.accounts.length === 0) {
    return { success: false, error: new Error('No accounts provided') };
  }
  // ... calculation
  return { success: true, data: projections };
}

// React components show toast on error
const result = calculateStrategy(snapshot);
if (!result.success) {
  toast.error(result.error.message);
}
```

### Logging Strategy

**Pattern:** Console with prefixes

```typescript
export const logger = {
  info: (msg: string, data?: unknown) => console.log(`[INFO] ${msg}`, data),
  warn: (msg: string, data?: unknown) => console.warn(`[WARN] ${msg}`, data),
  error: (msg: string, data?: unknown) => console.error(`[ERROR] ${msg}`, data),
  calc: (msg: string, data?: unknown) => console.log(`[CALC] ${msg}`, data),
};
```

## Data Architecture

### Database Schema (Dexie.js)

```typescript
// src/lib/db/schema.ts
import Dexie from 'dexie';

class FlowlineDB extends Dexie {
  accounts!: Dexie.Table<DebtAccount, number>;
  flexiFacility!: Dexie.Table<FlexiFacility, number>;
  income!: Dexie.Table<IncomeEntry, number>;
  expenses!: Dexie.Table<ExpenseEntry, number>;
  balanceSnapshots!: Dexie.Table<BalanceSnapshot, number>;
  settings!: Dexie.Table<AppSettings, string>;

  constructor() {
    super('flowline-finance-studio');
    this.version(1).stores({
      accounts: '++id, name, type, createdAt',
      flexiFacility: '++id, name, createdAt',
      income: '++id, source, date',
      expenses: '++id, category, date',
      balanceSnapshots: '++id, accountId, date',
      settings: 'key',
    });
  }
}

export const db = new FlowlineDB();
```

### Core Data Types

```typescript
// Monetary values: string for big.js precision
// Dates: ISO string
// Rates: decimal (0.115 = 11.5%)

interface DebtAccount {
  id?: number;
  name: string;
  type: 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card';
  balance: string;           // "500000.00"
  interestRate: string;      // "0.115"
  minimumPayment: string;    // "5000.00"
  lender: string;
  interestType: 'monthly' | 'daily';
  createdAt: string;
  updatedAt: string;
}

interface FlexiFacility {
  id?: number;
  name: string;
  type: 'fnb_flexi' | 'standard_bank_access';
  creditLimit: string;
  currentBalance: string;
  interestRate: string;
  createdAt: string;
  updatedAt: string;
}

interface BalanceSnapshot {
  id?: number;
  accountId: number;
  date: string;              // ISO date
  balance: string;
  notes?: string;
  createdAt: string;
}
```

## API Contracts

**No external APIs for MVP.** All data operations are local via Dexie.

### Internal Data Flow

```
React Component
    │
    ├── useLiveQuery() ──────▶ Dexie (read)
    │
    ├── db.accounts.add() ───▶ Dexie (write)
    │
    └── useStore() ──────────▶ Zustand (UI state)
```

## Security Architecture

### Data Privacy (NFR-S1)

- **All data stored locally** in browser IndexedDB
- **No server transmission** - fully client-side application
- **No analytics tracking** of financial data values
- **User controls data** - can export/clear at any time

### Input Validation (NFR-S3)

- **Zod schemas** validate all form inputs
- **Numeric validation** prevents negative balances, invalid rates
- **Date validation** ensures logical date ranges
- **Type safety** via TypeScript prevents runtime errors

### Data Persistence (NFR-S2)

- **IndexedDB** persists across browser sessions
- **Manual clear option** for user control
- **JSON export** for user-controlled backup

## Performance Considerations

### Calculation Performance (NFR-P1)

| Requirement | Target | Strategy |
|-------------|--------|----------|
| All strategies calculated | < 3 seconds | Optimized big.js operations |
| 360-month projections | < 3 seconds | Efficient iteration |
| 5-10 accounts | < 3 seconds | Array operations |

### UI Performance (NFR-P2, NFR-P3)

| Requirement | Target | Strategy |
|-------------|--------|----------|
| Form inputs | < 100ms | React Hook Form (uncontrolled) |
| Chart rendering | < 2 seconds | Recharts with memoization |
| Page navigation | < 1 second | Simple conditional rendering |
| Auto-save | Background | Non-blocking Dexie writes |

### Bundle Size

| Package | Size (gzip) | Justification |
|---------|-------------|---------------|
| React | ~45KB | Core framework |
| Dexie | ~29KB | IndexedDB abstraction |
| Recharts | ~50KB | Chart rendering |
| big.js | ~6KB | Financial precision |
| Zustand | ~1KB | State management |
| date-fns | ~18KB | Tree-shakeable |

**Total estimated:** ~150KB gzip (acceptable for SPA)

## Deployment Architecture

### Static Hosting

```
┌─────────────────────────────────────────────┐
│              Static Host                    │
│  (GitHub Pages / Netlify / Vercel)          │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  index.html                         │   │
│  │  assets/                            │   │
│  │    ├── index-[hash].js              │   │
│  │    └── index-[hash].css             │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────┐
│           User's Browser                    │
│                                             │
│  ┌─────────────────────────────────────┐   │
│  │  React SPA                          │   │
│  │    ├── Zustand (UI State)           │   │
│  │    └── Dexie (IndexedDB)            │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Build & Deploy

```bash
# Build for production
npm run build

# Output: dist/
# Deploy dist/ to any static host

# Netlify
netlify deploy --prod --dir=dist

# Vercel
vercel --prod

# GitHub Pages
# Configure GitHub Actions to deploy dist/
```

## Development Environment

### Prerequisites

- **Node.js** 20.x or later
- **npm** 10.x or later
- **Modern browser** (Chrome, Firefox, Safari, Edge)
- **VS Code** (recommended) with extensions:
  - ESLint
  - Prettier
  - Tailwind CSS IntelliSense
  - TypeScript Vue Plugin (Volar)

### Setup Commands

```bash
# Clone repository
git clone https://github.com/[username]/flowline-finance-studio.git
cd flowline-finance-studio

# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Configuration

No environment variables required for MVP (fully client-side).

## Architecture Decision Records (ADRs)

### ADR-001: Client-Side Only Architecture

**Context:** MVP needs to validate debt strategies for personal use.

**Decision:** Build as fully client-side SPA with no backend.

**Consequences:**
- Zero hosting costs
- Full offline capability
- No authentication complexity
- Data stays on user's device
- Future multi-user requires architecture changes

### ADR-002: Dexie.js for Data Persistence

**Context:** Need structured data storage with offline capability.

**Decision:** Use Dexie.js wrapper over IndexedDB instead of localStorage.

**Consequences:**
- Structured queries with indexes
- Async operations don't block UI
- React hooks integration (useLiveQuery)
- Easy migration path to Dexie Cloud for sync
- Larger API surface than localStorage

### ADR-003: big.js for Financial Calculations

**Context:** JavaScript floating-point math causes precision errors (0.1 + 0.2 ≠ 0.3).

**Decision:** Use big.js for all monetary calculations.

**Consequences:**
- Cent-level accuracy guaranteed
- Slightly more verbose code
- String storage for precision preservation
- 6KB bundle size impact

### ADR-004: Strategy Pattern for Calculation Engine

**Context:** Need to support 8-10 different debt strategies with same interface.

**Decision:** Implement Strategy Pattern with common interface.

**Consequences:**
- Easy to add new strategies
- Each strategy isolated and testable
- Framework-agnostic (portable to React Native, Node.js)
- Some code duplication in projection generation

### ADR-005: Zustand over React Context

**Context:** Need global UI state management without prop drilling.

**Decision:** Use Zustand for UI state, Dexie for persistent data.

**Consequences:**
- No provider nesting
- Selector-based re-renders (performance)
- Clean separation: Zustand = UI, Dexie = data
- Two state sources to understand

### ADR-006: shadcn/ui + React Hook Form

**Context:** Need accessible, customizable form components.

**Decision:** Use shadcn/ui components with React Hook Form + Zod.

**Consequences:**
- Accessible by default (Radix primitives)
- Type-safe validation
- Minimal re-renders (uncontrolled inputs)
- Copy-paste components (full ownership)

---

_Generated by BMAD Decision Architecture Workflow v1.0_
_Date: 2025-11-28_
_For: Leith_
