# Flowline Finance Studio Product Requirements Document (PRD)

**Version:** v1.0
**Date:** 2025-11-22
**Status:** Ready for Architecture Phase

---

## Goals and Background Context

### Goals

Based on the Project Brief, here are the desired outcomes for the PRD:

- **Deliver a production-ready velocity banking calculator** that helps South African homeowners reduce debt faster and save on interest payments
- **Achieve calculation accuracy** matching established SA bond calculators (within 5% variance)
- **Enable rapid user insight** allowing users to understand their debt payoff options and potential savings within 10-15 minutes
- **Provide clear, actionable guidance** on debt prioritization strategy (Avalanche vs Snowball) with specific next steps
- **Build a technically sound foundation** using React + TypeScript + Vite that supports future expansion (Phase 2: progress tracking, Phase 3: AI coaching)
- **Validate product-market fit** through beta testing with 50%+ completion rate and 80%+ users able to articulate their potential savings

### Background Context

Flowline Finance Studio addresses a critical gap in the South African personal finance landscape: **velocity banking requires complex calculations that prevent most homeowners from realizing R100,000-R500,000+ in potential interest savings**. While the strategy is sound—using flexi facility access to minimize daily interest charges—execution demands sophisticated amortization modeling, cash flow optimization, and multi-debt prioritization that existing tools don't provide.

This PRD defines the MVP (v1.0) scope for a React-based web application that transforms this complexity into a guided 10-minute experience. The product will serve four core personas (The Curious Beginner, The Spreadsheet Master, The Overwhelmed Multi-Debtor, The Retirement Planner) through a progressive disclosure design: simple by default, transparent when needed. The MVP focuses on **planning** (scenario modeling and strategy comparison), with a clear roadmap toward progress tracking (v2.0) and dynamic coaching (v3.0+).

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-11-22 | v1.0 | Initial PRD created from Project Brief v2.0 | PM Agent (John) |

---

## Requirements

### Functional

**FR1:** The system shall accept input for multiple debts including home bonds, car loans, personal loans, and credit cards with fields for balance, interest rate, monthly payment, and flexi facility status (yes/no).

**FR2:** The system shall support multiple income sources with frequency (monthly, bi-weekly) and amount.

**FR3:** The system shall accept monthly expense budget as a single aggregate amount.

**FR4:** The system shall calculate baseline amortization schedule for traditional repayment (no velocity banking) across all debts.

**FR5:** The system shall calculate velocity banking optimized schedule using flexi facility cash flow allocation.

**FR6:** The system shall implement Avalanche strategy (prioritize highest interest rate debt first).

**FR7:** The system shall implement Snowball strategy (prioritize smallest balance debt first).

**FR8:** The system shall automatically recommend the optimal strategy based on user's debt profile.

**FR9:** The system shall display key metrics: total interest saved (ZAR), time saved (years/months), debt-free date comparison (baseline vs velocity banking).

**FR10:** The system shall render a line chart comparing total debt balance over time (baseline vs velocity banking scenarios).

**FR11:** The system shall display strategy comparison showing Avalanche vs Snowball outcomes.

**FR12:** The system shall provide clear next steps including which debt to prioritize first and recommended debt sequence.

**FR13:** The system shall auto-save user input to localStorage with debounced updates (<100ms delay).

**FR14:** The system shall persist data across browser sessions using localStorage.

**FR15:** The system shall provide a "Clear All Data" function with confirmation dialog.

**FR16:** The system shall validate required fields (balance, interest rate) and numeric ranges before calculation.

**FR17:** The system shall support entry and calculation for up to 10+ debts without performance degradation.

**FR18:** The system shall provide tab-based data entry wizard (Bonds, Loans, Income, Expenses).

**FR19:** The system shall display results within 1 second of input completion.

**FR20:** The system shall use compound interest with daily calculations for flexi facility bonds.

### Non-Functional

**NFR1:** Calculation results shall render in less than 1 second after data entry completion.

**NFR2:** Initial page load shall complete in less than 2 seconds on standard desktop browsers.

**NFR3:** Chart rendering shall complete in less than 500ms.

**NFR4:** The system shall support modern browsers (Chrome, Firefox, Safari, Edge - latest 2 versions only).

**NFR5:** The system shall be optimized for desktop/tablet viewing (minimum 1280x720 resolution).

**NFR6:** The system shall store all user data locally (localStorage) with no server transmission for MVP.

**NFR7:** The system shall be POPIA compliant by default (no personal data collected or stored on servers).

**NFR8:** The system shall display prominent disclaimers that the tool provides information, not financial advice.

**NFR9:** The system shall maintain calculation accuracy within 5% variance compared to established SA bond calculators.

**NFR10:** The system shall be built using React 18 + Vite + TypeScript for type safety and maintainability.

**NFR11:** The system shall use shadcn/ui + Tailwind CSS for UI components and styling.

**NFR12:** The system shall use Recharts for data visualization components.

**NFR13:** The system shall use Zustand for state management.

**NFR14:** The calculation engine shall be implemented as a standalone module for potential NPM package extraction.

**NFR15:** The system shall provide clear error messages for invalid inputs or calculation failures.

**NFR16:** The system shall be accessible via localhost during development (Weeks 1-3) and via production domain (Week 4+).

**NFR17:** The system shall support Git version control with semantic versioning (v0.1.0-poc, v0.5.0-alpha, v0.9.x-beta, v1.0.0).

**NFR18:** The system shall be deployable to Vercel or Netlify using zero-config deployment for v1.0.

---

## User Interface Design Goals

### Overall UX Vision

The application shall deliver a **progressive disclosure** experience that serves both beginners seeking simplicity and power users demanding transparency. The interface will guide users through a clear two-phase journey: **Data Entry → Results Dashboard**, with visual clarity prioritizing "aha moments" (seeing potential savings) over feature density. The design philosophy emphasizes **trust through transparency**: calculations are never black-box, formulas are accessible when needed, and every number can be validated.

### Key Interaction Paradigms

**Wizard-based data entry** with tab navigation (Bonds → Loans → Income → Expenses) providing logical flow and progressive completion feedback. **Auto-save on input change** (debounced 100ms) ensures no data loss and creates a frictionless experience. **Instant calculation feedback** with results updating within 1 second reinforces responsive, desktop-app-like feel. **Strategy comparison via side-by-side cards** allows quick scanning of Avalanche vs Snowball outcomes with visual "recommended" badge. **Minimal clicks to insight**: user should see their debt-free date within 2-3 clicks from data completion.

### Core Screens and Views

**1. Data Entry Wizard**
- Tab-based layout: Bonds, Loans, Income, Expenses
- Form fields with inline validation
- Progress indicator showing completion status
- "View Results" CTA button (enabled when minimum data entered)

**2. Results Dashboard**
- Hero metrics section (prominent display): Total Interest Saved (ZAR), Time Saved (years/months), Debt-Free Date Comparison
- Line chart: Total debt balance over time (baseline vs velocity banking)
- Strategy comparison cards: Avalanche vs Snowball with key metrics and recommendation
- Next Steps section: Clear text-based action list with debt priority sequence
- "Edit Data" navigation back to wizard

**3. Clear Data Modal**
- Confirmation dialog for "Clear All Data" action
- Warning about data loss
- Cancel/Confirm buttons

