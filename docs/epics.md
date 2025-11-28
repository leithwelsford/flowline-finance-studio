# Flowline Finance Studio - Epic Breakdown

**Author:** Leith
**Date:** 2025-11-28
**Project Level:** Greenfield
**Target Scale:** MVP Personal Validation

---

## Overview

This document provides the complete epic and story breakdown for Flowline Finance Studio, decomposing the 55 functional requirements from the [PRD](./prd.md) into implementable stories.

**Context Incorporated:**
- ✅ PRD: 55 Functional Requirements, 21 Non-Functional Requirements
- ✅ UX Design: shadcn/ui + Tailwind CSS + Recharts, Balanced Teal theme
- ✅ Architecture: Vite + React + TypeScript + Dexie.js + Zustand + big.js

**Epic Summary:**
| Epic | Title | Stories | FRs Covered |
|------|-------|---------|-------------|
| 1 | Foundation & Project Setup | 4 | Infrastructure for all FRs |
| 2 | Account & Data Management | 6 | FR1-FR8 |
| 3 | Financial Health Dashboard | 4 | FR39-FR42, FR47-FR48 |
| 4 | Calculation Engine & Strategy Modeling | 8 | FR9-FR23 |
| 5 | Strategy Comparison & Recommendations | 6 | FR24-FR31 |
| 6 | Progress Tracking & Validation | 5 | FR32-FR38, FR43-FR46 |
| 7 | User Experience Polish | 4 | FR49-FR55 |

**Total:** 7 Epics, 37 Stories

---

## Functional Requirements Inventory

### Account & Data Management (FR1-FR8)
- **FR1:** User can create and manage multiple debt accounts with details: account name, current balance (ZAR), annual interest rate, minimum monthly payment, account type (home loan, vehicle finance, personal loan, credit card), and lender name
- **FR2:** User can create and manage flexi facility account with details: credit limit, available balance, current utilization, interest rate, and facility type (FNB Flexi Option, Standard Bank Access Bond)
- **FR3:** User can record monthly income with amount (ZAR), payment date, and income source
- **FR4:** User can categorize and track monthly expenses by category with amounts in ZAR
- **FR5:** User can update account balances manually on weekly or monthly basis
- **FR6:** User can view complete financial snapshot showing all accounts, current balances, and total debt
- **FR7:** System persists all financial data locally (browser storage or local database)
- **FR8:** User can edit or delete any previously entered financial data

### Calculation Engine & Strategy Modeling (FR9-FR23)
- **FR9:** System calculates daily interest for flexi facility accounts using accurate daily compounding formula
- **FR10:** System calculates monthly interest for standard loan accounts using standard amortization formulas
- **FR11:** System models SA prime rate linkage for applicable accounts
- **FR12:** User can simulate SARB rate changes to see impact on all strategies
- **FR13:** System calculates "Baseline Strategy" projection showing debt payoff with minimum payments only
- **FR14:** System calculates "Debt Snowball Strategy" projection prioritizing smallest balance first
- **FR15:** System calculates "Debt Avalanche Strategy" projection prioritizing highest interest rate first
- **FR16:** System calculates "Flexi Chunking Strategy" projection with regular lump sum deposits to flexi facility
- **FR17:** System calculates "Aggressive Flexi Strategy" projection with maximum deposits and minimum withdrawals from flexi
- **FR18:** System calculates "Velocity Banking Strategy" projection using flexi facility as primary account (SA adaptation)
- **FR19:** System calculates "Hybrid Flexi-Snowball Strategy" combining flexi optimization with smallest debt targeting
- **FR20:** System calculates "Hybrid Flexi-Avalanche Strategy" combining flexi optimization with highest interest targeting
- **FR21:** User can configure strategy parameters (chunk amounts, payment frequencies, target accounts)
- **FR22:** System generates month-by-month projection for each strategy showing: remaining balance per account, interest paid, principal paid, total debt remaining
- **FR23:** System calculates total interest saved and months saved for each strategy vs. baseline

### Strategy Comparison & Recommendations (FR24-FR31)
- **FR24:** User can view side-by-side comparison of all calculated strategies on single dashboard
- **FR25:** System displays key comparison metrics for each strategy: projected debt-free date, total interest paid over life of debt, total amount saved vs. baseline, monthly effort required
- **FR26:** System generates visual comparison charts showing debt reduction curves over time for all strategies
- **FR27:** System generates visual comparison of total interest paid across all strategies (bar chart)
- **FR28:** System assigns effort rating to each strategy (Low/Medium/High) based on complexity and management overhead
- **FR29:** System provides recommendation identifying optimal strategy based on: best interest savings, acceptable effort level, lowest risk profile
- **FR30:** User can filter comparison view to show only strategies meeting selected criteria (effort level, minimum savings threshold)
- **FR31:** User can select preferred strategy to track for validation

### Progress Tracking & Validation (FR32-FR38)
- **FR32:** User can log actual debt account balances on weekly or monthly basis
- **FR33:** System compares actual balances to projected balances for selected strategy
- **FR34:** System calculates variance percentage between actual and projected results
- **FR35:** System displays accuracy assessment indicating if projections are tracking within acceptable margin (10%)
- **FR36:** User can view historical progress showing: actual debt reduction over time, cumulative interest paid vs. projection, strategy adherence timeline
- **FR37:** System identifies when actual results deviate significantly from projections and flags for review
- **FR38:** User can add notes/annotations to tracking entries explaining variances (life events, unexpected expenses)

### Financial Health Dashboard (FR39-FR42)
- **FR39:** System calculates and displays cash flow health: available monthly surplus (income - expenses - minimum debt payments), visual indicator (green/yellow/red), percentage of income consumed by debt
- **FR40:** System displays income vs. expenditure breakdown showing: total monthly income, total monthly expenses, discretionary spending amount, current savings rate
- **FR41:** System calculates and displays true cost of debt: total monthly interest charges across all accounts (ZAR), annual interest cost projection, percentage of income going to interest only (not principal)
- **FR42:** User can view financial health dashboard as primary landing page

### Data Visualization & Reporting (FR43-FR48)
- **FR43:** System generates interactive debt reduction curve charts showing balance over time
- **FR44:** System generates interest payment comparison visualizations across strategies
- **FR45:** User can view historical data for any time period (week, month, quarter, year-to-date)
- **FR46:** System displays clear visual indicators for: on-track vs. off-track progress, positive vs. negative cash flow, high-risk vs. healthy debt levels
- **FR47:** All monetary values display in South African Rand (ZAR) with appropriate formatting
- **FR48:** All date displays use South African date format (DD/MM/YYYY)

### User Experience & Interface (FR49-FR55)
- **FR49:** User can access application via web browser on desktop or mobile device
- **FR50:** Interface provides responsive design working on common screen sizes (desktop, tablet, mobile)
- **FR51:** User can complete weekly data update in under 10 minutes
- **FR52:** System provides clear help text and tooltips explaining financial terms and calculation methods
- **FR53:** User can navigate between main sections: data entry, strategy comparison, progress tracking, health dashboard
- **FR54:** System auto-saves data entries to prevent loss
- **FR55:** User receives confirmation feedback for all data modifications (save, update, delete)

---

## FR Coverage Map

