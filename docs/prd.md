# Flowline Finance Studio - Product Requirements Document

**Author:** Leith
**Date:** 2025-11-26
**Version:** 1.0

---

## Executive Summary

Flowline Finance Studio is South Africa's first personalized debt acceleration comparison engine - a validation tool that analyzes YOUR specific financial situation and compares ALL debt payoff strategies to determine which approach actually delivers the fastest, most cost-effective path to becoming debt-free.

**The Problem:** South Africans with debt and flexi facilities have no way to answer: "What's the optimal strategy to accelerate my debt payoff - traditional methods, flexi chunking, velocity banking, or hybrid approaches?" Financial advisors don't provide this analysis, and existing debt calculators only show one method at a time.

**The Solution:** A web-based calculation and comparison engine that models 8-10 debt acceleration strategies using SA-specific flexi facility math (FNB Flexi Option, Standard Bank Access Bond), compares them side-by-side with YOUR real financial data, recommends the optimal approach based on effort vs. benefit vs. risk, and validates results through 3-6 months of progress tracking.

**The Validation-First Approach:** This MVP is built initially for the founder's personal validation - to definitively answer which debt strategy works best in the South African context. Only after proving efficacy with real data will it be generalized for broader use.

### What Makes This Special

**South Africa's First Multi-Strategy Debt Optimizer:**
- Every debt calculator shows you ONE method. This shows you ALL methods customized to SA flexi facilities and tells you which to use based on YOUR situation.
- Models SA-specific calculations: flexi facility daily interest, prime-linked rates, SARB volatility, Rand-denominated debt
- Compares traditional (snowball/avalanche), flexi optimization, velocity banking, and hybrid approaches in one unified view
- Provides transparent mathematical comparison with clear effort vs. benefit analysis
- Built for validation first - proves what actually works before scaling

---

## Project Classification

**Technical Type:** web_app
**Domain:** fintech
**Complexity:** high

This is a web application in the financial technology domain with high complexity due to:
- Regional compliance requirements (POPIA, potential FICA)
- Security standards for financial data
- Accurate financial calculation requirements
- SA-specific banking product modeling

### Domain Context

**Fintech Complexity in South Africa:**

The SA fintech market is valued at USD $981M (2024) growing to $3.7B by 2033 at 15.85% CAGR. Personal finance apps specifically represent $333M (2024) growing at 25.9% CAGR.

**Key Domain Challenges:**
1. **Regulatory Compliance** - POPIA (data protection) and evolving open banking framework (mid-2025)
2. **Financial Literacy Gap** - 60% of South Africans lack basic financial literacy
3. **High Household Debt** - 62.5% debt-to-income ratio, projected to reach 75%
4. **Calculation Accuracy** - Must precisely model daily interest (flexi) vs monthly interest (standard loans)

**For MVP (Personal Use):**
- POPIA compliance minimal (personal data only)
- FICA not required (not providing financial advice)
- Focus on calculation accuracy and validation
- Open banking integration deferred

---

## Success Criteria

**Primary Success: Validation of Optimal Debt Strategy**

Success means definitively answering: "Which debt acceleration strategy delivers the best results for my SA financial situation with the least complexity?"

**Technical Validation (Must Achieve):**
1. **Calculation Accuracy** - Strategy projections match actual flexi facility and loan behavior within 5% margin over 3 months
2. **SA-Specific Modeling** - Successfully models FNB Flexi Option daily interest calculations vs. standard loan monthly interest
3. **Multi-Strategy Comparison** - All 8-10 strategies produce mathematically correct projections that can be compared side-by-side
4. **Data Entry Efficiency** - Can update all financial data in under 10 minutes weekly

**Personal Validation (Core Goal):**
1. **Strategy Effectiveness Proven** - Actual debt reduction over 3-6 months validates which strategy performs best
2. **Effort vs. Benefit Clarity** - Clear understanding of whether complex strategies (velocity banking) deliver meaningfully better results than simple strategies (flexi chunking)
3. **Actionable Recommendations** - Tool provides clear guidance on which strategy to follow based on validated results
4. **Tracking Accuracy** - Actual results track within 10% of best-performing strategy projection