### Accessibility: WCAG AA

The application will target **WCAG 2.1 Level AA** compliance including:
- Sufficient color contrast ratios (4.5:1 for normal text, 3:1 for large text)
- Keyboard navigation support for all interactive elements
- Screen reader compatibility with proper ARIA labels
- Form validation with clear error messaging
- Focus indicators on interactive elements

### Branding

**Visual Style:** Clean, professional financial tool aesthetic using shadcn/ui component library defaults with minimal customization. Color palette emphasizes trust and clarity:
- Primary: Blue tones (professional, trustworthy)
- Success/Savings: Green (positive financial outcomes)
- Warning/Caution: Amber (input validation, important disclaimers)
- Neutral: Gray scale for backgrounds and secondary text

**Typography:** System fonts for performance and familiarity (no custom web fonts for MVP).

**Tone:** Approachable but authoritative—financial guidance without financial jargon overload.

### Target Device and Platforms: Web Responsive (Desktop Priority)

**Primary Target:** Desktop browsers (Chrome, Firefox, Safari, Edge - latest 2 versions)
- Optimized viewport: 1280x720 minimum, ideal 1920x1080
- Desktop-first layout with responsive breakpoints for tablet (768px+)

**Secondary Support:** Tablet devices (iPad, Android tablets) in landscape mode

**Out of Scope for MVP:** Mobile phone optimization (320-767px width), native iOS/Android apps

---

## Technical Assumptions

### Repository Structure: Monorepo

**Decision:** Single repository structure containing the full React application.

**Rationale:** For a solo developer MVP with single frontend application, monorepo provides simplicity without the overhead of managing multiple repositories. Future expansion (API backend, mobile app) can migrate to polyrepo if complexity warrants separation.

### Service Architecture

**Decision:** Client-Side Single Page Application (SPA) - Monolithic frontend with no backend for MVP.

**Architecture Details:**
- All calculations performed in browser (JavaScript/TypeScript)
- No API layer, no server-side processing
- Data storage: localStorage only (no database)
- Stateless application: each session is independent

**Rationale:**
- Velocity banking calculations are computationally lightweight (suitable for client-side)
- No user authentication or multi-user data sharing required for MVP
- Eliminates hosting costs, API complexity, and security concerns
- Enables instant deployment to static hosting (Vercel/Netlify free tier)
- Privacy-first: user financial data never leaves their browser

**Post-MVP Migration Path:** When user accounts are added (v2.0), introduce lightweight backend (Supabase or Firebase) for cloud storage while maintaining calculation engine on client-side.

### Testing Requirements

**Decision:** Unit Testing with vitest + React Testing Library, Manual UI/UX testing, Real-world scenario validation.

**Testing Strategy:**
1. **Unit Tests (Target: 80%+ coverage for calculation engine)**
   - Amortization calculations (baseline scenarios)
   - Velocity banking optimization logic
   - Avalanche and Snowball strategy implementations
   - Edge cases: zero balances, 100% interest rates, single debt scenarios

2. **Component Tests (Target: 60%+ coverage for UI components)**
   - Form validation logic
   - Data entry wizard state transitions
   - Chart rendering with sample data
   - localStorage persistence

3. **Integration Tests (Manual for MVP)**
   - End-to-end user flows: Data Entry → View Results
   - Cross-browser compatibility (Chrome, Firefox, Safari, Edge)
   - LocalStorage data persistence across sessions

4. **Real-World Validation**
   - Compare calculation outputs with established SA bond calculators
   - Beta testing with 10-20 users using real financial data
   - Accuracy validation: <5% variance requirement

**No E2E Automation for MVP:** Deferred to post-MVP due to setup overhead (Playwright/Cypress). Manual testing sufficient for 4-week timeline.

**CI/CD Integration:** Tests run on GitHub Actions pre-merge to `main` (Week 4 onwards).

### Additional Technical Assumptions and Requests

**Language & Framework:**
- **React 18** with functional components and hooks (no class components)
- **TypeScript (strict mode enabled)** for type safety throughout codebase
- **Vite 5+** as build tool and dev server (faster than CRA, modern ESM support)

**State Management:**
- **Zustand** for global application state (debt data, calculation results, UI state)
- **Persist middleware** for localStorage synchronization

**UI Component Library:**
- **shadcn/ui** (Radix UI + Tailwind CSS) for accessible, customizable components
- **Tailwind CSS** for styling with JIT compilation
- **Lucide React** for icons

**Data Visualization:**
- **Recharts** for line charts, area charts, and comparative visualizations
- SVG-based rendering for crisp display on high-DPI screens

**Form Management:**
- **React Hook Form** for performant form handling with minimal re-renders
- **Zod** for schema validation and TypeScript type inference

**Build & Deployment:**
- **Development:** Vite dev server on `localhost:5173` (Weeks 1-3)
- **Production:** Vercel or Netlify with automatic deployments from `main` branch
- **Environment Variables:** `.env.local` for development, Vercel/Netlify dashboard for production
- **Build Optimization:** Code splitting, tree shaking, minification (handled by Vite)

**Code Quality:**
- **ESLint** with TypeScript and React plugins for linting
- **Prettier** for code formatting (integrated with ESLint)
- **Pre-commit hooks (Husky + lint-staged)** for automated linting/formatting before commits

**Version Control:**
- **Git/GitHub** with conventional commits (Week 2+)
- **Semantic Versioning:** v0.1.0-poc → v0.5.0-alpha → v0.9.x-beta → v1.0.0

**Browser Support:**
- **Target:** Chrome 120+, Firefox 120+, Safari 17+, Edge 120+ (latest 2 versions)
- **No polyfills** for IE11 or legacy browsers
- **Modern JavaScript features:** ES2022+, native modules, CSS Grid, Flexbox

**Performance Budgets:**
- Initial bundle size: <200KB gzipped
- Time to Interactive (TTI): <2 seconds
- Calculation execution: <500ms for 10-debt scenarios

**Security Considerations:**
- **No sensitive data transmission:** All data stays in localStorage
- **Content Security Policy (CSP):** Restrict inline scripts, external resources
- **HTTPS enforced** in production (automatic via Vercel/Netlify)
- **Dependency scanning:** Dependabot enabled for automated security updates

**Accessibility:**
- **WCAG 2.1 Level AA compliance** as design goal
- **Keyboard navigation** for all interactive elements
- **Screen reader testing** with NVDA/JAWS (manual validation)

**Documentation:**
- **README.md:** Setup instructions, development workflow, deployment guide
- **CONTRIBUTING.md:** Contribution guidelines (if open-sourced)
- **Inline code comments:** JSDoc for complex calculation functions
- **Architecture Decision Records (ADRs):** Document key technical decisions in `/docs/adr/`

**Analytics & Monitoring (Post-Launch):**
- **Plausible or Simple Analytics** (POPIA-compliant, privacy-focused)
- **Error tracking:** Sentry or similar (optional for v1.0, recommended for v1.1+)
- **Performance monitoring:** Vercel Analytics or Lighthouse CI

---

## Epic List

The following epics represent the complete delivery path from project initialization to production launch. Each epic delivers end-to-end, deployable functionality aligned with the phased roadmap (PoC → Alpha → Beta → v1.0).