| Epic | FRs Covered | Coverage Type |
|------|-------------|---------------|
| Epic 1: Foundation | All FRs (infrastructure) | Enabling |
| Epic 2: Account & Data Management | FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8 | Direct |
| Epic 3: Financial Health Dashboard | FR39, FR40, FR41, FR42, FR47, FR48 | Direct |
| Epic 4: Calculation Engine | FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23 | Direct |
| Epic 5: Strategy Comparison | FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31 | Direct |
| Epic 6: Progress Tracking | FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR43, FR44, FR45, FR46 | Direct |
| Epic 7: UX Polish | FR49, FR50, FR51, FR52, FR53, FR54, FR55 | Direct |

---

## Epic 1: Foundation & Project Setup

**Goal:** Establish the technical foundation that enables all subsequent development - project structure, core dependencies, database schema, and basic navigation shell.

**User Value:** After this epic, the application skeleton exists with routing, data persistence layer ready, and the ability to navigate between empty page shells. This foundation enables rapid feature development in subsequent epics.

**FRs Enabled:** All FRs (infrastructure foundation)

### Story 1.1: Initialize Vite + React + TypeScript Project

**As a** developer,
**I want** a properly configured Vite + React + TypeScript project with all core dependencies,
**So that** I have a solid foundation for building the application.

**Acceptance Criteria:**

**Given** a fresh development environment
**When** I run the project initialization commands
**Then** the following are configured:
- Vite + React + TypeScript template initialized
- Tailwind CSS configured with custom teal theme colors
- shadcn/ui initialized with default components (Button, Card, Input, Form, Table, Toast, Tabs)
- Path alias `@/` configured for clean imports
- ESLint + Prettier configured for code quality
- Package.json includes all dependencies from Architecture doc:
  - recharts, dexie, dexie-react-hooks, zustand, big.js, date-fns
  - react-hook-form, zod, @hookform/resolvers
  - vitest, @testing-library/react, @testing-library/jest-dom

**And** `npm run dev` starts development server successfully
**And** `npm run build` produces production bundle
**And** `npm run test` runs (with placeholder test passing)

**Prerequisites:** None (first story)

