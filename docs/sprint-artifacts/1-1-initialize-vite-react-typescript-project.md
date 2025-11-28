# Story 1.1: Initialize Vite + React + TypeScript Project

Status: review

## Story

As a **developer**,
I want **a properly configured Vite + React + TypeScript project with all core dependencies**,
so that **I have a solid foundation for building the application**.

## Acceptance Criteria

1. **Given** a fresh development environment **When** I run the project initialization commands **Then** Vite + React + TypeScript template is initialized successfully
2. **Given** the project is initialized **When** I check the configuration **Then** Tailwind CSS is configured with custom teal theme colors (primary: teal-600 #0d9488)
3. **Given** Tailwind is configured **When** I initialize shadcn/ui **Then** default components are installed (Button, Card, Input, Form, Table, Toast, Tabs)
4. **Given** the project structure exists **When** I check tsconfig.json **Then** path alias `@/` is configured for clean imports
5. **Given** the project is initialized **When** I check code quality tools **Then** ESLint + Prettier are configured and working
6. **Given** the project is ready **When** I check package.json **Then** all dependencies from Architecture doc are installed:
   - recharts, dexie, dexie-react-hooks, zustand, big.js, date-fns
   - react-hook-form, zod, @hookform/resolvers
   - vitest, @testing-library/react, @testing-library/jest-dom
7. **Given** all dependencies are installed **When** I run `npm run dev` **Then** development server starts successfully
8. **Given** all dependencies are installed **When** I run `npm run build` **Then** production bundle is generated without errors
9. **Given** Vitest is configured **When** I run `npm run test` **Then** tests run with placeholder test passing

## Tasks / Subtasks

- [x] Task 1: Create Vite + React + TypeScript project (AC: 1)
  - [x] Run `npm create vite@latest flowline-finance-studio -- --template react-ts`
  - [x] Navigate into project directory
  - [x] Run `npm install` to install base dependencies
  - [x] Verify `npm run dev` starts successfully

- [x] Task 2: Configure Tailwind CSS with custom theme (AC: 2)
  - [x] Initialize Tailwind CSS via shadcn/ui init or direct install
  - [x] Configure tailwind.config.ts with Balanced Teal theme colors
  - [x] Set primary color to teal-600 (#0d9488)
  - [x] Configure semantic colors (green-500 success, red-500 error, amber-500 warning)

- [x] Task 3: Initialize shadcn/ui components (AC: 3)
  - [x] Run `npx shadcn@latest init`
  - [x] Select TypeScript, Balanced Teal theme, CSS variables
  - [x] Install required components: Button, Card, Input, Form, Table, Toast, Tabs
  - [x] Verify components are accessible in `src/components/ui/`

- [x] Task 4: Configure path aliases (AC: 4)
  - [x] Update tsconfig.json with `@/*` path mapping to `./src/*`
  - [x] Update vite.config.ts with resolve.alias configuration
  - [x] Verify imports work with `@/` prefix

- [x] Task 5: Set up ESLint + Prettier (AC: 5)
  - [x] Configure ESLint with TypeScript and React rules
  - [x] Install and configure Prettier
  - [x] Create .eslintrc.cjs and .prettierrc configuration files
  - [x] Add lint scripts to package.json
  - [x] Verify `npm run lint` works

- [x] Task 6: Install core dependencies (AC: 6)
  - [x] Install production dependencies: `npm install recharts dexie dexie-react-hooks zustand big.js date-fns react-hook-form zod @hookform/resolvers`
  - [x] Install dev dependencies: `npm install -D @types/big.js vitest @testing-library/react @testing-library/jest-dom`
  - [x] Verify all packages in package.json

- [x] Task 7: Configure Vitest for testing (AC: 9)
  - [x] Create vite.config.ts test configuration
  - [x] Create `tests/setup.ts` with Testing Library setup
  - [x] Create placeholder test file that passes
  - [x] Add test script to package.json
  - [x] Verify `npm run test` passes

- [x] Task 8: Set up folder structure (AC: 1, 6, 7, 8)
  - [x] Create folder structure per Architecture doc:
    - src/components/ui/
    - src/components/layout/
    - src/components/dashboard/
    - src/components/accounts/
    - src/components/strategies/
    - src/components/charts/
    - src/components/tracking/
    - src/pages/
    - src/lib/db/
    - src/lib/calculations/
    - src/lib/format/
    - src/lib/validation/
    - src/lib/utils/
    - src/hooks/
    - src/store/
    - src/types/
    - tests/
  - [x] Create placeholder files to preserve structure

- [x] Task 9: Verify build commands (AC: 7, 8)
  - [x] Run `npm run dev` and verify server starts
  - [x] Run `npm run build` and verify build completes
  - [x] Run `npm run preview` and verify production build works

## Dev Notes

### Architecture Alignment

This story implements the technical foundation specified in the Architecture document Section "Project Initialization". All technology decisions are pre-made:

| Technology | Version | Purpose |
|------------|---------|---------|
| Vite | Latest | Build tooling, fast HMR |
| React | 19 | UI framework |
| TypeScript | Latest | Type safety |
| Tailwind CSS | Latest | Utility-first styling |
| shadcn/ui | Latest | Accessible UI components |

### Key Configuration Details

**Tailwind Theme (from UX Spec):**
- Primary: teal-600 (#0d9488)
- Semantic: green-500 (success), red-500 (error), amber-500 (warning)

**Path Alias:**
```json
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**Vitest Configuration:**
```typescript
// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
  },
})
```

### Project Structure Notes

The folder structure follows Architecture doc Section "Project Structure":
- `src/components/ui/` - shadcn/ui auto-generated components
- `src/lib/` - Core business logic (framework-agnostic)
- `src/hooks/` - Custom React hooks
- `src/store/` - Zustand stores
- `src/types/` - Global TypeScript types

### Testing Standards

- Use Vitest with React Testing Library
- Test file naming: `*.test.ts` or `*.test.tsx`
- Setup file at `tests/setup.ts` imports Testing Library matchers

### References

- [Source: docs/architecture.md#Project-Initialization] - Initialization commands
- [Source: docs/architecture.md#Project-Structure] - Folder structure
- [Source: docs/architecture.md#Decision-Summary] - Technology decisions
- [Source: docs/prd.md#Web-Application-Specific-Requirements] - Technology preferences
- [Source: docs/epics.md#Story-1.1] - Acceptance criteria

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-1-initialize-vite-react-typescript-project.context.xml](docs/sprint-artifacts/1-1-initialize-vite-react-typescript-project.context.xml)

### Agent Model Used

Claude Opus 4.5 (claude-opus-4-5-20251101)

### Debug Log References

- Task 1: Created Vite project manually due to interactive prompt limitations
- Task 9: Downgraded from Tailwind v4 to v3 for shadcn/ui compatibility

### Completion Notes List

- All 9 tasks completed successfully
- All 9 acceptance criteria satisfied
- Production build: 193KB JS, 17KB CSS (gzipped: 61KB JS, 4KB CSS)
- Dev server starts in ~172ms
- Tests pass: 1 test in 518ms

### File List

**New Files:**
- index.html
- package.json
- package-lock.json
- tsconfig.json
- vite.config.ts
- tailwind.config.ts
- postcss.config.js
- components.json
- eslint.config.js
- .prettierrc
- public/vite.svg
- src/main.tsx
- src/App.tsx
- src/index.css
- src/vite-env.d.ts
- src/lib/utils.ts
- src/components/ui/button.tsx
- src/components/ui/card.tsx
- src/components/ui/input.tsx
- src/components/ui/label.tsx
- src/components/ui/table.tsx
- src/components/ui/tabs.tsx
- src/components/ui/toast.tsx
- src/components/ui/form.tsx
- src/types/index.ts
- src/store/index.ts
- tests/setup.ts
- tests/placeholder.test.ts
- .gitkeep files for empty directories

**Modified Files:**
- docs/sprint-artifacts/sprint-status.yaml (status: in-progress → review)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Story drafted from epics.md | SM Agent (Bob) |
| 2025-11-28 | Story implementation complete, all ACs satisfied | Dev Agent (Amelia) |