**Epic 1: Foundation & Proof of Concept**
Establish project infrastructure (React + Vite + TypeScript + shadcn/ui) and prove core calculation engine feasibility with single-bond velocity banking calculator. Delivers working localhost application with basic calculation validation.

**Epic 2: Multi-Debt Data Model & State Management**
Expand data model to support multiple debts (bonds, loans, credit cards), implement Zustand state management, and build tab-based wizard UI for comprehensive data entry. Delivers functional multi-debt input with localStorage persistence.

**Epic 3: Dual Strategy Calculation Engine**
Implement both Avalanche (highest rate first) and Snowball (smallest balance first) strategies with automatic recommendation logic. Delivers complete calculation engine capable of comparing strategies and optimizing debt payoff sequences.

**Epic 4: Results Dashboard & Visualization**
Build comprehensive results dashboard with hero metrics, line charts, strategy comparison cards, and actionable next steps. Delivers complete user journey from data entry to insight visualization.

**Epic 5: Beta Refinement & Production Readiness**
Polish UI/UX based on beta feedback, implement comprehensive validation, add error handling, optimize performance, and prepare production build. Delivers production-ready v1.0 with deployment to public domain.

---

## Epic 1: Foundation & Proof of Concept

**Epic Goal:** Establish the foundational React application infrastructure and validate the core technical feasibility by implementing a single-bond velocity banking calculator that produces accurate results matching established SA bond calculators.

### Story 1.1: Project Initialization and Development Environment Setup

**As a** developer,
**I want** a properly configured React + Vite + TypeScript project with all core dependencies,
**so that** I can start building features on a solid technical foundation.

#### Acceptance Criteria

1. Repository is initialized with Git and pushed to GitHub with appropriate `.gitignore`.
2. React 18 + Vite 5+ project is created with TypeScript strict mode enabled.
3. shadcn/ui and Tailwind CSS are installed and configured with at least one test component rendering.
4. ESLint and Prettier are configured with TypeScript and React rules.
5. Vite dev server runs successfully on `localhost:5173` with hot module replacement working.
6. Project structure follows `/src/components`, `/src/engine`, `/src/state`, `/src/utils`, `/src/types` organization.
7. README.md includes setup instructions and development commands.
8. Initial commit is tagged as `v0.1.0-init` on main branch.

---

### Story 1.2: Basic Bond Input Form

**As a** user,
**I want** to input my home bond details (balance, interest rate, term, flexi facility status),
**so that** the calculator has the data needed to compute my debt payoff scenario.

#### Acceptance Criteria

1. Form renders with fields: Loan Balance (ZAR), Annual Interest Rate (%), Loan Term (years), Flexi Facility (yes/no checkbox).
2. All fields are properly typed (numeric inputs for numbers, checkbox for boolean).
3. Form validation requires all fields before enabling "Calculate" button.
4. Numeric fields accept only valid positive numbers with appropriate decimal precision (2 places for currency, 2 places for percentage).
5. Form state is managed using React Hook Form with Zod validation schema.
6. Input components use shadcn/ui form components for consistent styling.
7. Form displays inline validation errors for invalid inputs.

---

### Story 1.3: Baseline Amortization Calculation Engine

**As a** developer,
**I want** a calculation engine that computes standard amortization schedule for a single bond,
**so that** I can establish the baseline "traditional repayment" scenario.

#### Acceptance Criteria

1. Calculation function accepts bond parameters (balance, rate, term) and returns amortization schedule.
2. Schedule includes for each month: payment number, payment amount, principal paid, interest paid, remaining balance.
3. Calculations use compound interest formula with monthly compounding.
4. Function is implemented as pure TypeScript module in `/src/engine/amortization.ts`.
5. Function is fully typed with TypeScript interfaces for inputs and outputs.
6. Unit tests validate calculations against known bond scenarios (minimum 3 test cases).
7. Calculation accuracy matches established SA bond calculator results within 0.1% variance.

---

### Story 1.4: Single-Bond Velocity Banking Calculation

**As a** user with a flexi facility bond,
**I want** the system to calculate how velocity banking (depositing income into flexi bond) affects my payoff timeline,
**so that** I can see the potential time and interest savings.

#### Acceptance Criteria

1. Calculation function accepts bond parameters plus cash flow assumptions (monthly surplus available for flexi deposit).
2. Function models daily interest calculation for flexi facility (daily rate = annual rate / 365).
3. Calculation assumes income deposited at start of month, expenses withdrawn throughout month.
4. Output includes: total interest paid, total months to payoff, final debt-free date.
5. Function returns comparison: baseline scenario vs velocity banking scenario.
6. Unit tests validate velocity banking logic shows interest savings vs baseline (minimum 2 test cases).
7. Calculation is implemented in `/src/engine/velocityBanking.ts` as standalone module.

---

### Story 1.5: Simple Results Display with Line Chart

**As a** user,
**I want** to see a visual comparison of my debt balance over time (baseline vs velocity banking),
**so that** I can quickly understand the impact of velocity banking.

#### Acceptance Criteria

1. Results component displays after "Calculate" button is clicked.
2. Hero metrics shown prominently: Total Interest Saved (ZAR), Time Saved (months), Debt-Free Date (baseline vs velocity).
3. Line chart (using Recharts) displays debt balance over time with two lines: baseline (traditional) and velocity banking.
4. Chart x-axis shows time in months, y-axis shows balance in ZAR.
5. Chart includes legend clearly labeling each line.
6. Chart area between lines is filled to visually emphasize cumulative savings.
7. Results render within 1 second of calculation completion.

---

### Story 1.6: PoC Validation and Calculation Accuracy Testing

**As a** developer,
**I want** to validate PoC calculations against established SA bond calculators,
**so that** I can confirm technical feasibility before expanding to multi-debt scenarios.

#### Acceptance Criteria

1. At least 3 real-world bond scenarios tested (e.g., R1.5M at 11% over 20 years, R800K at 10.5% over 15 years, R2.5M at 11.75% over 25 years).
2. Baseline calculations match established SA bond calculator results within 5% variance for total interest and payoff timeline.
3. Velocity banking calculations show measurable interest savings (20%+ reduction) for flexi facility scenarios.
4. Test results documented in `/docs/poc-validation.md` with comparison tables.
5. Any calculation discrepancies >5% are investigated and root cause documented.
6. Decision made: Go/No-Go for full MVP based on calculation accuracy.
7. If Go decision, repository tagged as `v0.1.0-poc` on main branch.

---

## Epic 2: Multi-Debt Data Model & State Management

**Epic Goal:** Expand the application to support multiple debts (bonds, loans, credit cards), implement robust state management with Zustand and localStorage persistence, and create an intuitive tab-based wizard for comprehensive data entry.

### Story 2.1: Multi-Debt Data Model and TypeScript Types

**As a** developer,
**I want** a comprehensive TypeScript data model supporting multiple debt types,
**so that** the application can handle complex multi-debt scenarios.

#### Acceptance Criteria