**Decision Criteria After Validation:**

**Scenario A: Clear Winner Identified (Ideal Success)**
- One strategy demonstrably outperforms others by >10% in interest savings or time-to-debt-free
- Effort required is sustainable and worthwhile for the benefit gained
- **Action:** Continue using winning strategy, consider generalizing tool for others

**Scenario B: Marginal Differences (Pivot Decision)**
- Strategies perform within 5-10% of each other
- Complex strategies don't justify additional effort
- **Action:** Use simplest effective strategy personally, reassess product direction

**Scenario C: Tool Validates Baseline (Pivot or Abandon)**
- Advanced strategies perform equal to or worse than simple extra payments
- Complexity doesn't deliver meaningful benefit
- **Action:** Pivot to general debt tracking tool, or move to other projects

**What Success Looks Like:**
- Confident decision-making about personal debt strategy based on validated data
- Clear understanding of SA flexi facility optimization potential
- Foundation for helping others IF validation proves meaningful benefits exist
- Honest assessment regardless of whether results match initial hypothesis

---

## Product Scope

### MVP - Minimum Viable Product (Personal Validation)

**Core Purpose:** Validate which debt acceleration strategy works best for founder's SA financial situation

**What's In Scope:**

**1. Manual Financial Data Entry**
- Debt accounts (home loan, vehicle finance, personal loans, credit cards)
- Flexi facility details (FNB Flexi Option specific for MVP)
- Monthly income and expense tracking
- Manual weekly/monthly updates

**2. Multi-Strategy Calculation Engine**
- Model 8-10 debt acceleration strategies with SA-specific math
- Daily interest calculations for flexi facilities
- Monthly interest calculations for standard loans
- Prime rate linkage and SARB rate change scenarios
- Accurate Rand-denominated projections

**3. Strategy Comparison Dashboard**
- Side-by-side comparison of all strategies
- Key metrics: debt-free date, total interest paid, monthly effort required
- Visual comparison charts (debt reduction curves, interest savings)
- Effort vs. benefit rating for each strategy
- Clear recommendation based on analysis

**4. Progress Tracking & Validation**
- Weekly/monthly actual debt balance logging
- Comparison of actual vs. projected results for chosen strategy
- Variance tracking and accuracy assessment
- Historical progress visualization

**5. "Three Critical Numbers" Health Dashboard**
- Cash flow surplus/deficit
- Income vs. expenditure breakdown
- True monthly cost of debt (interest only)

**What's Explicitly Out of Scope for MVP:**

**Deferred to Post-Validation:**
- Bank API integration (manual entry only)
- Multi-user support (single user only)
- Mobile native app (web-based only)
- Automated notifications or coaching
- LLM chat interface for advice
- Statement parsing/upload
- Support for banks beyond FNB/Standard Bank
- Generic "any SA bank" flexibility
- Investment optimization features
- Budget optimization recommendations
- Export to financial advisor formats
- Gamification or achievements
- Social/sharing features

**Regulatory/Compliance (Not Needed for Personal Use):**
- Full POPIA compliance infrastructure
- FICA requirements
- Financial advice disclaimers (educational tool only)
- Multi-tenant data isolation

### Growth Features (Post-MVP, If Validation Succeeds)

**Phase 2: Generalization (Months 6-12)**
- Support for all major SA banks' flexi products
- Configurable account types and interest calculation methods
- Export functionality (CSV, PDF reports)
- Enhanced visualization and reporting

**Phase 3: Multi-User (Year 1-2)**
- User authentication and data privacy
- Full POPIA compliance
- Shareable scenarios (anonymized)
- Community insights (aggregate data)

**Phase 4: Automation (Year 2+)**
- Open banking API integration
- Automated transaction categorization
- Real-time rate change alerts
- Predictive recommendations based on spending patterns