**Technical Notes:**
- Follow exact initialization commands from Architecture doc Section "Project Initialization"
- Configure Tailwind with Balanced Teal theme from UX spec (primary: teal-600 #0d9488)
- Set up folder structure matching Architecture doc (src/components, src/lib, src/pages, src/hooks, src/store, src/types)
- Configure Vitest with React Testing Library

---

### Story 1.2: Implement Dexie Database Schema and Core Types

**As a** developer,
**I want** a properly configured IndexedDB database with TypeScript types,
**So that** all financial data can be persisted locally with type safety.

**Acceptance Criteria:**

**Given** the initialized project
**When** I implement the database layer
**Then** the following are created:

1. **Database Schema** (`src/lib/db/schema.ts`):
   - `accounts` table: id, name, type, balance, interestRate, minimumPayment, lender, interestType, createdAt, updatedAt
   - `flexiFacility` table: id, name, type, creditLimit, currentBalance, interestRate, createdAt, updatedAt
   - `income` table: id, source, amount, paymentDate, createdAt
   - `expenses` table: id, category, amount, date, createdAt
   - `balanceSnapshots` table: id, accountId, date, balance, notes, createdAt
   - `settings` table: key, value

2. **TypeScript Types** (`src/types/`):
   - DebtAccount interface with all fields
   - FlexiFacility interface
   - IncomeEntry interface
   - ExpenseEntry interface
   - BalanceSnapshot interface
   - AccountType enum: 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card'
   - FlexiFacilityType enum: 'fnb_flexi' | 'standard_bank_access'

**And** database instance exports from `src/lib/db/index.ts`
**And** all monetary values stored as strings for big.js precision
**And** all dates stored as ISO strings

**Prerequisites:** Story 1.1

**Technical Notes:**
- Follow Dexie.js patterns from Architecture doc
- Use version(1) for initial schema
- Create barrel exports in types/index.ts

---

### Story 1.3: Create Application Shell with Navigation

**As a** user,
**I want** to navigate between the main sections of the application,
**So that** I can access different features easily.

**Acceptance Criteria:**

**Given** I open the application
**When** the app loads
**Then** I see a navigation header with tabs: Dashboard | Data Entry | Compare | Track

**And** clicking each tab shows the corresponding page (empty placeholder content for now)
**And** the current page tab has a teal underline indicator
**And** the header shows the app logo/title "Flowline Finance Studio"
**And** on mobile (< 640px), navigation collapses to hamburger menu

**Given** I'm on any page
**When** I resize the browser
**Then** the layout adapts responsively (per UX spec breakpoints)

**Prerequisites:** Story 1.1

**Technical Notes:**
- Implement in `src/App.tsx` with conditional rendering (no router library needed for MVP)
- Create `src/components/layout/Header.tsx`, `Navigation.tsx`, `PageContainer.tsx`
- Use shadcn/ui Tabs component for navigation
- Use shadcn/ui Sheet component for mobile drawer
- Follow UX spec Section 7.1 for navigation patterns
- Pages are empty placeholders: DashboardPage, DataEntryPage, ComparePage, TrackPage

---

### Story 1.4: Implement Zustand UI Store and Toast Notifications

**As a** user,
**I want** feedback when I perform actions in the app,
**So that** I know my changes were saved successfully.

**Acceptance Criteria:**

**Given** the application shell exists
**When** I implement the state management layer
**Then** the following are created:

1. **UI Store** (`src/store/uiStore.ts`):
   - `currentPage`: 'dashboard' | 'data-entry' | 'compare' | 'track'
   - `selectedStrategyId`: string | null
   - `isLoading`: boolean
   - `setCurrentPage(page)` action
   - `setSelectedStrategy(id)` action

2. **Toast System**:
   - shadcn/ui Toaster component added to App.tsx
   - Success toasts: green, 3-second auto-dismiss
   - Error toasts: red, manual dismiss required
   - Toast accessible via `toast.success()`, `toast.error()` from sonner

**And** navigation updates `currentPage` in store
**And** toast notifications appear in bottom-right corner

**Prerequisites:** Story 1.3

**Technical Notes:**
- Follow Zustand patterns from Architecture doc
- Use shadcn/ui toast component (uses sonner under the hood)
- Create Result type utility (`src/lib/utils/result.ts`) for error handling pattern

---

## Epic 2: Account & Data Management

**Goal:** Enable users to enter and manage all their financial data - debt accounts, flexi facility, income, and expenses - with full CRUD operations and local persistence.

**User Value:** After this epic, users can input their complete financial picture and see it persisted across sessions. This is the data foundation for all calculations and comparisons.

**FRs Covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8

### Story 2.1: Implement Debt Account Management (Create, View, Edit, Delete)

**As a** user,
**I want** to add and manage my debt accounts,
**So that** the system knows about all debts I want to pay off.

**Acceptance Criteria:**

**Given** I navigate to the Data Entry page
**When** I click "Add Debt Account"
**Then** I see a form with fields:
- Account name (required, text)
- Account type (required, dropdown: Home Loan, Vehicle Finance, Personal Loan, Credit Card)
- Current balance (required, ZAR currency input, minimum R0)
- Annual interest rate (required, percentage input 0-100%)
- Minimum monthly payment (required, ZAR currency input)
- Lender name (optional, text)

**Given** I fill out the form with valid data
**When** I click "Save Account"
**Then** the account is saved to Dexie database
**And** I see a success toast "Account saved"
**And** the account appears in my accounts list

**Given** I have existing accounts
**When** I view the accounts list
**Then** I see a card for each account showing: name, type icon, current balance (ZAR formatted), interest rate, minimum payment

**Given** I click "Edit" on an account
**When** I modify fields and save
**Then** the account is updated in database
**And** I see success toast "Account updated"

**Given** I click "Delete" on an account
**When** I confirm the deletion dialog
**Then** the account is removed from database
**And** I see success toast "Account deleted"

**Prerequisites:** Story 1.2, Story 1.4

**Technical Notes:**
- Create `src/components/accounts/AccountForm.tsx` using React Hook Form + Zod
- Create `src/components/accounts/AccountList.tsx` and `AccountCard.tsx`
- Create `src/hooks/useAccounts.ts` with Dexie useLiveQuery
- Zod schema validates: balance >= 0, rate 0-1 (decimal), minimumPayment >= 0
- Use shadcn/ui Card, Form, Input, Select, Button, AlertDialog (delete confirmation)
- Format currency with Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' })

---

### Story 2.2: Implement Flexi Facility Management

**As a** user,
**I want** to add my flexi facility details,
**So that** the system can model velocity banking and flexi strategies.

**Acceptance Criteria:**

**Given** I navigate to the Data Entry page
**When** I click "Add Flexi Facility"
**Then** I see a form with fields:
- Facility name (required, text)
- Facility type (required, dropdown: FNB Flexi Option, Standard Bank Access Bond)
- Credit limit (required, ZAR currency input)
- Current balance/utilization (required, ZAR currency input, can be negative for available credit)
- Interest rate (required, percentage, typically prime + 1-2%)

**Given** I fill out the form with valid data
**When** I click "Save Facility"
**Then** the facility is saved to Dexie database
**And** I see a success toast "Flexi facility saved"
**And** the facility appears in a special "Flexi Facility" section

**And** I can only have ONE flexi facility (form disabled if one exists, shows "Edit" instead)

**Given** I have a flexi facility
**When** I view it
**Then** I see: name, type, credit limit, current balance, available credit (calculated), interest rate

**Prerequisites:** Story 1.2, Story 1.4

**Technical Notes:**
- Create `src/components/accounts/FlexiFacilityForm.tsx`
- Create `src/hooks/useFlexiFacility.ts`
- Available credit = credit limit - current balance
- Only allow one flexi facility record (check before insert)
- Interest type is always 'daily' for flexi facilities

---

### Story 2.3: Implement Income Entry

**As a** user,
**I want** to record my monthly income,
**So that** the system knows how much surplus I have for debt payments.

**Acceptance Criteria:**

**Given** I navigate to the Data Entry page
**When** I click "Add Income Source"
**Then** I see a form with fields:
- Income source (required, text, e.g., "Salary", "Side Business")
- Monthly amount (required, ZAR currency input)
- Payment date (optional, day of month 1-31)

**Given** I add multiple income sources
**When** I view the income section
**Then** I see a list of all income sources with amounts
**And** I see total monthly income at the bottom

**Given** I edit or delete an income source
**When** I save changes
**Then** the database is updated
**And** total income recalculates

**Prerequisites:** Story 1.2, Story 1.4

**Technical Notes:**
- Create `src/components/accounts/IncomeForm.tsx`
- Create `src/components/accounts/IncomeList.tsx`
- Create `src/hooks/useIncome.ts`
- Total income is sum of all income entries (calculate in hook)

---

### Story 2.4: Implement Expense Tracking by Category

**As a** user,
**I want** to track my monthly expenses by category,
**So that** the system can calculate my available surplus.

**Acceptance Criteria:**

**Given** I navigate to the Data Entry page
**When** I click "Add Expense"
**Then** I see a form with fields:
- Category (required, dropdown: Housing, Transport, Food, Utilities, Insurance, Entertainment, Other)
- Monthly amount (required, ZAR currency input)
- Description (optional, text)

**Given** I add multiple expenses
**When** I view the expenses section
**Then** I see expenses grouped by category
**And** I see total monthly expenses at the bottom

**Given** I edit or delete an expense
**When** I save changes
**Then** the database is updated
**And** total expenses recalculates

**Prerequisites:** Story 1.2, Story 1.4

**Technical Notes:**
- Create `src/components/accounts/ExpenseForm.tsx`
- Create `src/components/accounts/ExpenseList.tsx`
- Create `src/hooks/useExpenses.ts`
- Predefined categories as enum
- Total expenses is sum of all expense entries

---

### Story 2.5: Implement Financial Snapshot View

**As a** user,
**I want** to see a complete snapshot of my financial situation,
**So that** I can verify all data is entered correctly before running calculations.

**Acceptance Criteria:**

**Given** I have entered accounts, income, and expenses
**When** I navigate to the Data Entry page
**Then** I see a summary panel showing:
- **Total Debt:** Sum of all account balances (ZAR)
- **Total Monthly Income:** Sum of all income (ZAR)
- **Total Monthly Expenses:** Sum of all expenses (ZAR)
- **Minimum Debt Payments:** Sum of all minimum payments (ZAR)
- **Available Surplus:** Income - Expenses - Minimum Payments (ZAR)
- **Number of Accounts:** Count

**And** if Available Surplus is negative, it shows in red with warning icon
**And** if Available Surplus is positive, it shows in green

**Given** I make changes to any data
**When** I return to the snapshot view
**Then** all totals update automatically (reactive via Dexie useLiveQuery)

**Prerequisites:** Story 2.1, Story 2.2, Story 2.3, Story 2.4

**Technical Notes:**
- Create `src/components/accounts/FinancialSnapshot.tsx`
- Use big.js for all calculations to maintain precision
- Use semantic colors from UX spec (green-500, red-500)
- This component will be reused in Dashboard (Epic 3)

---

### Story 2.6: Implement Quick Balance Update Flow

**As a** user,
**I want** to quickly update my account balances,
**So that** I can complete weekly updates in under 10 minutes.

**Acceptance Criteria:**

**Given** I have existing accounts
**When** I click "Update Balances"
**Then** I see a streamlined view with:
- List of all accounts with current balance displayed
- Inline edit field for each balance (no modal/popup needed)
- Current balance pre-filled
- Auto-save when I click away or press Enter

**Given** I update a balance
**When** I change the value and move to next field
**Then** the new balance is saved immediately (auto-save)
**And** I see brief "Saved" indicator next to field

**Given** I update all balances
**When** I'm done
**Then** I can see timestamp of "Last updated: [date/time]"
**And** total debt reflects new balances

**Prerequisites:** Story 2.1, Story 2.5

**Technical Notes:**
- Create `src/components/accounts/QuickBalanceUpdate.tsx`
- Implement inline editing with blur-to-save pattern
- Store lastUpdated timestamp in account record
- This fulfills FR5 and supports FR51 (10-minute updates)
- Use debounce to avoid excessive database writes

---

## Epic 3: Financial Health Dashboard

**Goal:** Deliver the "Three Critical Numbers" dashboard as the primary landing page, giving users instant visibility into their financial health.

**User Value:** After this epic, users land on a dashboard showing Cash Flow Health, Income vs Expenditure, and True Cost of Debt - immediate insight into their financial situation with color-coded indicators.

**FRs Covered:** FR39, FR40, FR41, FR42, FR47, FR48

### Story 3.1: Implement Cash Flow Health Card

**As a** user,
**I want** to see my cash flow health at a glance,
**So that** I know if I'm breathing financially or drowning.

**Acceptance Criteria:**

**Given** I have entered income, expenses, and debt accounts
**When** I view the Dashboard
**Then** I see a "Cash Flow Health" card showing:
- **Available Monthly Surplus:** Income - Expenses - Minimum Payments (ZAR formatted)
- **Status Indicator:**
  - Green + "Breathing" if surplus > 10% of income
  - Yellow + "Tight" if surplus is 0-10% of income
  - Red + "Drowning" if surplus is negative
- **Debt Consumption:** Percentage of income consumed by minimum debt payments

**And** the card uses Balanced Teal header (#0d9488)
**And** status uses semantic colors (green-500, amber-500, red-500)
**And** an icon accompanies each status (checkmark, warning, X)

**Prerequisites:** Story 2.5

**Technical Notes:**
- Create `src/components/dashboard/HealthCard.tsx` (reusable)
- Create `src/components/dashboard/CashFlowHealth.tsx`
- Use big.js for percentage calculations
- Icons from lucide-react (included with shadcn)
- Follow UX spec Section 2.1 emotional goals (Hope + Empowerment)

---

### Story 3.2: Implement Income vs Expenditure Card

**As a** user,
**I want** to see how my income compares to my spending,
**So that** I understand if I'm living within my means.

**Acceptance Criteria:**

**Given** I have entered income and expenses
**When** I view the Dashboard
**Then** I see an "Income vs Expenditure" card showing:
- **Total Monthly Income:** (ZAR formatted)
- **Total Monthly Expenses:** (ZAR formatted)
- **Discretionary Amount:** Income - Expenses (ZAR)
- **Savings Rate:** (Income - Expenses) / Income as percentage

**And** visual bar showing income vs expense proportions
**And** savings rate shows green if positive, red if negative

**Prerequisites:** Story 2.3, Story 2.4

**Technical Notes:**
- Create `src/components/dashboard/IncomeExpenseCard.tsx`
- Simple horizontal stacked bar (can use div with Tailwind widths)
- Use big.js for percentage calculation

---

### Story 3.3: Implement True Cost of Debt Card

**As a** user,
**I want** to see the true cost of my debt,
**So that** I understand how much money is going to interest alone.

**Acceptance Criteria:**

**Given** I have debt accounts entered
**When** I view the Dashboard
**Then** I see a "True Cost of Debt" card showing:
- **Monthly Interest Charges:** Total interest across all accounts (ZAR)
- **Annual Interest Projection:** Monthly × 12 (ZAR)
- **Interest-to-Income Ratio:** Monthly interest / Monthly income as percentage

**And** values show in red (honest truth-telling)
**And** if interest > 20% of income, shows warning message "High debt burden"

**Prerequisites:** Story 2.1, Story 2.3

**Technical Notes:**
- Create `src/components/dashboard/TrueCostCard.tsx`
- Calculate monthly interest per account:
  - Standard loans: (balance × rate) / 12
  - Flexi: (balance × rate) / 365 × 30 (approximate monthly)
- Sum all account interest for total

---

### Story 3.4: Assemble Dashboard Page with Three Numbers Grid

**As a** user,
**I want** the dashboard to be my primary landing page,
**So that** I immediately see my financial health when I open the app.

**Acceptance Criteria:**

**Given** I open the application
**When** the app loads
**Then** I land on the Dashboard page (not a login screen)

**Given** I'm on the Dashboard
**When** I view the page
**Then** I see:
- **Header:** "Financial Health Dashboard" with current date
- **Three Numbers Grid:** 3-column layout on desktop, single column on mobile
  - Cash Flow Health card (left)
  - Income vs Expenditure card (center)
  - True Cost of Debt card (right)
- **Quick Actions:** Button to "Update Balances" and "View Full Comparison"

**And** cards animate in with subtle fade (Tailwind animate-in)
**And** all monetary values in ZAR format (R 1,234.56)
**And** all dates in SA format (DD/MM/YYYY)

**Prerequisites:** Story 3.1, Story 3.2, Story 3.3

**Technical Notes:**
- Create `src/pages/DashboardPage.tsx`
- Create `src/components/dashboard/ThreeNumbersGrid.tsx`
- Use CSS Grid: `grid-cols-1 md:grid-cols-3 gap-4`
- Implement formatCurrency and formatDate utilities in `src/lib/format/`
- Set dashboard as default page in App.tsx

---

## Epic 4: Calculation Engine & Strategy Modeling

**Goal:** Implement the core calculation engine that models 8 different debt payoff strategies with SA-specific flexi facility math, generating month-by-month projections for comparison.

**User Value:** After this epic, users can see projected outcomes for all debt strategies based on their real financial data - the heart of the application's value proposition.

**FRs Covered:** FR9, FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23

### Story 4.1: Implement Interest Calculation Functions

**As a** developer,
**I want** accurate interest calculation functions,
**So that** all strategy projections are mathematically correct.

**Acceptance Criteria:**

**Given** a debt account with monthly compounding
**When** I calculate monthly interest
**Then** the formula used is: `monthlyInterest = balance × (annualRate / 12)`

**Given** a flexi facility with daily compounding
**When** I calculate daily interest
**Then** the formula used is: `dailyInterest = balance × (annualRate / 365)`
**And** monthly approximation is: `monthlyInterest = dailyInterest × daysInMonth`

**Given** an account linked to SA prime rate
**When** I calculate interest with prime linkage
**Then** the effective rate = prime rate + margin (e.g., prime + 2%)

**And** all calculations use big.js for precision
**And** results accurate to 2 decimal places (cent-level in ZAR)
**And** unit tests verify calculations against manual spreadsheet examples

**Prerequisites:** Story 1.2

**Technical Notes:**
- Create `src/lib/calculations/interest.ts`
- Export functions: `calculateMonthlyInterest()`, `calculateDailyInterest()`, `calculateEffectiveRate()`
- Write tests in `tests/calculations/interest.test.ts`
- Test with known values: R100,000 at 11.5% = R958.33/month

---

### Story 4.2: Implement Projection Generator

**As a** developer,
**I want** a projection generator that simulates debt payoff over time,
**So that** each strategy can produce month-by-month forecasts.

**Acceptance Criteria:**

**Given** a financial snapshot and payment allocation for a month
**When** I run the projection generator
**Then** for each month it calculates:
- Starting balance per account
- Interest charged
- Payment applied (minimum + extra)
- Principal paid (payment - interest)
- Ending balance
- Running total debt

**And** projection continues until all debts reach zero OR 360 months (30 years max)
**And** projection handles accounts being paid off (balance = 0, skip further calculations)
**And** output is array of MonthlyProjection objects

**Given** edge cases
**When** payment exceeds balance
**Then** payment is capped at balance (no overpayment)

**Prerequisites:** Story 4.1

**Technical Notes:**
- Create `src/lib/calculations/projections.ts`
- Create `src/lib/calculations/types.ts` with MonthlyProjection interface
- MonthlyProjection: { month, date, accounts: [{id, startBalance, interest, payment, principal, endBalance}], totalDebt, totalInterestPaid }
- Use big.js throughout
- Write tests with simple 2-account scenarios

---

### Story 4.3: Implement Baseline and Traditional Strategies

**As a** user,
**I want** baseline, snowball, and avalanche strategies calculated,
**So that** I can compare traditional debt payoff methods.

**Acceptance Criteria:**

**Given** my financial data
**When** I calculate the **Baseline Strategy** (FR13)
**Then** it projects paying only minimum payments on all accounts
**And** no extra payments applied
**And** shows the "do nothing extra" scenario

**Given** my financial data with surplus
**When** I calculate the **Debt Snowball Strategy** (FR14)
**Then** it applies surplus to smallest balance first
**And** when smallest is paid off, rolls payment to next smallest
**And** continues until all debt paid

**Given** my financial data with surplus
**When** I calculate the **Debt Avalanche Strategy** (FR15)
**Then** it applies surplus to highest interest rate first
**And** when highest-rate is paid off, rolls payment to next highest
**And** continues until all debt paid

**And** each strategy returns StrategyProjection with: strategyId, name, effortLevel, debtFreeMonth, debtFreeDate, totalInterestPaid, monthsSaved, interestSaved, monthlyProjections[]

**Prerequisites:** Story 4.2

**Technical Notes:**
- Create `src/lib/calculations/strategies/baseline.ts`
- Create `src/lib/calculations/strategies/snowball.ts`
- Create `src/lib/calculations/strategies/avalanche.ts`
- All implement DebtStrategy interface
- Effort levels: Baseline = 'low', Snowball = 'low', Avalanche = 'low'
- Write comparison tests: avalanche should save more interest, snowball should have faster "wins"

---

### Story 4.4: Implement Flexi Chunking Strategies

**As a** user,
**I want** flexi chunking strategies calculated,
**So that** I can see how using my flexi facility affects debt payoff.

**Acceptance Criteria:**

**Given** my financial data including a flexi facility
**When** I calculate the **Flexi Chunking Strategy** (FR16)
**Then** it models regular lump sum deposits from flexi to highest-rate debt
**And** chunk amount defaults to available surplus
**And** flexi is repaid from income over following months

**Given** my financial data with flexi facility
**When** I calculate the **Aggressive Flexi Strategy** (FR17)
**Then** it models maximum deposits to flexi
**And** minimum withdrawals (only for required expenses)
**And** uses daily interest savings to accelerate payoff

**And** both strategies correctly model flexi daily interest vs loan monthly interest
**And** effort levels: Flexi Chunking = 'medium', Aggressive Flexi = 'high'

**Given** no flexi facility exists
**When** these strategies are calculated
**Then** they return null or "Not applicable" result

**Prerequisites:** Story 4.2, Story 2.2

**Technical Notes:**
- Create `src/lib/calculations/strategies/flexi-chunking.ts`
- Create `src/lib/calculations/strategies/aggressive-flexi.ts`
- Key insight: flexi daily interest < loan monthly interest = savings
- Model the "chunk and repay" cycle accurately

---

### Story 4.5: Implement Velocity Banking Strategy (SA Adaptation)

**As a** user,
**I want** the velocity banking strategy calculated,
**So that** I can see if this approach works in the South African context.

**Acceptance Criteria:**

**Given** my financial data with a flexi facility
**When** I calculate the **Velocity Banking Strategy** (FR18)
**Then** it models:
- Income deposited directly to flexi facility
- All expenses paid from flexi
- Net effect: income - expenses reduces flexi balance daily
- Periodic chunks transferred to target debt
- Daily interest on lower average flexi balance

**And** correctly models the "income parking" effect
**And** shows month-by-month flexi balance fluctuation
**And** effort level = 'high' (requires active management)

**Given** no flexi facility exists
**When** velocity banking is calculated
**Then** it returns null or "Requires flexi facility" message

**Prerequisites:** Story 4.2, Story 4.4

**Technical Notes:**
- Create `src/lib/calculations/strategies/velocity-banking.ts`
- This is the key SA adaptation - model FNB Flexi Option behavior
- Daily balance tracking within each month for accurate interest
- Most complex strategy - ensure thorough testing

---

### Story 4.6: Implement Hybrid Strategies

**As a** user,
**I want** hybrid strategies that combine flexi optimization with traditional methods,
**So that** I have more options to compare.

**Acceptance Criteria:**

**Given** my financial data with flexi facility
**When** I calculate **Hybrid Flexi-Snowball Strategy** (FR19)
**Then** it combines:
- Flexi chunking methodology (use flexi for lump sums)
- Snowball target selection (smallest balance first)
- Best of both approaches

**Given** my financial data with flexi facility
**When** I calculate **Hybrid Flexi-Avalanche Strategy** (FR20)
**Then** it combines:
- Flexi chunking methodology
- Avalanche target selection (highest rate first)
- Best of both approaches

**And** both strategies effort level = 'medium'
**And** return null if no flexi facility

**Prerequisites:** Story 4.3, Story 4.4

**Technical Notes:**
- Create `src/lib/calculations/strategies/hybrid-snowball.ts`
- Create `src/lib/calculations/strategies/hybrid-avalanche.ts`
- Can reuse allocation logic from parent strategies
- Compose from existing strategy logic where possible

---

### Story 4.7: Implement Strategy Configuration Options

**As a** user,
**I want** to configure strategy parameters,
**So that** I can customize calculations to my situation.

**Acceptance Criteria:**

**Given** I'm viewing strategy options
**When** I access configuration
**Then** I can adjust:
- **Chunk amount:** Custom amount for flexi chunks (default: full surplus)
- **Payment frequency:** Monthly, bi-weekly, weekly
- **Target account override:** Manually select which debt to prioritize

**Given** I change configuration
**When** strategies recalculate
**Then** projections reflect the new parameters
**And** configuration persists in settings table

**Prerequisites:** Story 4.6

**Technical Notes:**
- Create `src/types/strategy-config.ts`
- Create `src/components/strategies/StrategyConfig.tsx`
- Store in Dexie settings table as JSON
- Default config created on first run

---

### Story 4.8: Create Strategy Calculation Orchestrator

**As a** user,
**I want** all strategies calculated from my current financial data,
**So that** I can compare them all at once.

**Acceptance Criteria:**

**Given** I have entered financial data
**When** I trigger strategy calculation
**Then** the engine:
1. Creates a FinancialSnapshot from current database state
2. Runs all 8 strategies in parallel (or sequence)
3. Computes comparison metrics:
   - Months saved vs baseline
   - Interest saved vs baseline (ZAR)
   - Effort rating
4. Returns array of StrategyProjection results

**And** calculation completes in under 3 seconds (NFR-P1)
**And** invalid strategies (no flexi) return null gracefully
**And** results stored in Zustand calculationStore for UI consumption

**Given** calculation is running
**When** user waits
**Then** loading state is shown (skeleton loaders)

**Prerequisites:** Story 4.3, Story 4.4, Story 4.5, Story 4.6

**Technical Notes:**
- Create `src/lib/calculations/engine.ts` as main orchestrator
- Create `src/lib/calculations/strategies/index.ts` as strategy registry
- Create `src/store/calculationStore.ts` for results
- Create `src/hooks/useStrategies.ts` hook
- Performance: consider Web Workers if calculation is slow (defer to optimization)

---

## Epic 5: Strategy Comparison & Recommendations

**Goal:** Build the visual comparison interface that shows all strategies side-by-side with charts, metrics, and AI-powered recommendations.

**User Value:** After this epic, users experience the "aha moment" - seeing all their debt strategies compared visually, understanding which approach saves the most money and time.

**FRs Covered:** FR24, FR25, FR26, FR27, FR28, FR29, FR30, FR31

### Story 5.1: Implement Winner's Podium Component

**As a** user,
**I want** to see the top 3 strategies highlighted visually,
**So that** I immediately know which approaches perform best.

**Acceptance Criteria:**

**Given** strategies have been calculated
**When** I view the Compare page
**Then** I see a "Winner's Podium" showing top 3 strategies by interest saved:
- **1st Place (center, tallest):** Strategy name, interest saved (ZAR), debt-free date
- **2nd Place (left, medium):** Strategy name, interest saved, debt-free date
- **3rd Place (right, shortest):** Strategy name, interest saved, debt-free date

**And** podium uses teal theme with gold/silver/bronze accents
**And** recommended strategy (if 1st place) shows "Recommended" badge
**And** clicking a podium position scrolls to detailed comparison

**Prerequisites:** Story 4.8

**Technical Notes:**
- Create `src/components/strategies/WinnersPodium.tsx`
- Sort strategies by interestSaved descending
- Use flexbox for podium layout (center tallest)
- Animate entrance with Tailwind animate-in

---

### Story 5.2: Implement Strategy Comparison Table

**As a** user,
**I want** to see all strategies compared side-by-side,
**So that** I can make an informed decision.

**Acceptance Criteria:**

**Given** strategies have been calculated
**When** I view the comparison table
**Then** I see a table with columns:
- Strategy Name
- Debt-Free Date
- Total Interest Paid (ZAR)
- Interest Saved vs Baseline (ZAR)
- Months Saved
- Effort Rating (badge: Low/Medium/High)

**And** rows are sorted by interest saved (best first) by default
**And** baseline row is visually distinct (muted/gray)
**And** recommended strategy row has teal highlight

**Given** I click a column header
**When** I want to sort
**Then** table re-sorts by that column (ascending/descending toggle)

**Given** I'm on mobile
**When** viewing comparison
**Then** table converts to cards or horizontal scroll

**Prerequisites:** Story 4.8

**Technical Notes:**
- Create `src/components/strategies/ComparisonTable.tsx`
- Use shadcn/ui Table component
- Use shadcn/ui Badge for effort ratings (green=Low, yellow=Medium, red=High)
- Implement sort state in component

---

### Story 5.3: Implement Debt Reduction Curve Chart

**As a** user,
**I want** to see debt reduction visualized over time,
**So that** I can visually compare strategy trajectories.

**Acceptance Criteria:**

**Given** strategies have been calculated
**When** I view the comparison charts
**Then** I see a line chart showing:
- X-axis: Months (0 to debt-free)
- Y-axis: Total Debt (ZAR)
- One line per strategy, different colors
- Legend identifying each strategy

**And** baseline shows as dashed gray line
**And** recommended strategy shows as solid teal line
**And** chart is interactive:
  - Hover shows tooltip with exact values
  - Can toggle strategies on/off via legend click

**And** chart renders in under 2 seconds (NFR-P3)
**And** responsive: simplifies on mobile

**Prerequisites:** Story 4.8

**Technical Notes:**
- Create `src/components/charts/DebtReductionChart.tsx`
- Use Recharts LineChart component
- Colors from UX spec: teal for recommended, varied for others
- Limit data points if > 360 months (sample every 3rd month)

---

### Story 5.4: Implement Interest Comparison Bar Chart

**As a** user,
**I want** to see total interest compared across strategies,
**So that** I can clearly see the cost difference.

**Acceptance Criteria:**

**Given** strategies have been calculated
**When** I view the interest comparison
**Then** I see a horizontal bar chart showing:
- Y-axis: Strategy names
- X-axis: Total Interest Paid (ZAR)
- Bars sorted by interest (lowest/best at top)
- Bar colors: teal gradient for top performers, gray for baseline

**And** each bar shows ZAR amount at end
**And** savings vs baseline shown as annotation

**Prerequisites:** Story 4.8

**Technical Notes:**
- Create `src/components/charts/InterestComparisonChart.tsx`
- Use Recharts BarChart (horizontal via layout="vertical")
- Ensure accessible: include data table alternative (hidden, screen reader only)

---

### Story 5.5: Implement Recommendation Engine

**As a** user,
**I want** the system to recommend an optimal strategy,
**So that** I have guidance on which approach to follow.

**Acceptance Criteria:**

**Given** strategies have been calculated
**When** I view recommendations
**Then** the system identifies optimal strategy based on:
- **Primary:** Best interest savings (highest weight)
- **Secondary:** Acceptable effort level (prefer lower effort at similar savings)
- **Tertiary:** Lower risk (strategies without flexi are lower risk)

**And** recommendation shows as highlighted card with:
- "Recommended for You" header
- Strategy name and key metrics
- Rationale: "Saves R[X] more than baseline with [effort] effort"

**Given** user has no flexi facility
**When** viewing recommendations
**Then** flexi-based strategies are excluded from recommendation
**And** system recommends best traditional strategy

**Prerequisites:** Story 4.8

**Technical Notes:**
- Create `src/lib/calculations/recommendation.ts`
- Simple scoring algorithm: score = (interestSaved × 1.0) + (effortPenalty) + (riskPenalty)
- effortPenalty: high = -5000, medium = -2000, low = 0
- riskPenalty: flexi-required = -1000, no-flexi = 0
- Display in `src/components/strategies/RecommendationCard.tsx`

---

### Story 5.6: Implement Strategy Selection and Filter

**As a** user,
**I want** to filter strategies and select one to track,
**So that** I can focus on strategies that match my preferences.

**Acceptance Criteria:**

**Given** I'm viewing strategy comparison
**When** I use filters
**Then** I can filter by:
- Effort level: Show only Low, Medium, or High
- Minimum savings threshold: Show only strategies saving > R[X]

**And** table and charts update to show filtered strategies only

**Given** I've decided on a strategy
**When** I click "Select Strategy" on a strategy card
**Then** that strategy is saved as my "tracked strategy"
**And** confirmation toast appears
**And** I'm offered to navigate to Progress Tracking

**And** selected strategy persists in settings table

**Prerequisites:** Story 5.2, Story 5.5

**Technical Notes:**
- Add filter controls above comparison table
- Store selectedStrategyId in uiStore
- Persist to Dexie settings: { key: 'selectedStrategy', value: strategyId }
- Create `src/components/strategies/StrategyFilters.tsx`

---

## Epic 6: Progress Tracking & Validation

**Goal:** Enable users to track actual progress against projections, validating whether the chosen strategy is working as expected over 3-6 months.

**User Value:** After this epic, users can log actual balances, see variance from projections, and validate that the methodology works - the core validation loop.

**FRs Covered:** FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR43, FR44, FR45, FR46

### Story 6.1: Implement Balance Logging

**As a** user,
**I want** to log my actual account balances over time,
**So that** I can track real progress against projections.

**Acceptance Criteria:**

**Given** I have accounts and a selected strategy
**When** I navigate to the Track page
**Then** I see a "Log Balances" section with:
- Date selector (defaults to today)
- List of all accounts with current balance input fields
- "Save Snapshot" button

**Given** I enter balances and save
**When** I click "Save Snapshot"
**Then** a BalanceSnapshot record is created for each account
**And** snapshot date is recorded
**And** success toast confirms "Balances logged for [date]"

**Given** I want to add notes
**When** I'm logging balances
**Then** I can add an optional note explaining variances (e.g., "Unexpected car repair")

**Prerequisites:** Story 2.1, Story 5.6

**Technical Notes:**
- Create `src/components/tracking/BalanceLogger.tsx`
- Use Dexie balanceSnapshots table
- Date picker from shadcn/ui (uses date-fns)
- Allow logging multiple snapshots per month

---

### Story 6.2: Implement Actual vs Projected Comparison

**As a** user,
**I want** to see how my actual progress compares to projections,
**So that** I know if the strategy is working.

**Acceptance Criteria:**

**Given** I have balance snapshots and a selected strategy
**When** I view progress tracking
**Then** I see a chart showing:
- Projected debt curve (from selected strategy)
- Actual debt curve (from logged snapshots)
- Both on same chart for easy comparison

**And** chart shows current month highlighted
**And** tooltip shows projected vs actual values at each point

**Given** no snapshots exist yet
**When** viewing the chart
**Then** I see only projected line with message "Start logging to see actual progress"

**Prerequisites:** Story 4.8, Story 6.1

**Technical Notes:**
- Create `src/components/charts/ProgressChart.tsx`
- Use Recharts with two Line components
- Projected: solid teal line
- Actual: dashed teal-900 line
- X-axis: dates of snapshots

---

### Story 6.3: Implement Variance Calculation and Display

**As a** user,
**I want** to see the variance between actual and projected results,
**So that** I know if projections are accurate.

**Acceptance Criteria:**

**Given** I have balance snapshots
**When** I view variance metrics
**Then** I see for each snapshot:
- Projected total debt at that date
- Actual total debt (sum of snapshot balances)
- Variance: (Actual - Projected) / Projected × 100%
- Status indicator:
  - Green "On Track" if variance < 10%
  - Yellow "Minor Variance" if variance 10-20%
  - Red "Off Track" if variance > 20%

**And** overall accuracy assessment shows:
- Average variance across all snapshots
- Number of snapshots on-track vs off-track

**Prerequisites:** Story 6.2

**Technical Notes:**
- Create `src/components/tracking/VarianceIndicator.tsx`
- Create `src/hooks/useProgress.ts` for variance calculations
- 10% threshold from success criteria in PRD

---

### Story 6.4: Implement Historical Progress Timeline

**As a** user,
**I want** to view my historical progress over time,
**So that** I can see the full validation journey.

**Acceptance Criteria:**

**Given** I have multiple balance snapshots
**When** I view historical progress
**Then** I see a timeline showing:
- Each snapshot date with total debt
- Debt reduction from previous snapshot
- Cumulative interest paid vs projected
- Notes/annotations displayed

**And** I can filter by time period:
- Last week
- Last month
- Last quarter
- Year-to-date
- All time

**And** timeline scrolls horizontally on mobile

**Prerequisites:** Story 6.1, Story 6.3

**Technical Notes:**
- Create `src/components/tracking/ProgressTimeline.tsx`
- Use date-fns for period filtering
- Calculate cumulative interest from projection data

---

### Story 6.5: Implement Deviation Alerts and Annotations

**As a** user,
**I want** to be alerted when results deviate significantly,
**So that** I can investigate and document why.

**Acceptance Criteria:**

**Given** I log a balance snapshot
**When** variance exceeds 20%
**Then** I see an alert: "Significant deviation detected"
**And** I'm prompted to add an explanation note

**Given** I add notes to explain variance
**When** viewing historical data
**Then** notes appear as annotations on the timeline
**And** notes are searchable/filterable

**Given** variance exists
**When** system analyzes patterns
**Then** it flags for review with message like:
- "3 consecutive months off-track - consider strategy adjustment"
- "Variance improving - projections stabilizing"

**Prerequisites:** Story 6.3, Story 6.4

**Technical Notes:**
- Create `src/components/tracking/DeviationAlert.tsx`
- Create `src/components/tracking/NotesAnnotation.tsx`
- Store notes in balanceSnapshots.notes field
- Simple pattern detection: count consecutive off-track months

---

## Epic 7: User Experience Polish

**Goal:** Complete the user experience with responsive design, help content, auto-save, and feedback mechanisms to ensure the app is usable and delightful.

**User Value:** After this epic, the application feels polished and professional - responsive on all devices, helpful guidance available, and user actions confirmed with feedback.

**FRs Covered:** FR49, FR50, FR51, FR52, FR53, FR54, FR55

### Story 7.1: Implement Responsive Layout Polish

**As a** user,
**I want** the app to work well on my phone and tablet,
**So that** I can check my finances on any device.

**Acceptance Criteria:**

**Given** I access the app on mobile (< 640px)
**When** viewing any page
**Then** layouts adapt:
- Navigation becomes hamburger menu
- Three Numbers grid becomes single column
- Comparison table becomes cards or horizontal scroll
- Charts simplify and use larger touch targets
- Touch targets are minimum 44x44px

**Given** I access the app on tablet (640px - 1024px)
**When** viewing any page
**Then** layouts adapt:
- Navigation remains visible
- Three Numbers grid becomes 2-column
- Charts are medium-sized

**And** no horizontal scrolling required (except for data tables)
**And** text remains readable (minimum 14px)

**Prerequisites:** All previous stories

**Technical Notes:**
- Audit all components for Tailwind responsive classes
- Test on actual mobile device or Chrome DevTools
- Use shadcn/ui Sheet for mobile navigation
- Follow UX spec Section 8 responsive strategy

---

### Story 7.2: Implement Help Text and Tooltips

**As a** user,
**I want** help text explaining financial terms,
**So that** I understand what each metric means.

**Acceptance Criteria:**

**Given** I see a financial term or complex metric
**When** I hover (desktop) or tap (mobile) the help icon (?)
**Then** I see a tooltip explaining:
- What the term means in plain language
- Why it matters
- Example if helpful

**Help content needed for:**
- Interest rate (annual vs effective)
- Daily vs monthly compounding
- Flexi facility
- Velocity banking
- Debt snowball vs avalanche
- Effort ratings
- Variance and accuracy

**And** tooltips are accessible (keyboard focusable, screen reader compatible)

**Prerequisites:** Story 1.1

**Technical Notes:**
- Use shadcn/ui Tooltip component
- Create `src/lib/help-content.ts` with help text constants
- Add HelpIcon component that wraps tooltip
- ARIA: tooltip role, aria-describedby

---

### Story 7.3: Implement Auto-Save Functionality

**As a** user,
**I want** my data to save automatically,
**So that** I never lose work if I forget to click save.

**Acceptance Criteria:**

**Given** I'm editing any form (account, income, expense)
**When** I make changes
**Then** data auto-saves after 2 seconds of inactivity (debounce)

**And** subtle "Saving..." indicator appears during save
**And** "Saved" indicator appears briefly after successful save
**And** error toast appears if save fails

**Given** I close the browser accidentally
**When** I reopen the app
**Then** all my data is intact (Dexie persistence)

**Prerequisites:** Story 2.1

**Technical Notes:**
- Implement debounced auto-save in forms
- Use useDebouncedCallback hook (create or use library)
- Add saving/saved state to forms
- Test: close browser mid-edit, verify data on reload

---

### Story 7.4: Implement Confirmation Feedback System

**As a** user,
**I want** clear feedback when I perform actions,
**So that** I know my changes were successful.

**Acceptance Criteria:**

**Given** I perform any data modification
**When** the action completes
**Then** I receive appropriate feedback:

| Action | Feedback |
|--------|----------|
| Save account | Green toast "Account saved" |
| Update account | Green toast "Account updated" |
| Delete account | Green toast "Account deleted" |
| Log balances | Green toast "Balances logged for [date]" |
| Select strategy | Green toast "Strategy selected: [name]" |
| Calculation complete | Subtle notification "Strategies calculated" |
| Error | Red toast with error message, manual dismiss |

**And** toasts appear in bottom-right corner
**And** success toasts auto-dismiss after 3 seconds
**And** error toasts require manual dismiss

**Prerequisites:** Story 1.4

**Technical Notes:**
- Audit all data operations for toast notifications
- Ensure consistent toast styling
- Test error scenarios (e.g., validation failures)

---

## FR Coverage Matrix

| FR | Description | Epic | Story |
|----|-------------|------|-------|
| FR1 | Debt account management | Epic 2 | Story 2.1 |
| FR2 | Flexi facility management | Epic 2 | Story 2.2 |
| FR3 | Income recording | Epic 2 | Story 2.3 |
| FR4 | Expense tracking | Epic 2 | Story 2.4 |
| FR5 | Balance updates | Epic 2 | Story 2.6 |
| FR6 | Financial snapshot | Epic 2 | Story 2.5 |
| FR7 | Local data persistence | Epic 1 | Story 1.2 |
| FR8 | Edit/delete data | Epic 2 | Story 2.1, 2.2, 2.3, 2.4 |
| FR9 | Daily interest calculation | Epic 4 | Story 4.1 |
| FR10 | Monthly interest calculation | Epic 4 | Story 4.1 |
| FR11 | Prime rate linkage | Epic 4 | Story 4.1 |
| FR12 | SARB rate simulation | Epic 4 | Story 4.7 |
| FR13 | Baseline strategy | Epic 4 | Story 4.3 |
| FR14 | Debt snowball strategy | Epic 4 | Story 4.3 |
| FR15 | Debt avalanche strategy | Epic 4 | Story 4.3 |
| FR16 | Flexi chunking strategy | Epic 4 | Story 4.4 |
| FR17 | Aggressive flexi strategy | Epic 4 | Story 4.4 |
| FR18 | Velocity banking strategy | Epic 4 | Story 4.5 |
| FR19 | Hybrid flexi-snowball | Epic 4 | Story 4.6 |
| FR20 | Hybrid flexi-avalanche | Epic 4 | Story 4.6 |
| FR21 | Strategy configuration | Epic 4 | Story 4.7 |
| FR22 | Month-by-month projections | Epic 4 | Story 4.2 |
| FR23 | Savings calculations | Epic 4 | Story 4.8 |
| FR24 | Side-by-side comparison | Epic 5 | Story 5.2 |
| FR25 | Comparison metrics | Epic 5 | Story 5.2 |
| FR26 | Debt reduction charts | Epic 5 | Story 5.3 |
| FR27 | Interest comparison charts | Epic 5 | Story 5.4 |
| FR28 | Effort ratings | Epic 5 | Story 5.2 |
| FR29 | Strategy recommendations | Epic 5 | Story 5.5 |
| FR30 | Comparison filters | Epic 5 | Story 5.6 |
| FR31 | Strategy selection | Epic 5 | Story 5.6 |
| FR32 | Balance logging | Epic 6 | Story 6.1 |
| FR33 | Actual vs projected comparison | Epic 6 | Story 6.2 |
| FR34 | Variance calculation | Epic 6 | Story 6.3 |
| FR35 | Accuracy assessment | Epic 6 | Story 6.3 |
| FR36 | Historical progress view | Epic 6 | Story 6.4 |
| FR37 | Deviation flagging | Epic 6 | Story 6.5 |
| FR38 | Notes/annotations | Epic 6 | Story 6.5 |
| FR39 | Cash flow health | Epic 3 | Story 3.1 |
| FR40 | Income vs expenditure | Epic 3 | Story 3.2 |
| FR41 | True cost of debt | Epic 3 | Story 3.3 |
| FR42 | Dashboard landing page | Epic 3 | Story 3.4 |
| FR43 | Debt reduction charts | Epic 6 | Story 6.2 |
| FR44 | Interest comparison viz | Epic 5 | Story 5.4 |
| FR45 | Historical data views | Epic 6 | Story 6.4 |
| FR46 | Visual status indicators | Epic 6 | Story 6.3 |
| FR47 | ZAR formatting | Epic 3 | Story 3.4 |
| FR48 | SA date formatting | Epic 3 | Story 3.4 |
| FR49 | Web browser access | Epic 1 | Story 1.1 |
| FR50 | Responsive design | Epic 7 | Story 7.1 |
| FR51 | 10-minute weekly updates | Epic 2 | Story 2.6 |
| FR52 | Help text and tooltips | Epic 7 | Story 7.2 |
| FR53 | Section navigation | Epic 1 | Story 1.3 |
| FR54 | Auto-save | Epic 7 | Story 7.3 |
| FR55 | Confirmation feedback | Epic 7 | Story 7.4 |

---

## Summary

**Total: 7 Epics, 37 Stories**

| Epic | Title | Stories | Primary Value |
|------|-------|---------|---------------|
| 1 | Foundation & Project Setup | 4 | Technical foundation enabling all features |
| 2 | Account & Data Management | 6 | Users can input complete financial picture |
| 3 | Financial Health Dashboard | 4 | Instant visibility into "Three Critical Numbers" |
| 4 | Calculation Engine | 8 | Core strategy modeling with SA-specific math |
| 5 | Strategy Comparison | 6 | Visual comparison and recommendations |
| 6 | Progress Tracking | 5 | Validation loop with actual vs projected |
| 7 | UX Polish | 4 | Responsive, helpful, polished experience |

**FR Coverage: 55/55 (100%)**

All functional requirements from the PRD are covered by at least one story. The epic sequence ensures:
1. Foundation first (enables everything)
2. Data entry next (required for calculations)
3. Dashboard early (immediate user value)
4. Calculation engine (core logic)
5. Comparison interface (the "aha moment")
6. Progress tracking (validation loop)
7. Polish last (refinement)

**Ready for Implementation**

This epic breakdown, combined with the PRD, UX Design, and Architecture documents, provides everything needed for Phase 4 implementation. Each story is sized for completion in a single dev session with clear acceptance criteria.

---

_For implementation: Use the `dev-story` workflow to implement individual stories from this epic breakdown._

_This document incorporates context from PRD (55 FRs), UX Design (shadcn/ui + Balanced Teal), and Architecture (Vite + React + Dexie.js)._