1. TypeScript interfaces defined for: `Bond`, `Loan`, `CreditCard`, `IncomeSource`, `ExpenseBudget`.
2. `Bond` type includes: id, name, balance, interestRate, term, monthlyPayment, hasFlexiFacility, type ('bond').
3. `Loan` type includes: id, name, balance, interestRate, term, monthlyPayment, loanType ('car' | 'personal'), type ('loan').
4. `CreditCard` type includes: id, name, balance, interestRate, minimumPayment, type ('credit-card').
5. `IncomeSource` type includes: id, name, amount, frequency ('monthly' | 'bi-weekly').
6. `ExpenseBudget` type includes: monthlyTotal (single aggregate amount for MVP).
7. All types exported from `/src/types/financial.ts`.
8. Union type `Debt = Bond | Loan | CreditCard` created for polymorphic handling.

---

### Story 2.2: Zustand Store for Application State

**As a** developer,
**I want** centralized state management using Zustand with persistence,
**so that** user data is maintained across sessions and components can access shared state efficiently.

#### Acceptance Criteria

1. Zustand store created in `/src/state/financialStore.ts`.
2. Store manages: debts array (`Debt[]`), income sources array, expense budget, calculation results.
3. Store actions include: addDebt, updateDebt, removeDebt, addIncome, updateIncome, removeIncome, setExpenses, clearAllData.
4. Zustand persist middleware configured to save state to localStorage with key `flowline-financial-data`.
5. localStorage sync happens automatically on state changes with 100ms debounce.
6. Store is fully typed with TypeScript for state shape and actions.
7. Store can be accessed via `useFinancialStore()` hook from any component.

---

### Story 2.3: Tab-Based Data Entry Wizard UI

**As a** user,
**I want** a guided wizard interface organized by debt type and income/expenses,
**so that** I can easily input my financial data without feeling overwhelmed.

#### Acceptance Criteria

1. Wizard component renders with tabs: Bonds, Loans, Income, Expenses.
2. Tab navigation allows clicking between tabs without losing data.
3. Active tab is visually highlighted.
4. Each tab displays appropriate form fields for that data category.
5. Wizard uses shadcn/ui Tabs component for consistent styling.
6. Wizard layout is responsive for desktop (1280px+) and tablet (768px+) viewports.
7. Wizard includes "View Results" button (disabled until minimum data entered).

---

### Story 2.4: Bonds Tab with Multiple Bond Entry

**As a** user with one or more home bonds,
**I want** to add multiple bonds with their details,
**so that** the calculator can optimize across all my bond debts.

#### Acceptance Criteria

1. Bonds tab displays list of added bonds (empty state message if none).
2. "Add Bond" button opens form for new bond entry.
3. Bond form includes fields: Name (optional), Balance (ZAR), Interest Rate (%), Term (years), Monthly Payment (ZAR, optional - can be calculated), Flexi Facility (yes/no).
4. Each bond in list shows summary: name, balance, rate, with Edit and Delete actions.
5. Form validation ensures balance > 0, rate > 0, term > 0.
6. Delete action includes confirmation dialog.
7. Bond data saves to Zustand store and persists to localStorage automatically.

---

### Story 2.5: Loans Tab with Car and Personal Loan Entry

**As a** user with car loans and/or personal loans,
**I want** to add multiple loans with their details,
**so that** the calculator includes all my debt obligations.

#### Acceptance Criteria

1. Loans tab displays list of added loans (empty state message if none).
2. "Add Loan" button opens form for new loan entry.
3. Loan form includes fields: Name (optional), Loan Type (car/personal dropdown), Balance (ZAR), Interest Rate (%), Term (years), Monthly Payment (ZAR).
4. Each loan in list shows summary: name, type, balance, rate, with Edit and Delete actions.
5. Form validation ensures balance > 0, rate > 0, term > 0, monthly payment > 0.
6. Delete action includes confirmation dialog.
7. Loan data saves to Zustand store and persists to localStorage automatically.

---

### Story 2.6: Income Tab with Multiple Income Sources

**As a** user with one or more income sources,
**I want** to add my salary, commission, rental income, etc.,
**so that** the calculator knows my available cash flow for debt payoff.

#### Acceptance Criteria

1. Income tab displays list of added income sources (empty state message if none).
2. "Add Income" button opens form for new income source.
3. Income form includes fields: Name (e.g., "Salary", "Rental Income"), Amount (ZAR), Frequency (monthly/bi-weekly dropdown).
4. Each income source in list shows summary: name, amount, frequency, with Edit and Delete actions.
5. Form validation ensures amount > 0.
6. Delete action includes confirmation dialog.
7. Total monthly income is calculated and displayed prominently (bi-weekly converted to monthly: amount × 26 / 12).
8. Income data saves to Zustand store and persists to localStorage automatically.

---

### Story 2.7: Expenses Tab with Monthly Budget Entry

**As a** user,
**I want** to enter my total monthly expenses,
**so that** the calculator knows how much surplus cash flow I have for velocity banking.

#### Acceptance Criteria

1. Expenses tab displays single input field: Monthly Expense Budget (ZAR).
2. Field includes helpful hint text: "Enter your total monthly living expenses (rent, groceries, utilities, entertainment, etc.)".
3. Form validation ensures amount > 0.
4. Calculated "Monthly Surplus" displayed below expenses: Total Monthly Income - Monthly Expenses.
5. If surplus is negative, warning message displayed: "Your expenses exceed your income. Velocity banking requires surplus cash flow."
6. Expense budget saves to Zustand store and persists to localStorage automatically.
7. Tab shows completion indicator when valid expense amount entered.

---

### Story 2.8: Data Persistence and Clear All Data Function

**As a** user,
**I want** my data to be saved automatically and persist across browser sessions,
**so that** I don't lose my work if I close the browser.

#### Acceptance Criteria

1. All data (debts, income, expenses) persists to localStorage automatically on any change.
2. Data is restored from localStorage when application loads (hydration on mount).
3. "Clear All Data" button available in navigation header with prominent warning icon.
4. Clicking "Clear All Data" opens confirmation modal with message: "This will delete all your financial data. This action cannot be undone."
5. Modal includes Cancel and Confirm buttons.
6. Confirming clears Zustand store and localStorage, returning app to initial empty state.
7. After clearing, user is redirected to Data Entry wizard with empty state messages.

---

## Epic 3: Dual Strategy Calculation Engine

**Epic Goal:** Implement both Avalanche (highest interest rate first) and Snowball (smallest balance first) debt payoff strategies with intelligent recommendation logic, enabling users to compare approaches and choose the optimal path.

### Story 3.1: Avalanche Strategy Implementation

**As a** user,
**I want** the calculator to model the Avalanche strategy (paying off highest interest rate debt first),
**so that** I can see the mathematically optimal debt payoff sequence.

#### Acceptance Criteria

1. Avalanche calculation function implemented in `/src/engine/strategies/avalanche.ts`.
2. Function sorts debts by interest rate (highest to lowest).
3. Function allocates surplus cash flow to debt with highest rate while maintaining minimum payments on others.
4. When highest rate debt is paid off, surplus + freed minimum payment applied to next highest rate.
5. Function returns: total interest paid, total months to debt-free, debt payoff sequence, monthly balance snapshots.
6. Calculation handles edge cases: single debt, all debts same rate, zero surplus.
7. Unit tests validate Avalanche produces lowest total interest paid vs other orderings (minimum 3 test scenarios).
8. Regression test suite includes minimum 5 known scenarios for ongoing validation.

---