**Phase 5: Advisory Features (Future)**
- LLM-powered financial coaching
- Personalized optimization suggestions
- Integration with financial advisors
- Investment strategy coordination

### Vision (Long-term, If Product-Market Fit Proven)

**The Complete SA Debt Optimization Platform:**
- Comprehensive debt strategy comparison for all SA consumers
- Integration with major SA banks via open banking
- AI-powered personalized recommendations
- Community validation of strategies across different financial situations
- Trusted alternative to traditional financial advisor guidance for debt optimization

**Market Position:**
- South Africa's go-to tool for debt acceleration strategy validation
- Open source calculation methodology for transparency
- Evidence-based recommendations backed by real user data
- Educational resource for financial literacy improvement

---

## Functional Requirements

**Purpose:** These requirements define WHAT capabilities the system must have to enable debt strategy comparison and validation. Each FR represents a testable capability that will be implemented in epics and stories.

**Coverage:** All capabilities from MVP scope, domain requirements, and project-specific needs.

### Account & Data Management

**FR1:** User can create and manage multiple debt accounts with details: account name, current balance (ZAR), annual interest rate, minimum monthly payment, account type (home loan, vehicle finance, personal loan, credit card), and lender name

**FR2:** User can create and manage flexi facility account with details: credit limit, available balance, current utilization, interest rate, and facility type (FNB Flexi Option, Standard Bank Access Bond)

**FR3:** User can record monthly income with amount (ZAR), payment date, and income source

**FR4:** User can categorize and track monthly expenses by category with amounts in ZAR

**FR5:** User can update account balances manually on weekly or monthly basis

**FR6:** User can view complete financial snapshot showing all accounts, current balances, and total debt

**FR7:** System persists all financial data locally (browser storage or local database)

**FR8:** User can edit or delete any previously entered financial data

### Calculation Engine & Strategy Modeling

**FR9:** System calculates daily interest for flexi facility accounts using accurate daily compounding formula

**FR10:** System calculates monthly interest for standard loan accounts using standard amortization formulas

**FR11:** System models SA prime rate linkage for applicable accounts

**FR12:** User can simulate SARB rate changes to see impact on all strategies

**FR13:** System calculates "Baseline Strategy" projection showing debt payoff with minimum payments only

**FR14:** System calculates "Debt Snowball Strategy" projection prioritizing smallest balance first

**FR15:** System calculates "Debt Avalanche Strategy" projection prioritizing highest interest rate first

**FR16:** System calculates "Flexi Chunking Strategy" projection with regular lump sum deposits to flexi facility

**FR17:** System calculates "Aggressive Flexi Strategy" projection with maximum deposits and minimum withdrawals from flexi

**FR18:** System calculates "Velocity Banking Strategy" projection using flexi facility as primary account (SA adaptation)

**FR19:** System calculates "Hybrid Flexi-Snowball Strategy" combining flexi optimization with smallest debt targeting

**FR20:** System calculates "Hybrid Flexi-Avalanche Strategy" combining flexi optimization with highest interest targeting

**FR21:** User can configure strategy parameters (chunk amounts, payment frequencies, target accounts)

**FR22:** System generates month-by-month projection for each strategy showing: remaining balance per account, interest paid, principal paid, total debt remaining

**FR23:** System calculates total interest saved and months saved for each strategy vs. baseline

### Strategy Comparison & Recommendations

**FR24:** User can view side-by-side comparison of all calculated strategies on single dashboard

**FR25:** System displays key comparison metrics for each strategy: projected debt-free date, total interest paid over life of debt, total amount saved vs. baseline, monthly effort required

**FR26:** System generates visual comparison charts showing debt reduction curves over time for all strategies

**FR27:** System generates visual comparison of total interest paid across all strategies (bar chart)

**FR28:** System assigns effort rating to each strategy (Low/Medium/High) based on complexity and management overhead

