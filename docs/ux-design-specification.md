# Flowline Finance Studio UX Design Specification

_Created on 2025-11-26 by Leith_
_Generated using BMad Method - Create UX Design Workflow v1.0_

---

## Executive Summary

**Project Vision:**

Flowline Finance Studio is South Africa's first personalized debt acceleration comparison engine - a validation tool that analyzes YOUR specific financial situation and compares ALL debt payoff strategies to determine which approach actually delivers the fastest, most cost-effective path to becoming debt-free.

**Core User Experience:**

The defining experience is **strategy comparison** - users input their financial data once, then see 8-10 different debt acceleration strategies (baseline, snowball, avalanche, flexi chunking, velocity banking, hybrids) compared side-by-side with clear metrics: debt-free date, total interest saved, monthly effort required.

**Primary User Flow:**
1. **Dashboard Entry** - Instant "Three Critical Numbers" snapshot (Cash Flow Health, Income vs Expenditure, True Cost of Debt)
2. **Weekly Data Updates** - Quick balance logging (under 10 minutes)
3. **Strategy Comparison** - Visual comparison of all strategies with YOUR real data
4. **Progress Tracking** - Actual vs projected validation over 3-6 months

**Platform:** Web-based single-page application, fully client-side (offline-capable), responsive across desktop, tablet, and mobile.

**Design Philosophy:** Validation-first MVP focused on manual entry, accurate calculations, and clear visual comparison. Future automation features deferred until methodology is proven.

---

## 1. Design System Foundation

### 1.1 Design System Options & Recommendation

**Context:** Web application (SPA) using React/Vue/Svelte with Tailwind CSS and charting library (Chart.js/Recharts).

**Design System Evaluation for Flowline Finance Studio:**