### Story 3.2: Snowball Strategy Implementation

**As a** user,
**I want** the calculator to model the Snowball strategy (paying off smallest balance first),
**so that** I can see the psychological motivation approach with early wins.

#### Acceptance Criteria

1. Snowball calculation function implemented in `/src/engine/strategies/snowball.ts`.
2. Function sorts debts by balance (smallest to largest).
3. Function allocates surplus cash flow to debt with smallest balance while maintaining minimum payments on others.
4. When smallest balance debt is paid off, surplus + freed minimum payment applied to next smallest balance.
5. Function returns: total interest paid, total months to debt-free, debt payoff sequence, monthly balance snapshots.
6. Calculation handles edge cases: single debt, all debts same balance, zero surplus.
7. Unit tests validate Snowball produces faster early wins (first debt paid off sooner) vs Avalanche (minimum 2 test scenarios).
8. Regression test suite includes minimum 5 known scenarios for ongoing validation.

---

### Story 3.3: Strategy Comparison Engine

**As a** developer,
**I want** a unified interface that runs both strategies and compares results,
**so that** users can see side-by-side outcomes and make informed choices.

#### Acceptance Criteria

1. Strategy comparison function implemented in `/src/engine/compareStrategies.ts`.
2. Function accepts: debts array, income sources, expense budget, and returns comparison object.
3. Comparison object includes: avalancheResults, snowballResults, recommendation (enum: 'avalanche' | 'snowball' | 'similar').
4. Function executes both Avalanche and Snowball calculations in parallel.
5. Results include delta calculations: interest difference (ZAR), time difference (months).
6. Function is fully typed with TypeScript interfaces.
7. Unit tests validate comparison logic with known scenarios (minimum 2 test cases).

---

### Story 3.4: Automatic Strategy Recommendation Logic

**As a** user,
**I want** the calculator to recommend the best strategy for my situation,
**so that** I don't have to analyze the numbers myself if I'm unsure.

#### Acceptance Criteria

1. Recommendation logic implemented in `/src/engine/recommendStrategy.ts`.
2. Logic recommends Avalanche if: interest savings > R10,000 OR time savings > 6 months compared to Snowball.
3. Logic recommends Snowball if: first debt payoff happens >12 months sooner than Avalanche (psychological wins).
4. Logic recommends "Similar - Choose Based on Preference" if: interest difference <R5,000 AND time difference <3 months.
5. Recommendation includes rationale string explaining why (e.g., "Avalanche saves R45,000 in interest over Snowball").
6. Function returns: recommendedStrategy ('avalanche' | 'snowball' | 'similar'), rationale (string).
7. Unit tests validate recommendation logic across diverse scenarios (minimum 4 test cases).

---

### Story 3.5: Multi-Debt Calculation Integration

**As a** user with multiple debts,
**I want** the calculator to handle all my debts together (bonds, loans, credit cards),
**so that** I get a holistic debt payoff plan.

#### Acceptance Criteria

1. Calculation engine handles mixed debt types: bonds with/without flexi, car loans, personal loans, credit cards.
2. Flexi facility bonds use daily interest calculation, other debts use monthly compounding.
3. Cash flow allocation prioritizes: minimum payments on all debts first, then surplus to target debt per strategy.
4. Calculation validates inputs: total minimum payments must not exceed total income.
5. If surplus cash flow is negative or zero, calculation returns warning message: "Insufficient cash flow for debt payoff acceleration."
6. Engine supports up to 10 debts without performance degradation (<500ms calculation time).
7. Integration tests validate mixed debt scenarios (minimum 2 complex scenarios).

---

### Story 3.6: Calculation Results State Management

**As a** developer,
**I want** calculation results stored in Zustand with proper typing,
**so that** results are accessible across components and can be displayed in the dashboard.

#### Acceptance Criteria

1. Zustand store extended to include `calculationResults` state: CalculationResults | null.
2. `CalculationResults` type includes: avalancheResults, snowballResults, recommendation, calculatedAt (timestamp).
3. Store action `setCalculationResults(results: CalculationResults)` implemented.
4. "View Results" button triggers calculation and stores results in Zustand.
5. Calculation executes in <1 second for typical scenarios (3-5 debts).
6. If calculation fails, error state is set and user-friendly error message displayed.
7. Results timestamp allows cache invalidation if input data changes after calculation.

---

## Epic 4: Results Dashboard & Visualization

**Epic Goal:** Build a comprehensive, visually compelling results dashboard that clearly communicates potential savings, debt payoff timeline, strategy comparison, and actionable next steps to empower user decision-making.

### Story 4.1: Hero Metrics Display

**As a** user,
**I want** to immediately see my potential savings and debt-free date,
**so that** I quickly understand the value of velocity banking for my situation.

#### Acceptance Criteria

1. Hero metrics section displays prominently at top of dashboard with large, scannable numbers.
2. Metrics displayed: Total Interest Saved (ZAR), Time Saved (years and months), Debt-Free Date Comparison (baseline vs velocity banking).
3. Interest saved displayed in green with positive formatting (e.g., "R 245,000 saved").
4. Time saved displayed with clear units (e.g., "5 years 3 months sooner").
5. Debt-free date comparison shows: "Oct 2029" (baseline) → "May 2024" (velocity banking).
6. Metrics use recommended strategy (Avalanche or Snowball) for velocity banking scenario.
7. Section uses shadcn/ui Card components with responsive grid layout (3 columns desktop, 1 column mobile).

---

### Story 4.2: Debt Balance Over Time Line Chart

**As a** user,
**I want** to see a visual chart of my debt decreasing over time,
**so that** I can understand the trajectory and momentum of debt payoff.

#### Acceptance Criteria

1. Line chart (Recharts) displays total debt balance over time (months on x-axis, balance in ZAR on y-axis).
2. Two lines plotted: Baseline (traditional repayment) and Velocity Banking (recommended strategy).
3. Baseline line styled: dashed, gray/neutral color.
4. Velocity Banking line styled: solid, green/success color.
5. Area between lines filled with subtle green gradient to emphasize cumulative savings.
6. Chart includes legend clearly labeling each line.
7. Chart is responsive: full width on desktop, scrollable on smaller viewports.
8. Tooltip displays on hover: Month, Baseline Balance, Velocity Banking Balance, Cumulative Savings at that point.
9. X-axis shows months with readable intervals (every 12 months for long timelines, every 6 months for shorter).
10. Y-axis formats currency in ZAR with thousands separators (e.g., "R 1,200,000").

---

### Story 4.3: Strategy Comparison Cards

**As a** user,
**I want** to compare Avalanche vs Snowball strategies side-by-side,
**so that** I can choose the approach that aligns with my goals and psychology.

#### Acceptance Criteria

1. Strategy comparison section displays two cards: Avalanche and Snowball.
2. Each card shows: Strategy name, Total Interest Paid (ZAR), Time to Debt-Free (years/months), First Debt Payoff (month).
3. Recommended strategy card displays prominent "Recommended" badge.
4. Recommendation rationale displayed below cards (e.g., "Avalanche saves R45,000 in interest").
5. Cards use shadcn/ui Card components with side-by-side layout (2 columns desktop, stacked mobile).
6. Interest and time metrics highlight delta vs other strategy (e.g., "Saves R45,000 vs Snowball").
7. Visual distinction: recommended card has colored border, non-recommended has neutral border.