**FR29:** System provides recommendation identifying optimal strategy based on: best interest savings, acceptable effort level, lowest risk profile

**FR30:** User can filter comparison view to show only strategies meeting selected criteria (effort level, minimum savings threshold)

**FR31:** User can select preferred strategy to track for validation

### Progress Tracking & Validation

**FR32:** User can log actual debt account balances on weekly or monthly basis

**FR33:** System compares actual balances to projected balances for selected strategy

**FR34:** System calculates variance percentage between actual and projected results

**FR35:** System displays accuracy assessment indicating if projections are tracking within acceptable margin (10%)

**FR36:** User can view historical progress showing: actual debt reduction over time, cumulative interest paid vs. projection, strategy adherence timeline

**FR37:** System identifies when actual results deviate significantly from projections and flags for review

**FR38:** User can add notes/annotations to tracking entries explaining variances (life events, unexpected expenses)

### Financial Health Dashboard

**FR39:** System calculates and displays cash flow health: available monthly surplus (income - expenses - minimum debt payments), visual indicator (green/yellow/red), percentage of income consumed by debt

**FR40:** System displays income vs. expenditure breakdown showing: total monthly income, total monthly expenses, discretionary spending amount, current savings rate

**FR41:** System calculates and displays true cost of debt: total monthly interest charges across all accounts (ZAR), annual interest cost projection, percentage of income going to interest only (not principal)

**FR42:** User can view financial health dashboard as primary landing page

### Data Visualization & Reporting

**FR43:** System generates interactive debt reduction curve charts showing balance over time

**FR44:** System generates interest payment comparison visualizations across strategies

**FR45:** User can view historical data for any time period (week, month, quarter, year-to-date)

**FR46:** System displays clear visual indicators for: on-track vs. off-track progress, positive vs. negative cash flow, high-risk vs. healthy debt levels

**FR47:** All monetary values display in South African Rand (ZAR) with appropriate formatting

**FR48:** All date displays use South African date format (DD/MM/YYYY)

### User Experience & Interface

**FR49:** User can access application via web browser on desktop or mobile device

**FR50:** Interface provides responsive design working on common screen sizes (desktop, tablet, mobile)

**FR51:** User can complete weekly data update in under 10 minutes

**FR52:** System provides clear help text and tooltips explaining financial terms and calculation methods

**FR53:** User can navigate between main sections: data entry, strategy comparison, progress tracking, health dashboard

**FR54:** System auto-saves data entries to prevent loss

**FR55:** User receives confirmation feedback for all data modifications (save, update, delete)

---

## Non-Functional Requirements

**Purpose:** Define quality attributes, performance, security, and reliability requirements that ensure the system works effectively for personal validation.

**Scope:** Only NFRs that matter for MVP personal use - no over-engineering for hypothetical future scale.

### Performance

**Why It Matters:** Calculation-heavy operations must be fast enough for weekly updates without frustration.

**NFR-P1: Calculation Performance**
- All strategy calculations (8-10 strategies) complete within 3 seconds for typical debt portfolio (5-10 accounts)
- Monthly projections generated for up to 360 months (30 years) within performance target
- Dashboard page loads and displays financial health within 2 seconds

**NFR-P2: Data Entry Responsiveness**
- Form inputs respond immediately to user interaction (< 100ms)
- Auto-save operations complete in background without blocking user interaction
- Page navigation between sections completes within 1 second

**NFR-P3: Chart Rendering**
- Visualization charts render within 2 seconds for 12-36 months of data
- Interactive chart operations (zoom, pan, tooltip) respond within 200ms

### Security

**Why It Matters:** Handling personal financial data requires basic security, even for single-user personal use.

**NFR-S1: Data Privacy**
- All financial data stored locally on user's device (browser local storage or local database)
- No transmission of financial data to external servers (client-side calculations only)
- No analytics or tracking of financial data values