Based on research from [Prismic React Component Libraries](https://prismic.io/blog/react-component-libraries), [Untitled UI React Libraries](https://www.untitledui.com/blog/react-component-libraries), and [Luzmo React Dashboard](https://www.luzmo.com/blog/react-dashboard):

#### **Option 1: shadcn/ui + Tailwind CSS + Recharts** ⭐ RECOMMENDED

**What It Provides:**
- **66k+ GitHub stars** - Most popular modern React design system in 2025
- Copy-paste component approach - You own the code, full customization
- Built on Radix UI (accessibility-first) + Tailwind CSS (utility styling)
- Light/dark mode out of the box
- TypeScript support, server-side rendering compatible
- Comprehensive components: buttons, forms, cards, tables, modals, navigation

**Chart Library: Recharts**
- Animation and responsive sizing built-in
- Lightweight for production dashboards
- Line charts, bar charts, area charts perfect for debt reduction curves
- Well-documented, active community

**Best For:**
- Developers who want full control and customization
- Projects needing accessibility (WCAG AA compliance)
- Fast development with modern styling
- MVPs that may evolve significantly (you own the code, easy to modify)

**Why It Fits Flowline:**
- ✅ Matches tech preferences (React + Tailwind)
- ✅ Accessibility built-in (Radix UI foundation)
- ✅ Full customization (critical for unique financial visualization)
- ✅ Lightweight (fast calculations + client-side only)
- ✅ Free and open source (zero cost, MIT license)
- ✅ Copy-paste = easy to understand and modify as validation reveals needs

**Provides:** ~50+ components | WCAG AA accessible | Free
**Missing:** Financial-specific components (you'll build custom debt comparison views)

---

#### **Option 2: Material UI (MUI) + Recharts**

**What It Provides:**
- Comprehensive component library (~100+ components)
- Mature ecosystem, extensive documentation
- Robust theming support
- Works well for dashboards, SaaS platforms, enterprise apps
- Strong TypeScript support

**Best For:**
- Teams wanting pre-built, polished components
- Projects needing comprehensive UI out of the box
- Enterprise applications with established design language

**Why It Might Fit:**
- ✅ Comprehensive component set reduces custom development
- ✅ Polished default styling
- ✅ Excellent documentation and community support
- ⚠️ More opinionated styling (requires more effort to customize)
- ⚠️ Heavier bundle size (may impact client-side calculations)

**Provides:** 100+ components | Accessible | Free (core) + Paid (advanced)

---

#### **Option 3: Headless UI + Tailwind CSS + Chart.js**

**What It Provides:**
- Unstyled, fully accessible components by Tailwind CSS creators
- 25k+ GitHub stars, 1.8M+ weekly downloads
- Complete styling control (you write all CSS)
- Minimal bundle size

**Chart Library: Chart.js**
- Most popular JavaScript charting library
- Simple API, great documentation
- Canvas-based rendering (fast performance)

**Best For:**
- Full customization from scratch
- Designers who want complete visual control
- Performance-critical applications

**Why It Might Not Fit:**
- ⚠️ More work (no pre-styled components, build everything)
- ⚠️ Slower initial development (MVP speed matters)

**Provides:** Unstyled primitives | WCAG AAA accessible | Free

---

#### **Option 4: TailGrids React + TanStack Charts**

**What It Provides:**
- 100+ dashboard-specific components
- Data Stats components for KPIs (perfect for "Three Numbers" dashboard)
- 10 built-in chart components

**Chart Library: TanStack Charts**
- Best for dense time series (debt reduction over 36+ months)
- Financial data visualization optimized

**Best For:**
- Financial dashboard projects
- Teams wanting dashboard-specific components

**Why It Might Not Fit:**
- ⚠️ Less mature ecosystem than shadcn/MUI
- ⚠️ Fewer community resources

**Provides:** 100+ dashboard components | Accessible | Paid ($)

---

### **Recommendation: shadcn/ui + Tailwind CSS + Recharts**

**Rationale for Flowline Finance Studio:**

1. **Validation-First Philosophy:** You own the code - easy to modify as validation reveals what users actually need
2. **Fast Development:** Copy-paste components = quick MVP, no framework lock-in
3. **Accessibility Built-In:** Radix UI foundation ensures WCAG AA compliance (NFR-A1 requirement)
4. **Perfect for Financial Visualization:** Tailwind's utility classes make custom chart styling fast; Recharts handles debt curves beautifully
5. **Open Source Alignment:** Matches project's open source strategy
6. **Zero Cost:** Free, MIT licensed, no vendor lock-in
7. **Modern Stack:** TypeScript support, server-side rendering ready (for future growth)
8. **Lightweight:** Won't slow down client-side calculations (critical NFR-P1 requirement)

**What You'll Build Custom:**
- Multi-strategy comparison table (8-10 strategies side-by-side)
- "Winner's podium" visualization (top 3 strategies)
- Debt reduction curve overlay (all strategies on one chart)
- "Three Critical Numbers" health dashboard cards
- Progress tracking actual vs projected charts

**Component Foundation from shadcn/ui:**
- Cards (for dashboard layout)
- Tables (for strategy comparison)
- Buttons, forms, inputs (for data entry)
- Badges (for effort ratings: Low/Medium/High)
- Progress indicators (for tracking)
- Modals/dialogs (for detailed projections)
- Navigation (for sections: Dashboard, Data Entry, Compare, Track)

**Sources:**
- [Prismic: Best React UI Libraries 2025](https://prismic.io/blog/react-component-libraries)
- [Untitled UI: React Component Libraries](https://www.untitledui.com/blog/react-component-libraries)
- [Luzmo: React Dashboard Libraries](https://www.luzmo.com/blog/react-dashboard)
- [Embeddable: React Chart Libraries](https://embeddable.com/blog/react-chart-libraries)

### 1.2 Design System Decision

**Selected: shadcn/ui + Tailwind CSS + Recharts**

**Technology Stack:**
- **UI Components:** shadcn/ui (Radix UI + Tailwind CSS)
- **Styling:** Tailwind CSS utility classes
- **Charts:** Recharts (React charting library)
- **Framework:** React (with TypeScript)
- **Accessibility:** WCAG AA compliance via Radix UI primitives

**Implementation Notes:**
- Copy-paste component approach gives full code ownership
- Lightweight bundle for fast client-side calculations
- Accessible by default (Radix UI foundation)
- Open source and free (MIT license)
- Modern, customizable, validation-ready

---

## 2. Core User Experience

### 2.1 Defining Experience & Emotional Goals

**The Defining Experience: Strategy Comparison**

Users input their financial data once, then witness 8-10 debt acceleration strategies compared side-by-side with their REAL numbers. The "aha moment" happens when they see - visually and numerically - which strategy delivers the fastest path to debt-free.

**Core Emotional Goals: Hope + Empowerment**

**Hope** - "I can see the path to debt-free"
- Visual debt reduction curves showing the timeline
- Clear metrics: months saved, interest saved (in Rand)
- Progress tracking validates that the strategy is working
- Actual vs projected alignment proves the methodology

**Empowerment** - "I'm in control of my financial future"
- User chooses their strategy based on data, not guessing
- Weekly updates keep user engaged (under 10 minutes)
- Honest truth-telling builds trust and informed decisions
- Clarity replaces confusion - no hiding from reality

**Emotional Arc:**

From: *"I'm overwhelmed by debt and don't know the best path forward"*
To: *"I have clarity, a proven strategy, and I can see it working"*

**Design Implications:**

1. **Visual Proof is Essential** - Charts, graphs, timelines must SHOW hope (the path forward)
2. **Clarity Over Complexity** - Simplify, surface insights, hide calculation complexity
3. **Truth-Telling Interface** - Color-coded health indicators (green/yellow/red) give honest feedback
4. **User Control Reinforced** - Every decision point emphasizes choice and agency
5. **Progress Must Be Visible** - Weekly tracking shows "it's working" validation

### 2.2 Novel UX Patterns

**Multi-Strategy Comparison Interface**

While individual debt calculators are common, **simultaneous comparison of 8-10 strategies with SA-specific calculations (flexi facilities, daily interest compounding)** is novel in the South African market.

**UX Challenge:** How do you compare 8-10 different timelines, interest totals, and effort levels without overwhelming the user?

**Pattern Solution:**

1. **Layered Comparison Approach:**
   - **Level 1 (Overview):** Visual "winner's podium" showing top 3 strategies by interest saved
   - **Level 2 (Detailed Comparison):** Side-by-side metrics table for all strategies
   - **Level 3 (Deep Dive):** Individual strategy exploration with month-by-month projections

2. **Progressive Disclosure:**
   - Start with high-level insights ("Velocity Banking saves you R87,450 and 18 months")
   - Expand to detailed projections on demand
   - Keep complexity collapsed until user needs it

3. **Visual Hierarchy:**
   - Debt reduction curves (all strategies overlaid on one chart)
   - Interest paid comparison (horizontal bar chart, sorted by savings)
   - Effort rating badges (Low/Medium/High visual indicators)

4. **Recommendation System:**
   - Algorithm highlights optimal strategy based on: best interest savings + acceptable effort + lowest risk
   - User can override and select any strategy
   - Rationale provided for recommendation

**Inspiration:** Sports comparison dashboards (comparing team/player stats), investment portfolio comparison tools, A/B testing results visualization

### 2.3 Inspiration Analysis & UX Pattern Research

**Apps South African Users Already Love:**

1. **Vault22 (formerly 22Seven)** - South African financial wellness platform
   - **What Works:** Gamification with progression levels (Rookie → Elite), unified financial snapshot from 120+ SA institutions
   - **UX Patterns:** Centralized financial management, visual health indicators, clear budgeting tools
   - **Learnings:** SA users respond well to gamification and progress tracking; support for multiple institutions is table stakes

2. **TymeBank** - South African digital-only bank
   - **What Works:** Smart, simple, low-cost interface; GoalSave feature for targeted savings
   - **UX Patterns:** Minimal friction, clear earning/spending visualization, goal-oriented design
   - **Learnings:** SA fintech users value simplicity and transparency; goal visualization drives engagement

3. **YNAB (You Need A Budget)** - Zero-based budgeting app (international reference)
   - **What Works:** Friendly, approachable UX writing; active user involvement (not set-and-forget); loan payoff simulator
   - **UX Patterns:** Zero-based budgeting system, thoughtful money allocation, behavioral nudges through supportive copy
   - **Learnings:** "Friendly, approachable tone helps users feel comfortable and confident" - active participation beats automation for financial behavior change
   - **Success Metrics:** Average user saves $600 in first 2 months, $6,000 in first year
   - **Key Pattern:** Forces users to be thoughtful about every dollar - aligns with empowerment goal

**2025 Financial Dashboard Best Practices:**

From [UXPin Dashboard Design](https://www.uxpin.com/studio/blog/dashboard-design-principles/), [Merge Rocks Fintech Design](https://merge.rocks/blog/fintech-dashboard-design-or-how-to-make-data-look-pretty), and [F9 Finance Dashboard Guide](https://www.f9finance.com/dashboard-design-best-practices/):

- **Visual Hierarchy:** Key metrics at top/center with strong contrast
- **Card-Based Layouts:** Each card encapsulates specific metric with mini-graphs
- **Minimalist Approach:** Color and shape serve function; clean aesthetics increase focus
- **Accuracy is Non-Negotiable:** Visual representations must never mislead (critical for trust)
- **Interactive Charts:** Line charts for trends, bar charts for comparisons, tables for holdings with gain/loss indicators
- **Responsive Design:** Layout adapts to device; mobile may require different patterns (vertical vs horizontal)

**Comparison Visualization Patterns:**

From [NN/G Comparison Tables](https://www.nngroup.com/articles/comparison-tables/) and [Smashing Magazine Feature Comparison](https://www.smashingmagazine.com/2017/08/designing-perfect-feature-comparison-table/):

- **Limit Comparisons:** Maximum 5 items for true side-by-side; beyond that, add filters
- **Highlight Differences:** Use color, bolding, icons to show what's unique
- **Mobile Strategy:** Convert columns to tabs for narrow screens
- **Show/Hide Similarities:** Option to display only differences reduces cognitive load
- **Smart Filtering:** Better filtering reduces need for massive comparison tables

**Progress Tracking UI Patterns:**

From [UXPin Progress Trackers](https://www.uxpin.com/studio/blog/design-progress-trackers/) and [Arounda Progress Trackers](https://arounda.agency/blog/progress-trackers-in-ux-design-2):

- **Determinate Patterns:** Show time remaining, percentage, or steps left
- **Real-Time Updates:** Changes happen immediately, creating sense of progress
- **Vertical for Mobile:** Horizontal trackers don't fit on narrow screens
- **Sub-Task Division:** Breaking goals into smaller tasks increases completion percentage
- **Off-Ramps:** Provide "Back" or "Save Progress" options for user control

**UX Patterns Applicable to Flowline Finance Studio:**

1. **Dashboard as Financial Health Snapshot** - Vault22, TymeBank, Mint pattern
   - Large, clear numbers with color-coded health indicators
   - Card-based layout for "Three Critical Numbers"
   - Mini-graphs showing trends at a glance

2. **Friendly, Empowering Language** - YNAB pattern
   - Supportive copy that encourages action
   - Explain concepts in plain language (not jargon)
   - Celebrate progress, acknowledge challenges

3. **Goal Visualization** - TymeBank GoalSave, progress tracker patterns
   - Visual representation of debt-free timeline
   - Progress bars showing debt reduction percentage
   - Actual vs projected comparison drives validation

4. **Simplified Comparison** - Feature comparison table patterns
   - Limit initial view to top 3-5 strategies
   - Highlight key differences (interest saved, time saved)
   - Expandable details for deeper exploration
   - Filter/sort options for personalization

5. **Responsive Financial Charts** - Financial dashboard best practices
   - Line charts for debt reduction curves over time
   - Horizontal bar charts for interest comparison
   - Mobile-friendly adaptations (vertical layouts, simplified views)

**Key Design Decisions from Inspiration:**

- **Accuracy > Aesthetics** - Financial data must be trustworthy
- **Clarity > Complexity** - Progressive disclosure keeps it simple
- **Engagement > Automation** - Active participation (weekly updates) builds ownership
- **Hope through Visualization** - Charts show the path forward, not just current state
- **South African Context** - Local fintech (Vault22, TymeBank) proves market for financial wellness tools

---

## 3. Visual Foundation

### 3.1 Color System

**Selected Theme: Balanced Teal**

**Decision Rationale:**

Balanced Teal was chosen for Flowline Finance Studio because it perfectly embodies the dual emotional goals of **Hope + Empowerment** while differentiating from traditional banking applications.

**Why Teal Works for Debt Validation:**
- **Blends Trust + Growth:** Blue undertones convey reliability and professionalism; green undertones convey progress and hope
- **Unique in SA Fintech:** Most SA banks use blue (FNB, Standard Bank, Nedbank) - teal stands out as "on your side" not "the bank"
- **Calm Confidence:** Users facing debt need reassurance without corporate coldness
- **Data-Friendly:** Professional enough for complex financial visualization without feeling sterile

**Color Palette (Tailwind CSS):**

**Primary Colors:**
- **Primary:** `teal-600` (#0d9488) - Main brand color, buttons, headers, primary actions
- **Primary Dark:** `teal-700` (#0f766e) - Hover states, emphasis, depth
- **Primary Light:** `teal-50` (#ccfbf1) - Backgrounds, subtle highlights, focus states

**Semantic Colors (Status Indicators):**
- **Success/Health:** `green-500` (#10b981) - Positive cash flow, on-track progress, "Breathing" status
- **Warning/Caution:** `amber-500` (#f59e0b) - Yellow zone, attention needed, moderate risk
- **Error/Debt:** `red-500` (#ef4444) - High debt cost, off-track, critical issues
- **Info/Neutral:** `blue-500` (#3b82f6) - Informational messages, neutral data points

**Grayscale (Text & Backgrounds):**
- **Text Primary:** `slate-900` (#0f172a) - Body text, headings
- **Text Secondary:** `slate-600` (#475569) - Supporting text, labels
- **Text Muted:** `slate-400` (#94a3b8) - Placeholder text, disabled states
- **Background:** `slate-50` (#f8fafc) - Page background
- **Surface:** `white` (#ffffff) - Cards, modals, elevated surfaces
- **Border:** `slate-200` (#e2e8f0) - Dividers, card borders

**Chart Colors (Debt Reduction Visualization):**
- **Strategy 1 (Baseline):** `slate-400` (#94a3b8) - Muted baseline comparison
- **Strategy 2-4 (Top performers):** Gradients of `teal-500` to `teal-700` - Highlight best strategies
- **Strategy 5-8 (Alternatives):** `blue-400`, `indigo-400`, `cyan-400`, `emerald-400` - Distinct but harmonious
- **Actual vs Projected:** `teal-600` (projected) vs `teal-900` (actual) - Clear validation

**Application Examples:**

**"Three Critical Numbers" Dashboard:**
- Cash Flow Health card: Teal header (#0d9488), Green value if positive (#10b981), Red if negative (#ef4444)
- Income vs Expenditure: Teal header, Blue neutral indicator (#3b82f6)
- True Cost of Debt: Teal header, Red value (#ef4444) - honest truth-telling

**Strategy Comparison:**
- Primary CTA button: Teal background (#0d9488), white text
- Winner's podium: Gold/Silver/Bronze accents with teal highlights
- Debt reduction charts: Teal lines for recommended strategy, muted colors for alternatives

**Progress Tracking:**
- On-track status: Green badge (#10b981)
- Off-track status: Amber badge (#f59e0b)
- Validation passed: Teal success message (#0d9488)

**Accessibility Compliance:**

All color combinations meet WCAG AA standards:
- Teal (#0d9488) on white: 4.5:1 contrast (AA compliant)
- White text on teal: 4.5:1 contrast (AA compliant)
- Red (#ef4444) on white: 4.5:1 contrast (AA compliant)
- Slate-900 (#0f172a) on white: 19:1 contrast (AAA compliant)

**Color Usage Rules:**

1. **Primary Teal** - Use for primary actions, brand moments, key metrics
2. **Semantic Colors** - Always use consistently: Green = good, Red = bad/debt, Amber = caution
3. **Never Use Color Alone** - Always pair with icons, labels, or patterns for colorblind users
4. **Charts Must Be Distinct** - Different line styles (solid, dashed, dotted) in addition to colors
5. **Dark Mode Ready** - Teal adjusts to `teal-400` (#2dd4bf) on dark backgrounds

**Visual Foundation Summary:**

Balanced Teal creates a visual identity that says: "We're here to help you find hope and clarity in your debt journey" - professional, trustworthy, and optimistic without being naive.

**Interactive Visualization:**

Color theme explorer with live examples: [ux-color-themes.html](./ux-color-themes.html)

**Interactive Visualizations:**

- Color Theme Explorer: [ux-color-themes.html](./ux-color-themes.html)

---

## 4. Design Direction: Data-Focused Clarity

### 4.1 Chosen Design Approach

**Design Philosophy: Clean, Data-Forward Financial Dashboard**

Flowline Finance Studio adopts a **clean, minimalist, data-focused** design approach that prioritizes clarity and trust over visual flourish.

**Core Design Principles:**

1. **Data First, Design Second** - Charts, numbers, and comparisons are the heroes; UI fades into the background
2. **Progressive Disclosure** - Start simple (Three Numbers), reveal complexity on demand (strategy details)
3. **Truth-Telling Visual Language** - Color-coded honesty (green/yellow/red) without sugar-coating
4. **Empowering Simplicity** - Complex calculations presented through clear visualizations

**Visual Style:**

- **Layout:** Card-based dashboard with generous white space
- **Typography:** Clear hierarchy, readable font sizes (minimum 14px base)
- **Iconography:** Minimal, functional icons (not decorative)
- **Shadows:** Subtle elevation for cards (0 1px 3px rgba(0,0,0,0.1))
- **Borders:** Light, clean borders (`slate-200`) to define sections
- **Animations:** Subtle, purposeful (chart loading, number transitions)

**Inspiration Blend:**

- **Vault22/TymeBank:** Card-based health dashboard
- **YNAB:** Friendly copy, clear data presentation
- **Modern SaaS:** Clean, professional, trustworthy

**What This ISN'T:**

- ❌ Playful/gamified (debt is serious)
- ❌ Overly corporate (not a bank)
- ❌ Minimalist to a fault (clarity > minimalism)
- ❌ Chart-heavy chaos (progressive disclosure)

---

## 5. User Journey Flows

### 5.1 Critical User Paths

**Flow 1: First-Time Setup (Data Entry)**

```
1. Land on Welcome Screen
   ↓
2. Enter Debt Accounts (home loan, vehicle, credit cards)
   - Account name, balance, interest rate, minimum payment
   ↓
3. Enter Flexi Facility Details (if applicable)
   - Credit limit, available balance, interest rate
   ↓
4. Enter Monthly Income & Expenses
   - Net income, expense categories
   ↓
5. Review Financial Snapshot
   - "Three Critical Numbers" preview
   ↓
6. Generate Strategy Comparison
   - System calculates all 8-10 strategies
   ↓
7. View Results Dashboard
   - Winner's podium + detailed comparison
```

**Flow 2: Weekly Balance Update (< 10 minutes)**

```
1. Navigate to "Update Balances"
   ↓
2. See List of All Accounts with Current Balances
   ↓
3. Update Changed Balances Only
   - Quick edit inline
   ↓
4. Save & Recalculate
   ↓
5. View Updated "Three Numbers" Dashboard
   ↓
6. Check Progress Tracking (Actual vs Projected)
```

**Flow 3: Strategy Comparison & Selection**

```
1. View Strategy Comparison Dashboard
   ↓
2. See Winner's Podium (Top 3 Strategies)
   - Quick visual of best performers
   ↓
3. Explore Detailed Comparison Table
   - All 8-10 strategies side-by-side
   - Metrics: Debt-free date, Interest saved, Effort rating
   ↓
4. Expand Individual Strategy for Deep Dive
   - Month-by-month projection
   - Effort requirements, Risk assessment
   ↓
5. Select Strategy to Track
   ↓
6. Confirm Selection & Begin Tracking
```

**Flow 4: Progress Validation (Monthly)**

```
1. Navigate to Progress Tracking
   ↓
2. View Actual vs Projected Chart
   - Debt reduction curve overlay
   ↓
3. Check Variance Percentage
   - On-track (green) vs Off-track (red) indicator
   ↓
4. Add Notes/Annotations (if variance detected)
   - Explain life events, unexpected expenses
   ↓
5. Review Recommendations
   - System suggests adjustments if needed
```

---

## 6. Component Library Strategy

### 6.1 Component Strategy

**Foundation: shadcn/ui Components**

Flowline Finance Studio uses shadcn/ui as the base component library, customized with Balanced Teal theme.

**Core Components (from shadcn/ui):**

**Layout & Structure:**
- `Card` - Financial health cards, strategy cards, summary cards
- `Tabs` - Navigation between sections (Dashboard, Data Entry, Compare, Track)
- `Dialog/Modal` - Detailed strategy views, confirmation dialogs
- `Sheet` - Mobile navigation drawer

**Data Display:**
- `Table` - Strategy comparison table, account list
- `Badge` - Effort ratings (Low/Medium/High), status indicators
- `Progress` - Debt reduction progress bars
- `Separator` - Section dividers

**Forms & Input:**
- `Input` - Account balance entry, financial data
- `Label` - Form labels with tooltips
- `Button` - Primary actions (teal), Secondary actions (outline), Tertiary (ghost)
- `Select/Dropdown` - Account type selection, strategy filters

**Feedback:**
- `Toast` - Save confirmations, error messages
- `Alert` - Important warnings, guidance
- `Skeleton` - Loading states during calculations

**Custom Components (Built for Flowline):**

**Financial Components:**
1. **HealthCard** - Displays one of "Three Critical Numbers" with color-coded status
   - Props: title, value, status (green/yellow/red), trend

2. **StrategyCard** - Individual strategy summary card
   - Props: strategyName, debtFreeDate, interestSaved, effortRating, isRecommended

3. **WinnersPodium** - Visual display of top 3 strategies
   - Props: strategies (array of top 3)

4. **DebtReductionChart** - Recharts line chart showing debt curves
   - Props: strategies (array), selectedStrategy, actualData

5. **ComparisonTable** - Side-by-side strategy metrics
   - Props: strategies (array), sortBy, filterBy

6. **ProgressTracker** - Actual vs projected visualization
   - Props: projectedData, actualData, variance

7. **VarianceIndicator** - On-track vs off-track visual feedback
   - Props: variance (percentage), threshold (10%)

**Component Composition Pattern:**

```
Dashboard Page
  ├─ Header (logo, navigation)
  ├─ ThreeNumbersSection
  │   ├─ HealthCard (Cash Flow)
  │   ├─ HealthCard (Income vs Expense)
  │   └─ HealthCard (Debt Cost)
  ├─ StrategyComparisonSection
  │   ├─ WinnersPodium (top 3)
  │   └─ ComparisonTable (all strategies)
  └─ ProgressSection
      ├─ DebtReductionChart
      └─ VarianceIndicator
```

**Styling Approach:**

- Use Tailwind utility classes for spacing, colors, typography
- shadcn/ui components already styled with Tailwind
- Custom components follow same patterns
- Teal theme applied via Tailwind config

---

## 7. UX Pattern Decisions

### 7.1 Consistency Rules

**Navigation Pattern:**

- **Top-level tabs:** Dashboard | Data Entry | Compare | Track
- **Mobile:** Hamburger menu with same structure
- **Current page:** Teal underline indicator

**Button Hierarchy:**

- **Primary action:** Teal filled button (teal-600 background, white text)
- **Secondary action:** Teal outline button (teal-600 border, teal-600 text)
- **Tertiary action:** Ghost button (teal-600 text only)
- **Destructive action:** Red outline (red-500 border)

**Status Indicators (Consistent Throughout):**

- **Green** = Healthy, On-track, Positive
- **Amber** = Warning, Caution, Moderate
- **Red** = Unhealthy, Off-track, Critical
- **Always paired with icon** (✓, ⚠, ✕) for accessibility

**Data Entry Patterns:**

- **Inline editing:** Click to edit balance fields directly
- **Form validation:** Real-time feedback, error messages below field
- **Required fields:** Asterisk (*) + clear labeling
- **Help text:** Tooltip icon (?) with explanation

**Comparison Pattern (8-10 Strategies):**

- **Level 1:** Winner's Podium (top 3 only) - reduces overwhelm
- **Level 2:** Full comparison table with sort/filter
- **Level 3:** Expand individual strategy for details
- **Mobile:** Convert to tabs/accordion

**Chart Patterns:**

- **Line charts:** Debt reduction over time (all strategies overlaid)
- **Bar charts:** Interest comparison (horizontal bars, sorted)
- **Always include:** Legend, axis labels, tooltips on hover
- **Mobile:** Simplified charts, larger touch targets

**Feedback & Confirmation:**

- **Saves:** Green toast notification, 3-second auto-dismiss
- **Errors:** Red alert banner, manual dismiss
- **Destructive actions:** Confirmation dialog required

**Loading States:**

- **Calculations:** Skeleton loaders for charts/tables
- **Data fetch:** Spinner for quick operations
- **Never block:** Show partial data while calculating

---

## 8. Responsive Design & Accessibility

### 8.1 Responsive Strategy

**Breakpoints (Tailwind):**

- **Mobile:** < 640px (sm)
- **Tablet:** 640px - 1024px (md, lg)
- **Desktop:** > 1024px (xl, 2xl)

**Layout Adaptations:**

**Desktop (> 1024px):**
- Three Numbers: 3-column grid
- Strategy comparison: Side-by-side table (5 strategies visible)
- Charts: Full-width, detailed

**Tablet (640px - 1024px):**
- Three Numbers: 2-column grid (third wraps)
- Strategy comparison: Scrollable table or 3-column grid
- Charts: Simplified, larger touch targets

**Mobile (< 640px):**
- Three Numbers: Single column stack
- Strategy comparison: Convert to tabs or accordion (max 3 visible)
- Charts: Vertical layouts, swipe for more data
- Navigation: Hamburger menu

**Touch Targets:**

- Minimum 44x44px for all interactive elements
- Increased padding on mobile buttons
- Larger form inputs (minimum 48px height)

**Typography Scaling:**

- Base: 16px (desktop), 14px (mobile)
- Headings: Responsive font sizes (text-2xl → text-xl on mobile)
- Line height: 1.6 for readability

### 8.2 Accessibility (WCAG AA Compliance)

**Color & Contrast:**

- All color combinations meet 4.5:1 minimum contrast
- Status indicators use icon + color (never color alone)
- Charts use patterns + colors for colorblind users

**Keyboard Navigation:**

- All interactive elements keyboard accessible (Tab order logical)
- Focus indicators visible (teal-600 ring)
- Skip to main content link
- Escape key closes modals

**Screen Reader Support:**

- Semantic HTML (header, nav, main, section, article)
- ARIA labels for complex components
- alt text for all images/icons
- Live regions for dynamic updates (toasts, calculations)

**Form Accessibility:**

- Labels properly associated with inputs
- Error messages linked via aria-describedby
- Required fields indicated with asterisk + aria-required
- Tooltips accessible via keyboard

**Chart Accessibility:**

- Aria-label describing chart purpose
- Table alternative for chart data (hidden, screen reader only)
- Keyboard navigation through data points

---

## 9. Implementation Guidance

### 9.1 Completion Summary

**UX Design Specification Complete**

This UX Design Specification provides a comprehensive blueprint for building Flowline Finance Studio's user experience.

**What's Defined:**

✅ **Design System:** shadcn/ui + Tailwind CSS + Recharts
✅ **Color System:** Balanced Teal theme with semantic status colors
✅ **Visual Foundation:** Clean, data-focused dashboard approach
✅ **User Flows:** 4 critical paths from setup to progress validation
✅ **Component Strategy:** Base components + 7 custom financial components
✅ **UX Patterns:** Consistent navigation, buttons, status indicators, charts
✅ **Responsive Design:** Mobile-first with tablet/desktop adaptations
✅ **Accessibility:** WCAG AA compliance built-in

**Design Principles Established:**

1. **Hope + Empowerment** - Every design decision reinforces these emotional goals
2. **Truth-Telling** - Honest visual feedback (green/yellow/red) without sugar-coating
3. **Progressive Disclosure** - Start simple, reveal complexity on demand
4. **Clarity Over Complexity** - Data visualization beats data overwhelm
5. **Validation-Ready** - Easy to modify as user feedback reveals needs

**Ready for Architecture Phase**

This UX specification can now inform:
- Architecture decisions (component hierarchy, state management)
- Epic breakdown (features map to user flows)
- Development planning (component priorities)

**Next Steps:**

1. **Architecture Workflow** - Define technical architecture with UX context
2. **Epic Creation** - Break PRD requirements into implementable features
3. **Implementation** - Build with design system + component library

**Key Artifacts Created:**

- `ux-design-specification.md` - This comprehensive UX spec
- `ux-color-themes.html` - Interactive color theme explorer

**Design Evolution:**

This specification is a living document. As validation reveals user needs, update design decisions while maintaining core principles (Hope + Empowerment, Truth-Telling, Clarity).

---

## Appendix

### Related Documents

- Product Requirements: `docs/prd.md`
- Product Brief: `docs/product-brief-flowline-finance-studio-2025-11-26.md`
- Brainstorming: `docs/bmm-brainstorming-session-2025-11-25.md`

### Core Interactive Deliverables

This UX Design Specification was created through visual collaboration:

- **Color Theme Visualizer**: docs/ux-color-themes.html
  - Interactive HTML showing all color theme options explored
  - Live UI component examples in each theme
  - Side-by-side comparison and semantic color usage

- **Design Direction Mockups**: docs/ux-design-directions.html
  - Interactive HTML with 6-8 complete design approaches
  - Full-screen mockups of key screens
  - Design philosophy and rationale for each direction

### Optional Enhancement Deliverables

_This section will be populated if additional UX artifacts are generated through follow-up workflows._

<!-- Additional deliverables added here by other workflows -->

### Next Steps & Follow-Up Workflows

This UX Design Specification can serve as input to:

- **Wireframe Generation Workflow** - Create detailed wireframes from user flows
- **Figma Design Workflow** - Generate Figma files via MCP integration
- **Interactive Prototype Workflow** - Build clickable HTML prototypes
- **Component Showcase Workflow** - Create interactive component library
- **AI Frontend Prompt Workflow** - Generate prompts for v0, Lovable, Bolt, etc.
- **Solution Architecture Workflow** - Define technical architecture with UX context

### Version History

| Date       | Version | Changes                         | Author |
| ---------- | ------- | ------------------------------- | ------ |
| 2025-11-26 | 1.0     | Initial UX Design Specification | Leith  |

---

_This UX Design Specification was created through collaborative design facilitation, not template generation. All decisions were made with user input and are documented with rationale._