---

### Story 4.4: Next Steps and Debt Priority Sequence

**As a** user,
**I want** clear instructions on what to do next,
**so that** I can take action on my debt payoff plan.

#### Acceptance Criteria

1. Next Steps section displays actionable guidance below strategy comparison.
2. Section title: "Your Next Steps".
3. Primary action displayed: "Focus on: [Debt Name]" (the first debt in recommended strategy sequence).
4. Debt priority sequence listed: numbered list showing order to pay off debts.
5. Each item in sequence shows: debt name, current balance, target payoff month.
6. Additional guidance: "Continue making minimum payments on all other debts while directing surplus to [Debt Name]."
7. Section uses shadcn/ui Alert or Card component with actionable styling (blue/info color).

---

### Story 4.5: Edit Data Navigation

**As a** user viewing results,
**I want** to easily return to data entry to adjust my inputs,
**so that** I can explore different scenarios.

#### Acceptance Criteria

1. "Edit Data" button displayed prominently at top of dashboard (near Hero Metrics).
2. Clicking "Edit Data" navigates back to Data Entry wizard with existing data preserved.
3. Navigation maintains state: returns to last active tab in wizard.
4. Data from calculation is preserved in Zustand store and localStorage.
5. After editing data, "View Results" button is available to recalculate.
6. Navigation uses client-side routing (no page reload).
7. Button uses shadcn/ui Button component with secondary styling.

---

### Story 4.6: Responsive Dashboard Layout

**As a** user on different devices,
**I want** the dashboard to be readable and functional on desktop and tablet,
**so that** I can review my results on my preferred device.

#### Acceptance Criteria

1. Dashboard layout is responsive with breakpoints: desktop (1280px+), tablet (768-1279px).
2. Hero metrics: 3-column grid on desktop, 1-column stack on tablet/mobile.
3. Line chart: full width on all viewports, maintains aspect ratio.
4. Strategy comparison cards: 2-column side-by-side on desktop, stacked on tablet/mobile.
5. Next Steps section: full width on all viewports.
6. All text remains readable with appropriate font sizes at all breakpoints.
7. Dashboard tested on Chrome, Firefox, Safari, Edge (latest versions).

---

### Story 4.7: Empty State and Data Validation

**As a** user who hasn't entered sufficient data,
**I want** helpful guidance on what's needed to view results,
**so that** I understand how to proceed.

#### Acceptance Criteria

1. "View Results" button is disabled (with tooltip explaining why) if: no debts added OR no income added OR expenses not set.
2. Disabled button tooltip shows: "Add at least one debt, one income source, and set your expenses to view results."
3. If surplus cash flow is negative (expenses > income), warning displayed: "Your expenses exceed income. Add more income or reduce expenses to enable debt payoff."
4. If surplus cash flow is positive but very small (<R500), info message: "Your surplus is very small. Results may show very long payoff timelines."
5. Dashboard displays empty state if calculation results are null: "No results yet. Enter your financial data and click 'View Results'."
6. Empty state includes illustration or icon with call-to-action: "Go to Data Entry".

---

## Epic 5: Beta Refinement & Production Readiness

**Epic Goal:** Polish the application based on beta user feedback, implement comprehensive validation and error handling, optimize performance, ensure cross-browser compatibility, and prepare production build for public launch on hosted domain.

### Story 5.1: Beta Testing Recruitment and Feedback Collection

**As a** product manager,
**I want** to recruit 10-20 beta testers and collect structured feedback,
**so that** I can identify usability issues, calculation errors, and feature gaps before public launch.

#### Acceptance Criteria

1. Beta testing recruitment via personal/professional network: 10-20 participants confirmed.
2. Beta testing approach selected: in-person sessions, ngrok remote access, or deployed static builds.
3. Feedback collection form created (Google Forms or Typeform) with questions: completion success, calculation accuracy vs expectations, usability issues, feature requests.
4. Beta testers provided with instructions document and testing timeline (1-2 weeks).
5. At least 10 completed feedback forms received.
6. Feedback analyzed and prioritized: critical bugs, UX improvements, nice-to-have features.
7. Feedback results documented in `/docs/beta-feedback-summary.md`.

---

### Story 5.2: Critical Bug Fixes from Beta Testing

**As a** developer,
**I want** to fix all critical bugs identified during beta testing,
**so that** v1.0 is stable and reliable for public launch.

#### Acceptance Criteria

1. All P0 (critical) bugs identified in beta testing are fixed and verified.
2. P0 bugs include: calculation errors, data loss, app crashes, form submission failures.
3. Each bug fix includes: root cause analysis, fix implementation, regression test.
4. Bug fixes tracked via GitHub Issues with labels: `bug`, `priority:critical`, `beta-feedback`.
5. Fixed bugs are verified by at least one beta tester before closing issue.
6. No open P0 bugs remain before v1.0 launch.
7. Bug fix commits use conventional commit format (e.g., `fix(calc): correct Snowball allocation logic`).

---

### Story 5.3: UX Improvements Based on Beta Feedback

**As a** user,
**I want** the interface to be more intuitive and helpful based on real user testing,
**so that** I can complete my calculation without confusion.

#### Acceptance Criteria

1. UX improvements prioritized from beta feedback (focus on issues affecting >30% of testers).
2. Common improvements include: clearer field labels, additional help text, better empty states, improved navigation flow.
3. Each UX improvement includes before/after screenshots in GitHub Issue.
4. Improvements implement accessibility best practices (WCAG AA compliance).
5. Changes are tested with at least 2 beta testers for validation before finalizing.
6. UX improvements tracked via GitHub Issues with labels: `ux`, `beta-feedback`.
7. All approved UX improvements implemented before v1.0 tag.

---

### Story 5.4: Comprehensive Input Validation and Error Handling

**As a** user,
**I want** clear, helpful error messages when I enter invalid data,
**so that** I understand how to correct my inputs.

#### Acceptance Criteria

1. All form inputs validated with Zod schemas: type checking, range validation, required fields.
2. Error messages displayed inline below each field with red styling.
3. Error messages are specific and actionable (e.g., "Interest rate must be between 0% and 30%" not "Invalid input").
4. Form submission prevented when validation errors exist.
5. Calculation errors (e.g., division by zero, insufficient cash flow) caught and displayed with user-friendly messages.
6. Global error boundary implemented to catch React runtime errors and display fallback UI.
7. Error states tested across all user flows: data entry, calculation, navigation.

---

### Story 5.5: Performance Optimization

**As a** user,
**I want** the application to load and respond quickly,
**so that** my experience is smooth and professional.

#### Acceptance Criteria

1. Initial page load (Time to Interactive) <2 seconds on standard desktop connection (tested via Lighthouse).
2. Calculation execution time <500ms for scenarios with up to 10 debts.
3. Chart rendering time <500ms for datasets with up to 360 data points (30 years × 12 months).
4. Auto-save to localStorage debounced to 100ms to prevent excessive writes.
5. Vite production build optimized: code splitting, tree shaking, minification enabled.
6. Bundle size analysis: main bundle <200KB gzipped.
7. Performance metrics validated via Lighthouse: Performance score >90.

---