**NFR-S2: Data Persistence**
- Financial data persists across browser sessions
- User can clear all data manually if desired
- Data backup/export capability for user-controlled backup

**NFR-S3: Basic Input Validation**
- Validate numeric inputs for financial values (prevent negative debt, invalid percentages)
- Validate date formats and logical date ranges
- Prevent calculation errors from invalid data entry

### Reliability

**Why It Matters:** Validation depends on accurate, consistent calculations over 3-6 months.

**NFR-R1: Calculation Accuracy**
- Interest calculations accurate to 2 decimal places (cent-level accuracy in ZAR)
- Daily interest compounding for flexi facilities mathematically correct
- Monthly amortization calculations match standard loan formulas
- Rounding errors do not accumulate beyond 0.1% over 12-month projections

**NFR-R2: Data Integrity**
- Auto-save prevents data loss during entry
- Data corruption prevented through validation before save
- Application state recoverable after browser crash or unexpected close

**NFR-R3: Consistent Behavior**
- Same inputs produce identical calculation results across sessions
- Strategy comparisons remain consistent for same financial snapshot
- Historical data remains unchanged when new data added

### Usability

**Why It Matters:** Weekly updates must be fast and painless to sustain 3-6 month validation period.

**NFR-U1: Data Entry Efficiency**
- Complete weekly balance update achievable in under 10 minutes (as per success criteria)
- Common actions accessible within 2 clicks from dashboard
- Clear visual feedback for all user actions

**NFR-U2: Visualization Clarity**
- Charts and graphs understandable without referring to documentation
- Color coding consistent and intuitive (red = bad, green = good)
- Key metrics prominently displayed with clear labels

**NFR-U3: Error Prevention & Recovery**
- Form validation prevents common data entry errors
- Clear error messages explain what went wrong and how to fix
- Undo capability for accidental deletions

### Compatibility

**Why It Matters:** Must work on devices you actually use for weekly updates.

**NFR-C1: Browser Support**
- Full functionality in modern browsers: Chrome 100+, Firefox 100+, Safari 15+, Edge 100+
- No Internet Explorer support required
- Works with JavaScript enabled (required for all functionality)

**NFR-C2: Device Support**
- Responsive design works on desktop (1920x1080 and 1366x768)
- Usable on tablet (iPad, Android tablets in landscape)
- Functional on mobile (390x844 iPhone, 412x915 Android) for viewing and quick updates

**NFR-C3: Offline Capability**
- Core functionality works without internet connection (client-side only)
- Data persists locally, no server dependency
- Calculations performed entirely in browser

### Maintainability

**Why It Matters:** You'll be maintaining and iterating this yourself during validation.

**NFR-M1: Code Quality**
- Calculation logic separated from UI for easy testing and updates
- Financial formulas documented with references to source methodology
- Clear comments explaining complex calculations (daily interest, strategy logic)

**NFR-M2: Testing**
- Calculation engine testable with known inputs/outputs
- Ability to validate calculations against manual spreadsheet models
- Test data easily loadable for verification

**NFR-M3: Extensibility**
- New debt strategies can be added without restructuring existing code
- Additional account types can be supported through configuration
- Chart/visualization library replaceable if needed

### Accessibility

**Why It Matters:** Basic accessibility ensures usability and may help others if tool is shared later.

**NFR-A1: Basic Accessibility**
- Sufficient color contrast for readability (WCAG AA minimum)
- Form labels properly associated with inputs
- Keyboard navigation functional for data entry forms

**NFR-A2: Screen Size Adaptability**
- Text remains readable on mobile devices (minimum 14px base font)
- Touch targets minimum 44x44px on mobile for easy interaction
- Critical functionality accessible without horizontal scrolling

**NFR-A3: Visual Clarity**
- Financial data displayed with clear hierarchy and grouping
- Important numbers (debt-free date, interest saved) visually prominent
- Charts include both color and patterns/labels for colorblind users

---

## Web Application Specific Requirements

**Platform:** Web-based single-page application (SPA)

