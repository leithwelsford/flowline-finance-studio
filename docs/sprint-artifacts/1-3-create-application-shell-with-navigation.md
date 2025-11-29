# Story 1.3: Create Application Shell with Navigation

Status: review

## Story

As a **user**,
I want **to navigate between the main sections of the application**,
so that **I can access different features easily**.

## Acceptance Criteria

1. **Given** I open the application **When** the app loads **Then** I see a navigation header with tabs: Dashboard | Data Entry | Compare | Track

2. **Given** the navigation is displayed **When** I view the header **Then** I see the app title "Flowline Finance Studio" with the logo

3. **Given** I click the "Dashboard" tab **When** navigation completes **Then** the Dashboard page placeholder is displayed

4. **Given** I click the "Data Entry" tab **When** navigation completes **Then** the Data Entry page placeholder is displayed

5. **Given** I click the "Compare" tab **When** navigation completes **Then** the Compare page placeholder is displayed

6. **Given** I click the "Track" tab **When** navigation completes **Then** the Track page placeholder is displayed

7. **Given** I am on any page **When** I view the navigation **Then** the current page tab has a teal underline indicator (#0d9488)

8. **Given** I am viewing on mobile (< 640px width) **When** I view the navigation **Then** the navigation collapses to a hamburger menu

9. **Given** I am on mobile and click the hamburger menu **When** the menu opens **Then** I see a drawer (Sheet component) with all navigation options listed vertically

10. **Given** I click a navigation item in the mobile drawer **When** navigation completes **Then** the drawer closes automatically and the selected page is displayed

11. **Given** I resize the browser **When** the width crosses the 640px breakpoint **Then** the layout adapts responsively (tabs on desktop, hamburger on mobile)

12. **Given** the pages are created **When** I view each placeholder page **Then** each page shows a centered heading with the page name (e.g., "Dashboard", "Data Entry", "Compare", "Track")

## Tasks / Subtasks

- [x] Task 1: Create layout components (AC: 1, 2, 8, 9, 10, 11)
  - [x] Create `src/components/layout/Header.tsx` with app title/logo
  - [x] Create `src/components/layout/Navigation.tsx` with desktop tab navigation
  - [x] Add shadcn/ui Tabs component for desktop navigation
  - [x] Add teal underline indicator for active tab (teal-600 #0d9488)
  - [x] Create `src/components/layout/MobileNav.tsx` with hamburger menu
  - [x] Add shadcn/ui Sheet component for mobile drawer
  - [x] Implement responsive breakpoint logic (show tabs > 640px, hamburger < 640px)
  - [x] Create `src/components/layout/PageContainer.tsx` wrapper component
  - [x] Create `src/components/layout/index.ts` barrel exports

- [x] Task 2: Create page placeholder components (AC: 3, 4, 5, 6, 12)
  - [x] Create `src/pages/DashboardPage.tsx` with centered "Dashboard" heading
  - [x] Create `src/pages/DataEntryPage.tsx` with centered "Data Entry" heading
  - [x] Create `src/pages/ComparePage.tsx` with centered "Compare" heading
  - [x] Create `src/pages/TrackPage.tsx` with centered "Track" heading
  - [x] Create `src/pages/index.ts` barrel exports

- [x] Task 3: Implement navigation state and routing (AC: 7)
  - [x] Add `currentPage` state to App.tsx: 'dashboard' | 'data-entry' | 'compare' | 'track'
  - [x] Implement conditional rendering based on currentPage state
  - [x] Pass setCurrentPage handler to Navigation components
  - [x] Ensure mobile drawer closes on navigation (controlled state)

- [x] Task 4: Update App.tsx with application shell (AC: 1, 2, 3, 4, 5, 6, 7)
  - [x] Import and compose Header, Navigation, and PageContainer components
  - [x] Render correct page based on currentPage state
  - [x] Set Dashboard as default page on app load
  - [x] Apply Tailwind responsive classes for layout

- [x] Task 5: Write tests for navigation functionality (AC: All)
  - [x] Create `tests/components/layout/Navigation.test.tsx`
  - [x] Test that all four tabs are rendered on desktop
  - [x] Test that clicking tabs changes the active indicator
  - [x] Test mobile hamburger menu interaction
  - [x] Test responsive breakpoint behavior (mock resize)
  - [x] Verify all tests pass with `npm run test`

## Dev Notes

### Architecture Alignment

From Architecture doc Section "Project Structure":
```
src/
  ├── components/
  │   ├── layout/                 # App shell components
  │   │   ├── Header.tsx
  │   │   ├── Navigation.tsx
  │   │   └── PageContainer.tsx
  │
  ├── pages/                      # Page-level components
  │   ├── DashboardPage.tsx       # FR42: Primary landing page
  │   ├── DataEntryPage.tsx       # FR1-8: Account management
  │   ├── ComparePage.tsx         # FR24-31: Strategy comparison
  │   └── TrackPage.tsx           # FR32-38: Progress tracking
```

### UX Design Compliance

From UX Design Specification Section 7.1 "Consistency Rules":
- **Top-level tabs:** Dashboard | Data Entry | Compare | Track
- **Mobile:** Hamburger menu with same structure
- **Current page:** Teal underline indicator

From Section 8.1 "Responsive Strategy":
- **Breakpoints:** Mobile < 640px, Tablet 640-1024px, Desktop > 1024px
- **Mobile:** Navigation becomes hamburger menu

### Visual Theme

From UX Design Specification Section 3.1 "Color System":
- **Primary:** `teal-600` (#0d9488) - Main brand color, active tab indicator
- **Primary Dark:** `teal-700` (#0f766e) - Hover states
- **Text Primary:** `slate-900` (#0f172a) - Header text
- **Background:** `slate-50` (#f8fafc) - Page background
- **Surface:** `white` (#ffffff) - Header/card backgrounds
- **Border:** `slate-200` (#e2e8f0) - Dividers

### shadcn/ui Components Needed

From UX Design Specification Section 6.1:
- `Tabs` - Navigation between sections (Dashboard, Data Entry, Compare, Track)
- `Sheet` - Mobile navigation drawer

To add missing components:
```bash
npx shadcn@latest add tabs
npx shadcn@latest add sheet
```

### Project Structure Notes

Files to create:
- `src/components/layout/Header.tsx`
- `src/components/layout/Navigation.tsx`
- `src/components/layout/MobileNav.tsx`
- `src/components/layout/PageContainer.tsx`
- `src/components/layout/index.ts`
- `src/pages/DashboardPage.tsx`
- `src/pages/DataEntryPage.tsx`
- `src/pages/ComparePage.tsx`
- `src/pages/TrackPage.tsx`
- `src/pages/index.ts`

Files to modify:
- `src/App.tsx` - Replace placeholder with application shell

### Learnings from Previous Story

**From Story 1-2 (Status: done)**

- All TypeScript types available in `src/types/` via barrel exports
- Dexie database configured at `src/lib/db/`
- Path alias `@/` configured - use for all imports
- Test setup at `tests/setup.ts` with Vitest configured
- 36 tests passing - maintain test hygiene
- fake-indexeddb added for testing database operations

**New Services Created:** None (data layer story)

**Architectural Patterns:**
- Use barrel exports (`index.ts`) for clean imports
- Store all monetary values as strings for big.js precision
- Store all dates as ISO strings

### Implementation Notes

1. **No Router Library Needed:** Per Architecture doc, use simple conditional rendering in App.tsx - no react-router required for MVP.

2. **State Location:** Keep currentPage state in App.tsx for simplicity. Story 1.4 will move this to Zustand store.

3. **Responsive Detection:** Use Tailwind's responsive prefixes (`sm:`, `md:`, `lg:`) for CSS-based responsive behavior. For JS-based detection (hamburger toggle), use window.matchMedia or a simple resize listener.

4. **Mobile-First:** Write mobile styles first, then add responsive modifiers for larger screens.

### Testing Approach

Use Vitest with React Testing Library:
```typescript
// tests/components/layout/Navigation.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Navigation } from '@/components/layout';

describe('Navigation', () => {
  it('renders all four navigation tabs', () => {
    render(<Navigation currentPage="dashboard" onNavigate={() => {}} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Data Entry')).toBeInTheDocument();
    expect(screen.getByText('Compare')).toBeInTheDocument();
    expect(screen.getByText('Track')).toBeInTheDocument();
  });
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - File organization
- [Source: docs/architecture.md#FR-Category-to-Architecture-Mapping] - Page routing
- [Source: docs/ux-design-specification.md#7.1-Consistency-Rules] - Navigation patterns
- [Source: docs/ux-design-specification.md#8.1-Responsive-Strategy] - Breakpoints
- [Source: docs/ux-design-specification.md#3.1-Color-System] - Balanced Teal theme
- [Source: docs/epics.md#Story-1.3] - Acceptance criteria and story details
- [Source: docs/prd.md#FR53] - Section navigation requirement
- [Source: docs/prd.md#FR49] - Web browser access requirement
- [Source: docs/prd.md#FR50] - Responsive design requirement

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-3-create-application-shell-with-navigation.context.xml](docs/sprint-artifacts/1-3-create-application-shell-with-navigation.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Used custom button-based navigation instead of radix Tabs to achieve teal underline styling per UX spec
- Sheet component installed via shadcn for mobile drawer
- Responsive breakpoint at 640px using Tailwind sm: prefix

### Completion Notes List

- All 12 ACs implemented and tested
- 69 tests passing (33 new tests for this story)
- Build passes with no TypeScript errors
- Mobile drawer auto-closes on navigation
- Teal-600 underline indicator for active tab

### File List

**Created:**
- src/components/layout/Header.tsx
- src/components/layout/Navigation.tsx
- src/components/layout/MobileNav.tsx
- src/components/layout/PageContainer.tsx
- src/components/layout/index.ts
- src/components/ui/sheet.tsx
- src/pages/DashboardPage.tsx
- src/pages/DataEntryPage.tsx
- src/pages/ComparePage.tsx
- src/pages/TrackPage.tsx
- src/pages/index.ts
- tests/components/layout/Header.test.tsx
- tests/components/layout/Navigation.test.tsx
- tests/components/layout/MobileNav.test.tsx
- tests/components/layout/PageContainer.test.tsx
- tests/pages/pages.test.tsx
- tests/App.test.tsx

**Modified:**
- src/App.tsx

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-29 | Story drafted from epics.md with full context | SM Agent (Bob) |
| 2025-11-29 | Story context generated, marked ready-for-dev | SM Agent (Bob) |
| 2025-11-29 | Implementation complete, all tasks done, 69 tests passing, marked for review | Dev Agent (Amelia) |