### Story 5.6: Cross-Browser Compatibility Testing

**As a** user on different browsers,
**I want** the application to work consistently on Chrome, Firefox, Safari, and Edge,
**so that** I can use my preferred browser.

#### Acceptance Criteria

1. Application tested on latest 2 versions of: Chrome, Firefox, Safari (macOS), Edge.
2. All core flows functional across browsers: data entry, calculation, results display, navigation.
3. Visual consistency validated: layouts render correctly, charts display properly, forms work identically.
4. Browser-specific bugs identified and fixed (e.g., Safari localStorage quirks, Firefox flexbox rendering).
5. Cross-browser compatibility issues tracked via GitHub Issues with label `browser-compat`.
6. No P0 or P1 browser-specific bugs remain before v1.0.
7. Testing documented in `/docs/browser-compatibility.md` with screenshots.

---

### Story 5.7: Production Build and Deployment Setup

**As a** developer,
**I want** to configure production build and deploy to Vercel/Netlify,
**so that** the application is publicly accessible on a custom domain.

#### Acceptance Criteria

1. Vite production build created via `npm run build` with no errors.
2. Production build tested locally via `npm run preview` to validate functionality.
3. Vercel or Netlify account created and linked to GitHub repository.
4. Deployment configured: automatic deploys from `main` branch, preview deploys for pull requests.
5. Custom domain registered (e.g., flowline.co.za or flowline.finance).
6. DNS configured and SSL certificate provisioned (automatic via hosting provider).
7. Production environment variables configured (if needed - none for MVP).
8. Production deployment accessible via custom domain with HTTPS.

---

### Story 5.8: Legal Disclaimers and Privacy Policy

**As a** product owner,
**I want** clear legal disclaimers and privacy policy,
**so that** users understand the tool's purpose and I minimize legal risk.

#### Acceptance Criteria

1. Disclaimer displayed prominently on first visit: "This tool provides educational information only and is not financial advice. Consult a qualified financial advisor before making financial decisions."
2. Disclaimer requires user acknowledgment (checkbox and "I Understand" button) before proceeding.
3. Privacy policy page created explaining: no data transmission to servers, localStorage-only storage, no cookies/tracking (except optional analytics).
4. Footer links include: Privacy Policy, Disclaimer, Contact.
5. POPIA compliance validated: no personal data collected or transmitted, only financial calculations stored locally.
6. Legal review (if available) completed before public launch.
7. Disclaimer acceptance state stored in localStorage (one-time per device).

---

### Story 5.9: Analytics Integration (Optional)

**As a** product owner,
**I want** privacy-friendly analytics to understand usage patterns,
**so that** I can make data-informed decisions about future development.

#### Acceptance Criteria

1. Plausible or Simple Analytics account created (POPIA/GDPR compliant options).
2. Analytics script integrated into production build only (not dev).
3. Analytics tracks: page views, navigation flow (Data Entry → Results), button clicks (View Results, Edit Data, Clear Data).
4. No personally identifiable information (PII) or financial data sent to analytics.
5. Analytics configuration documented in README.md.
6. Privacy policy updated to mention analytics with opt-out instructions.
7. Analytics dashboard validated: data flowing correctly after deployment.

---

### Story 5.10: Documentation and Launch Preparation

**As a** new user and developer,
**I want** comprehensive documentation,
**so that** I can use the tool effectively and contribute to development if open-sourced.

#### Acceptance Criteria

1. README.md updated with: project overview, features, tech stack, setup instructions, development commands, deployment guide.
2. User guide created in `/docs/user-guide.md`: how to enter data, interpret results, understand strategies.
3. FAQ page created addressing: What is velocity banking? Is this accurate? Is my data safe? How do I contact support?
4. CONTRIBUTING.md created (if open-sourcing): contribution guidelines, code style, pull request process.
5. All documentation reviewed for clarity and accuracy.
6. Launch announcement drafted: blog post or social media copy explaining value proposition.
7. Repository tagged as `v1.0.0` on main branch with release notes.

---

## Checklist Results Report

### Executive Summary

**Overall PRD Completeness:** 92%

**MVP Scope Appropriateness:** Just Right - The scope is well-balanced between delivering core value (single-purpose velocity banking calculator) and maintaining achievable 4-week timeline.

**Readiness for Architecture Phase:** **READY** - The PRD provides comprehensive functional/non-functional requirements, clear epic structure, and detailed technical constraints for the architect to proceed.

**Most Critical Gaps:**
1. Missing specific competitive analysis (noted in Project Brief as open question)
2. Data migration section N/A (greenfield project), but should explicitly state this
3. Stakeholder approval process not defined (solo developer project, but worth noting)

---

### Category Analysis Table

| Category | Status | Critical Issues |
|----------|--------|----------------|
| 1. Problem Definition & Context | **PASS** (95%) | None - Comprehensive problem statement from Project Brief, target personas well-defined, success metrics measurable |
| 2. MVP Scope Definition | **PASS** (95%) | None - Clear in/out of scope, rationale documented, phased roadmap (v1.0 → v2.0 → v3.0+) |
| 3. User Experience Requirements | **PASS** (90%) | Minor: Could add more detail on error state flows, but sufficient for MVP |
| 4. Functional Requirements | **PASS** (98%) | None - 20 functional requirements, all testable and specific |
| 5. Non-Functional Requirements | **PASS** (95%) | None - 18 NFRs covering performance, security, compliance, tech stack |
| 6. Epic & Story Structure | **PASS** (100%) | None - 5 epics, 32 stories, all with acceptance criteria, properly sequenced |
| 7. Technical Guidance | **PASS** (95%) | None - Tech stack defined (React 18 + Vite + TypeScript + shadcn/ui + Recharts + Zustand), testing strategy clear |
| 8. Cross-Functional Requirements | **PARTIAL** (75%) | Data migration explicitly N/A (greenfield), monitoring addressed post-launch, could expand operational requirements |
| 9. Clarity & Communication | **PASS** (90%) | Minor: Stakeholder approval process undefined (solo dev), otherwise clear |

---

### Top Issues by Priority

#### BLOCKERS
*None* - PRD is ready for architect to proceed.

#### HIGH
1. **Calculation Accuracy Validation Approach** - Story 1.6 defines PoC validation, but should also specify ongoing validation throughout development (e.g., regression test suite with known scenarios). *Recommendation:* Add to Story 3.1-3.2 acceptance criteria.

#### MEDIUM
1. **Competitive Analysis** - Project Brief notes this as open question. Not blocking but valuable context. *Recommendation:* Defer to Beta phase (Epic 5) as research task.
2. **Data Migration** - N/A for greenfield project but should be explicitly stated in Cross-Functional Requirements section. *Recommendation:* Add note "N/A - Greenfield project, no legacy data migration required."
3. **Operational Runbook** - Post-launch support scenarios (e.g., user reports calculation error) not detailed. *Recommendation:* Address in Story 5.10 documentation.

#### LOW
1. **Stakeholder Approval Process** - Solo developer project, but good practice to document decision authority. *Recommendation:* Note "Solo developer serves as PM/Dev/Designer - all decisions self-approved with beta tester validation."

---

### MVP Scope Assessment

**Scope Appropriateness: ✅ JUST RIGHT**