**Technology Preferences (from Product Brief):**
- **Frontend Framework:** React, Vue, or Svelte (modern JS framework)
- **Data Storage:** Browser LocalStorage or IndexedDB for client-side persistence
- **Charting Library:** Chart.js, Recharts, or similar for visualizations
- **Styling:** Tailwind CSS or modern CSS framework for responsive design
- **Backend:** None required for MVP (fully client-side application)

**Deployment:**
- Static hosting (GitHub Pages, Netlify, Vercel free tier)
- No server-side requirements
- No database hosting required
- HTTPS for security (free via hosting platforms)

**Open Source Strategy (from Product Brief):**
- MIT or Apache 2.0 license
- GitHub public repository from day one
- Comprehensive README with calculation methodology documented
- Known limitations and assumptions clearly stated

---

## Summary

### What We're Building

Flowline Finance Studio is a **validation tool first, product second** - designed to definitively answer which debt acceleration strategy works best in the South African context with flexi facilities.

**Core Innovation:** South Africa's first multi-strategy debt optimizer that compares ALL debt acceleration approaches (traditional, flexi optimization, velocity banking, hybrid strategies) in one unified analysis, using SA-specific calculations for flexi facilities.

**Validation-First Philosophy:** Built initially for personal use to prove which strategies deliver real, measurable benefits before generalizing for others. Success is honest assessment backed by data, not confirmation bias.

### Requirements Summary

**55 Functional Requirements** organized into 7 capability areas:
1. Account & Data Management (8 FRs)
2. Calculation Engine & Strategy Modeling (15 FRs) - 8 distinct debt strategies
3. Strategy Comparison & Recommendations (8 FRs)
4. Progress Tracking & Validation (7 FRs)
5. Financial Health Dashboard (4 FRs)
6. Data Visualization & Reporting (6 FRs)
7. User Experience & Interface (7 FRs)

**21 Non-Functional Requirements** across 6 quality areas:
- Performance (3 NFRs) - Fast calculations and responsive UI
- Security (3 NFRs) - Local-only data, no external transmission
- Reliability (3 NFRs) - Accurate calculations, data integrity
- Usability (3 NFRs) - 10-minute weekly updates, clear visualizations
- Compatibility (3 NFRs) - Modern browsers, responsive design, offline-capable
- Maintainability (3 NFRs) - Testable, extensible, well-documented
- Accessibility (3 NFRs) - Basic WCAG AA compliance

### Technical Approach

**Architecture:** Client-side web application (SPA)
- No backend required
- Local data storage only
- Fully offline-capable
- Zero hosting costs (static hosting)

**Technology Stack:** Modern JavaScript framework (React/Vue/Svelte) with local storage and charting library

**Open Source:** Public GitHub repository from day one with transparent calculation methodology

### Next Steps

**After This PRD:**
1. **UX Design** (Optional but recommended) - Design the strategy comparison dashboard and data entry flows
2. **Architecture** - Define technical decisions for calculation engine, data models, and component structure
3. **Epic Breakdown** - Transform these 55 FRs into implementable epics and stories

**Implementation Timeline (from Product Brief):**
- Weeks 1-2: Data entry interface + local storage
- Weeks 3-4: Calculation engine implementation
- Weeks 5-6: Dashboard and comparison views
- Weeks 7-8: Progress tracking and refinement
- Week 8: MVP functional for personal validation
- Months 3-6: Validation period with real financial data

**Success Gate:** 3-6 month validation determines whether to generalize tool, pivot approach, or move to other projects based on honest assessment of results.

---

_This PRD captures the complete vision and requirements for Flowline Finance Studio - a debt strategy validation tool built for truth-seeking, not product-market fit assumptions._

_It reflects the validation-first philosophy: build it for yourself, prove it works with data, then decide if it's worth sharing with others._

_Next workflow: UX Design (if UI-heavy) or Architecture (technical decisions), then Epic Breakdown with full context._