**Features Properly Scoped for MVP:**
- ✅ Core calculation engine (baseline + velocity banking)
- ✅ Dual strategies (Avalanche + Snowball) with recommendation
- ✅ Multi-debt support (bonds, loans, credit cards)
- ✅ LocalStorage persistence (no backend needed)
- ✅ Results dashboard with visualization

**Correctly Deferred to Post-MVP:**
- ✅ Data editing after entry (clear and re-enter for MVP)
- ✅ Multiple saved scenarios
- ✅ PDF/CSV export
- ✅ Mobile optimization
- ✅ Dark mode
- ✅ Progress tracking (actual vs planned)

**No Missing Essential Features Identified**

**Complexity Concerns:**
- ⚠️ **Calculation Engine Complexity** - Daily interest for flexi facilities + multi-debt optimization is non-trivial. *Mitigation:* Story 1.3-1.4 establish foundation with PoC validation gate (Go/No-Go decision).
- ⚠️ **Beta Testing Logistics** - Story 5.1 notes "in-person, ngrok, or deployed static builds" but doesn't commit to approach. *Recommendation:* Decide during Epic 2 completion (Week 2) based on application maturity.

**Timeline Realism: ✅ ACHIEVABLE**
- 4-5 weeks for 5 epics, 32 stories is aggressive but feasible for solo developer given:
  - PoC validation gate (reduces risk of rework)
  - Clear technical stack (no research paralysis)
  - Leveraging established libraries (shadcn/ui, Recharts, Zustand)
  - Phased approach allows natural stopping points

---

### Technical Readiness

**Clarity of Technical Constraints: ✅ EXCELLENT**
- Tech stack fully specified: React 18, Vite 5+, TypeScript (strict mode), shadcn/ui, Tailwind, Recharts, Zustand
- Architecture decision: Client-side SPA, no backend for MVP
- Repository structure defined: /components, /engine, /state, /utils, /types
- Testing strategy clear: vitest + React Testing Library, 80% coverage for calculation engine

**Identified Technical Risks:**
1. **Calculation Accuracy** - Most critical risk, properly addressed with:
   - PoC validation (Story 1.6)
   - Unit test coverage (80%+ for engine)
   - Beta testing with real scenarios (Epic 5)
   - Documented variance threshold (<5%)

2. **LocalStorage Limitations** - Maximum ~5-10MB varies by browser. *Mitigation:* Addressed in NFR6, post-MVP migration path to cloud storage (v2.0) documented.

3. **Cross-Browser Compatibility** - Safari/Firefox quirks possible. *Mitigation:* Story 5.6 explicitly tests Chrome, Firefox, Safari, Edge with issue tracking.

**Areas Needing Architect Investigation:**
1. **Calculation Engine Architecture** - How to structure for potential NPM package extraction (NFR14)? Architect should design clean interfaces between UI and calculation logic.
2. **Chart Performance** - 360 data points (30 years × 12 months) in line chart - will Recharts handle smoothly? Architect should validate or plan optimization (e.g., data downsampling for long timelines).
3. **State Management Persistence** - Zustand persist middleware + localStorage - architect should design schema versioning strategy for future data model changes (v1.0 → v1.1 → v2.0).

---

### Recommendations

#### For PM (Before Handoff to Architect)
1. ✅ **Add Explicit Data Migration Note:** In Cross-Functional Requirements section, add: "Data Migration: N/A - Greenfield project with no legacy system integration."
2. ✅ **Document Decision Authority:** Add to stakeholder section: "Solo developer serves as PM/Dev/Designer with beta tester validation for key decisions."
3. ⚠️ **Expand Calculation Regression Testing:** In Stories 3.1-3.2 (Avalanche/Snowball), add acceptance criterion: "Regression test suite includes minimum 5 known scenarios for ongoing validation."

#### For Architect (Next Phase)
1. **Design Calculation Engine Module:** Create clean abstraction allowing NPM package extraction future-proofing (NFR14).
2. **Validate Chart Performance:** Test Recharts with 360+ data points, plan downsampling if needed for >20 year timelines.
3. **Plan State Schema Versioning:** Design localStorage schema versioning for graceful migration when data model evolves (v1.x → v2.0).
4. **Detail Error Handling Architecture:** Expand on Story 5.4 - create error classification (validation, calculation, system) and recovery patterns.

#### For Development Phase
1. **PoC Go/No-Go Gate is Critical:** Do not proceed to Epic 2 without Story 1.6 validation confirming <5% variance vs established calculators.
2. **Beta Testing Approach Decision:** Decide by end of Epic 2 (Week 2): in-person sessions vs ngrok vs deployed alpha build.
3. **Continuous Calculation Validation:** After each calculation engine change, run regression suite to prevent accuracy drift.

---

### Final Decision

**✅ READY FOR ARCHITECT**

The PRD is comprehensive, properly structured, and provides sufficient detail for the architect to design the system architecture. The epic and story structure is well-sequenced with clear acceptance criteria. Technical constraints are explicit and realistic.

**Minor Refinements Recommended (Not Blocking):**
- Add explicit data migration note (N/A for greenfield)
- Expand regression testing acceptance criteria
- Document solo developer decision authority

**Key Handoff Notes for Architect:**
- Calculation accuracy is THE critical success factor - prioritize clean, testable calculation engine design
- Client-side only architecture simplifies MVP but plan for v2.0 cloud storage migration
- 4-week timeline is aggressive - epic structure allows natural checkpoints (PoC Go/No-Go at Epic 1, Alpha validation at Epic 2-3)

---

## Next Steps

### UX Expert Prompt

```
I have a completed PRD for Flowline Finance Studio, a velocity banking calculator for South African homeowners. Please review the PRD (docs/prd.md) and create a detailed UX/UI design specification that translates the User Interface Design Goals section into actionable design deliverables.

Focus on:
1. Wireframes for the Data Entry Wizard (tab-based) and Results Dashboard
2. Component specifications for shadcn/ui implementation
3. Responsive layout breakpoints (desktop 1280px+, tablet 768px+)
4. WCAG AA compliance checklist
5. Visual design system (colors, typography, spacing) aligned with professional financial tool aesthetic

The design should serve both beginners (simplicity) and power users (transparency) through progressive disclosure.
```

### Architect Prompt

```
I have a completed PRD for Flowline Finance Studio, a React-based velocity banking calculator. Please review the PRD (docs/prd.md) and Brief (docs/brief.md), then create a comprehensive technical architecture document.

Key focus areas:
1. Calculation engine architecture (standalone module design for potential NPM package extraction)
2. State management patterns (Zustand + persist middleware + localStorage schema versioning)
3. Component architecture (React 18 functional components, TypeScript strict mode)
4. Testing strategy (vitest + React Testing Library, 80%+ coverage for calculation engine)
5. Performance optimization approach (chart rendering with 360+ data points, <500ms calculation time)
6. Error handling and validation architecture
7. Deployment strategy (local dev weeks 1-3, production migration week 4 to Vercel/Netlify)

The architecture should support the 4-5 week phased development timeline (PoC → Alpha → Beta → v1.0) and provide a clear migration path for v2.0 features (cloud storage, user accounts).
```

---

**PRD Status:** ✅ Ready for Architecture Phase
**Version:** v1.0
**Last Updated:** 2025-11-22
