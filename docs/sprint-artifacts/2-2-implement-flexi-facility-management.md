# Story 2.2: Implement Flexi Facility Management

Status: done

## Story

As a **user**,
I want **to add my flexi facility details**,
so that **the system can model velocity banking and flexi strategies**.

## Acceptance Criteria

1. **Given** I navigate to the Data Entry page **When** I click "Add Flexi Facility" **Then** I see a form with fields:
   - Facility name (required, text)
   - Facility type (required, dropdown: FNB Flexi Option, Standard Bank Access Bond)
   - Credit limit (required, ZAR currency input, minimum R0)
   - Current balance/utilization (required, ZAR currency input, can be negative for available credit)
   - Interest rate (required, percentage input 0-100%)

2. **Given** I fill out the form with valid data **When** I click "Save Facility" **Then** the facility is saved to Dexie database with `createdAt` and `updatedAt` timestamps

3. **Given** a successful save **When** the operation completes **Then** I see a success toast "Flexi facility saved"

4. **Given** I already have ONE flexi facility **When** I try to add another **Then** the "Add Flexi Facility" button is disabled and shows "Edit" instead

5. **Given** I have an existing facility **When** I view the flexi facility section **Then** I see a card displaying: name, type, credit limit (ZAR formatted), current balance (ZAR formatted), available credit (calculated: limit - balance), interest rate

6. **Given** I click "Edit" on the facility **When** the edit form opens **Then** the form is populated with existing data

7. **Given** I modify fields in edit mode and click "Save" **When** the save completes **Then** the facility is updated in database and I see success toast "Flexi facility updated"

8. **Given** I click "Delete" on the facility **When** I see the confirmation dialog and confirm **Then** the facility is removed from database and I see success toast "Flexi facility deleted"

## Tasks / Subtasks

- [x] Task 1: Create Zod validation schema (AC: 1, 2)
  - [x] Create `src/lib/validation/flexi-facility.ts`
  - [x] Define flexiFacilitySchema with all fields:
    - name: required string, min 1 char
    - type: required enum ('fnb_flexi', 'standard_bank_access')
    - creditLimit: required string, numeric >= 0
    - currentBalance: required string, numeric (can be negative)
    - interestRate: required string, numeric 0-1 (store as decimal)
  - [x] Create conversion helpers: `formValuesToFlexiFacility()`, `flexiFacilityToFormValues()`
  - [x] Export schema and inferred type
  - [x] Update `src/lib/validation/index.ts` barrel export
  - [x] Write tests for validation schema (32 tests)

- [x] Task 2: Create useFlexiFacility hook (AC: 2, 4, 5, 7, 8)
  - [x] Create `src/hooks/useFlexiFacility.ts`
  - [x] Implement `useLiveQuery` for reactive facility from Dexie (first record only)
  - [x] Implement `saveFacility(data)` function returning `Result<number>`:
    - Check if facility already exists before insert
    - If exists, return error Result
  - [x] Implement `updateFacility(updates)` function returning `Result<void>`
  - [x] Implement `deleteFacility()` function returning `Result<void>`
  - [x] Calculate `availableCredit` using big.js: creditLimit - currentBalance
  - [x] Add `hasExistingFacility` boolean flag
  - [x] Add isLoading state
  - [x] Update `src/hooks/index.ts` barrel export
  - [x] Write tests for useFlexiFacility hook (24 tests)

- [x] Task 3: Create FlexiFacilityForm component (AC: 1, 2, 3, 6, 7)
  - [x] Create `src/components/accounts/FlexiFacilityForm.tsx`
  - [x] Use React Hook Form with Zod resolver
  - [x] Implement controlled form with all fields from AC1
  - [x] Add shadcn/ui Select for facility type dropdown with:
    - "FNB Flexi Option" (value: 'fnb_flexi')
    - "Standard Bank Access Bond" (value: 'standard_bank_access')
  - [x] Add percentage input handling for interest rate (display %, store decimal)
  - [x] Support both create and edit modes via optional `facility` prop
  - [x] Call `toast.success()` on successful save/update
  - [x] Add proper form validation error display
  - [x] Write component tests (19 tests)

- [x] Task 4: Create FlexiFacilityCard component (AC: 5)
  - [x] Create `src/components/accounts/FlexiFacilityCard.tsx`
  - [x] Display facility name, type with icon, credit limit (ZAR), current balance (ZAR), available credit (calculated), rate (%)
  - [x] Add lucide-react icon for facility type (Landmark for bank/flexi)
  - [x] Show available credit calculation: Credit Limit - Current Balance
  - [x] If available credit is negative, show in red
  - [x] Include Edit and Delete action buttons
  - [x] Use shadcn/ui Card, Badge components
  - [x] Write component tests (21 tests)

- [x] Task 5: Create FlexiFacilitySection component (AC: 4, 5, 6, 7, 8)
  - [x] Create `src/components/accounts/FlexiFacilitySection.tsx`
  - [x] If no facility exists: Show "Add Flexi Facility" button
  - [x] If facility exists: Show FlexiFacilityCard
  - [x] Disable add button when facility exists (show "You can only have one flexi facility")
  - [x] Implement edit mode: clicking Edit opens FlexiFacilityForm with facility data
  - [x] Implement delete: clicking Delete opens AlertDialog confirmation
  - [x] Handle empty state messaging
  - [x] Use useFlexiFacility hook for data
  - [x] Write component tests (15 tests)

- [x] Task 6: Integrate into DataEntryPage (AC: All)
  - [x] Update `src/pages/DataEntryPage.tsx` to include FlexiFacilitySection
  - [x] Add section header "Flexi Facility" below Debt Accounts section
  - [x] Add informational text explaining flexi facility purpose
  - [x] Style with appropriate spacing and layout

- [x] Task 7: Run all tests and verify (AC: All)
  - [x] Create barrel export updates in `src/components/accounts/index.ts`
  - [x] Run `npm run test` and ensure all tests pass (317 tests)
  - [x] Run `npm run build` and ensure no type errors
  - [x] Verify all 8 acceptance criteria are implemented

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/
│   ├── FlexiFacilityForm.tsx      # NEW: Flexi facility form
│   ├── FlexiFacilityCard.tsx      # NEW: Flexi facility display
│   ├── FlexiFacilitySection.tsx   # NEW: Container with add/edit logic
│   └── index.ts                   # Update barrel exports
├── hooks/
│   └── useFlexiFacility.ts        # NEW: Flexi facility queries
├── lib/validation/
│   └── flexi-facility.ts          # NEW: Zod schema
```

**ADR-002 (Dexie.js):** All data persisted to IndexedDB via Dexie with `useLiveQuery`
**ADR-003 (big.js):** Monetary calculations use big.js for precision
**ADR-006 (React Hook Form + Zod):** Forms use RHF with Zod validation

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md):

**Data Model (already exists in src/types/flexi-facility.ts):**
```typescript
interface FlexiFacility {
  id?: number;
  name: string;
  type: FlexiFacilityType;  // 'fnb_flexi' | 'standard_bank_access'
  creditLimit: string;       // big.js compatible
  currentBalance: string;    // big.js compatible (can be negative)
  interestRate: string;      // decimal (0.1175 = 11.75%)
  createdAt: string;
  updatedAt: string;
}
```

**Hook Interface:**
```typescript
interface UseFlexiFacilityReturn {
  facility: FlexiFacility | null;
  isLoading: boolean;
  hasExistingFacility: boolean;
  saveFacility: (facility: Omit<FlexiFacility, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Result<number>>;
  updateFacility: (updates: Partial<FlexiFacility>) => Promise<Result<void>>;
  deleteFacility: () => Promise<Result<void>>;
  availableCredit: string;    // creditLimit - currentBalance
}
```

### Single Facility Constraint

**Critical Implementation Note:** Users can only have ONE flexi facility.

```typescript
// In saveFacility:
const saveFacility = async (data) => {
  const existingCount = await db.flexiFacility.count();
  if (existingCount > 0) {
    return err(new Error('Only one flexi facility allowed'));
  }
  // proceed with save
};
```

### Interest Rate Handling

Same pattern as Story 2.1:
- User inputs as percentage (e.g., "11.75")
- Store as decimal (e.g., "0.1175")
- Display as percentage with % symbol

### Available Credit Calculation

```typescript
import Big from 'big.js';

const availableCredit = useMemo(() => {
  if (!facility) return '0';
  const limit = new Big(facility.creditLimit);
  const balance = new Big(facility.currentBalance);
  return limit.minus(balance).toString();
}, [facility]);

// Example:
// Credit Limit: R200,000
// Current Balance: R50,000
// Available Credit: R150,000
//
// Credit Limit: R200,000
// Current Balance: -R25,000 (overpaid)
// Available Credit: R225,000
```

### Project Structure Notes

**Files to Create:**
- `src/lib/validation/flexi-facility.ts`
- `src/hooks/useFlexiFacility.ts`
- `src/components/accounts/FlexiFacilityForm.tsx`
- `src/components/accounts/FlexiFacilityCard.tsx`
- `src/components/accounts/FlexiFacilitySection.tsx`
- `tests/lib/validation/flexi-facility.test.ts`
- `tests/hooks/useFlexiFacility.test.ts`
- `tests/components/accounts/FlexiFacilityForm.test.tsx`
- `tests/components/accounts/FlexiFacilityCard.test.tsx`
- `tests/components/accounts/FlexiFacilitySection.test.tsx`

**Files to Modify:**
- `src/lib/validation/index.ts` - Add flexi-facility export
- `src/hooks/index.ts` - Add useFlexiFacility export
- `src/components/accounts/index.ts` - Add new component exports
- `src/pages/DataEntryPage.tsx` - Add FlexiFacilitySection

### Learnings from Previous Story

**From Story 2.1 (Status: done)**

- **Validation Pattern Ready:** Use same Zod schema structure with `toFormValues()` and `toDbValues()` conversion helpers
- **Currency Formatting Ready:** Use `formatCurrency()` from `@/lib/format/currency` for ZAR display
- **useAccounts Hook Pattern:** Follow same structure for useFlexiFacility - useLiveQuery, CRUD operations, Result types
- **Component Structure:** AccountForm, AccountCard, AccountList pattern can be adapted for Flexi components
- **Toast Pattern:** Use `toast.success('message')` for success, `toast.error('message')` for errors
- **Result Type Ready:** `src/lib/utils/result.ts` with `ok<T>()`, `err<E>()`, `isOk()`, `isErr()`
- **Test Count:** 206 tests passing - maintain test hygiene
- **Interest Rate Pattern:** Store as decimal (0.115), input as percentage (11.5), convert in form

**Reusable from Story 2.1:**
- `formatCurrency()` from `@/lib/format/currency`
- `parseCurrencyInput()` from `@/lib/format/currency`
- `DeleteConfirmDialog` component can be reused
- Test setup patterns with `fake-indexeddb/auto`

[Source: docs/sprint-artifacts/2-1-implement-debt-account-management.md#Completion-Notes-List]

### Testing Approach

**Unit Tests:**
- Zod schema validation (valid/invalid inputs, negative balance allowed)
- Single facility constraint enforcement
- Available credit calculation with big.js

**Component Tests:**
- FlexiFacilityForm: form rendering, validation display, submit handling
- FlexiFacilityCard: data display, available credit calculation display
- FlexiFacilitySection: empty state, populated state, add button disabled when facility exists

**Integration Test Pattern:**
```typescript
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.flexiFacility.clear();
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/architecture.md#ADR-006] - React Hook Form + Zod
- [Source: docs/sprint-artifacts/tech-spec-epic-2.md#Story-2.2] - Detailed acceptance criteria
- [Source: docs/epics.md#Story-2.2] - Original story definition
- [Source: docs/prd.md#FR2] - Flexi facility management requirements

## Dev Agent Record

### Context Reference

- [2-2-implement-flexi-facility-management.context.xml](docs/sprint-artifacts/2-2-implement-flexi-facility-management.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

- **All 8 Acceptance Criteria implemented and tested**
- **111 new tests added** for flexi facility functionality (32 validation + 24 hook + 19 form + 21 card + 15 section)
- **Total project tests: 317 passing**
- **Build successful with no type errors**
- **Single facility constraint enforced** - saveFacility returns error if facility already exists
- **Interest rate pattern maintained** - stored as decimal, displayed as percentage
- **Available credit calculation** - uses big.js for precision, displays negative values in red
- **Reused patterns from Story 2.1** - validation, form, card, and section component patterns

### File List

**Created:**
- `src/lib/validation/flexi-facility.ts` - Zod schema and conversion helpers
- `src/hooks/useFlexiFacility.ts` - Dexie hook with CRUD operations
- `src/components/accounts/FlexiFacilityForm.tsx` - React Hook Form component
- `src/components/accounts/FlexiFacilityCard.tsx` - Display card component
- `src/components/accounts/FlexiFacilitySection.tsx` - Container with empty/populated states
- `tests/lib/validation/flexi-facility.test.ts` - 32 validation tests
- `tests/hooks/useFlexiFacility.test.ts` - 24 hook tests
- `tests/components/accounts/FlexiFacilityForm.test.tsx` - 19 form tests
- `tests/components/accounts/FlexiFacilityCard.test.tsx` - 21 card tests
- `tests/components/accounts/FlexiFacilitySection.test.tsx` - 15 section tests

**Modified:**
- `src/lib/validation/index.ts` - Added flexi-facility exports
- `src/hooks/index.ts` - Added useFlexiFacility export
- `src/components/accounts/index.ts` - Added FlexiFacility* exports
- `src/pages/DataEntryPage.tsx` - Integrated FlexiFacilitySection
- `docs/sprint-artifacts/sprint-status.yaml` - Updated story status

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-01 | Story drafted from tech-spec-epic-2.md with full context from Story 2.1 learnings | SM Agent (Bob) |
| 2025-12-02 | Senior Developer Review notes appended | Dev Agent (Amelia) |

---

## Senior Developer Review (AI)

### Reviewer
Leith

### Date
2025-12-02

### Outcome
**✅ APPROVE**

All 8 acceptance criteria fully implemented and verified. All 7 tasks with subtasks confirmed complete. 317 tests passing. Build successful with no type errors. Code follows established architectural patterns.

### Summary
Story 2.2 "Implement Flexi Facility Management" is production-ready. The implementation correctly enforces the single-facility constraint, handles interest rate conversion (% ↔ decimal), calculates available credit with big.js precision, and provides complete CRUD functionality with appropriate user feedback (toasts, confirmation dialogs).

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**LOW Severity (Advisory):**
| # | Finding | Impact |
|---|---------|--------|
| 1 | Bundle size warning (576KB gzip) | Acceptable for MVP, consider code-splitting post-MVP |
| 2 | MobileNav Radix accessibility warning in tests | Pre-existing issue, not introduced by this story |

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC1 | Form with all fields | ✅ IMPLEMENTED | [FlexiFacilityForm.tsx:83-180](src/components/accounts/FlexiFacilityForm.tsx#L83-L180) |
| AC2 | Save to Dexie with timestamps | ✅ IMPLEMENTED | [useFlexiFacility.ts:64-82](src/hooks/useFlexiFacility.ts#L64-L82) |
| AC3 | Success toast "Flexi facility saved" | ✅ IMPLEMENTED | [FlexiFacilityForm.tsx:72](src/components/accounts/FlexiFacilityForm.tsx#L72) |
| AC4 | Single facility constraint | ✅ IMPLEMENTED | [useFlexiFacility.ts:66-70](src/hooks/useFlexiFacility.ts#L66-L70), [FlexiFacilitySection.tsx:93-102](src/components/accounts/FlexiFacilitySection.tsx#L93-L102) |
| AC5 | Card displays all fields | ✅ IMPLEMENTED | [FlexiFacilityCard.tsx:29-66](src/components/accounts/FlexiFacilityCard.tsx#L29-L66) |
| AC6 | Edit form populated | ✅ IMPLEMENTED | [FlexiFacilityForm.tsx:47-48](src/components/accounts/FlexiFacilityForm.tsx#L47-L48) |
| AC7 | Update with toast | ✅ IMPLEMENTED | [FlexiFacilityForm.tsx:62-64](src/components/accounts/FlexiFacilityForm.tsx#L62-L64) |
| AC8 | Delete with confirmation | ✅ IMPLEMENTED | [FlexiFacilitySection.tsx:135-155](src/components/accounts/FlexiFacilitySection.tsx#L135-L155), [:51](src/components/accounts/FlexiFacilitySection.tsx#L51) |

**Summary: 8 of 8 acceptance criteria fully implemented**

### Task Completion Validation

| Task | Marked As | Verified As | Evidence |
|------|-----------|-------------|----------|
| Task 1: Zod schema | ✅ Complete | ✅ Verified | [flexi-facility.ts](src/lib/validation/flexi-facility.ts) - all fields, conversion helpers, 32 tests |
| Task 2: useFlexiFacility hook | ✅ Complete | ✅ Verified | [useFlexiFacility.ts](src/hooks/useFlexiFacility.ts) - CRUD ops, constraint, big.js calc, 24 tests |
| Task 3: FlexiFacilityForm | ✅ Complete | ✅ Verified | [FlexiFacilityForm.tsx](src/components/accounts/FlexiFacilityForm.tsx) - RHF+Zod, Select, toast, 19 tests |
| Task 4: FlexiFacilityCard | ✅ Complete | ✅ Verified | [FlexiFacilityCard.tsx](src/components/accounts/FlexiFacilityCard.tsx) - display, red negative, 21 tests |
| Task 5: FlexiFacilitySection | ✅ Complete | ✅ Verified | [FlexiFacilitySection.tsx](src/components/accounts/FlexiFacilitySection.tsx) - states, dialog, 15 tests |
| Task 6: DataEntryPage integration | ✅ Complete | ✅ Verified | [DataEntryPage.tsx](src/pages/DataEntryPage.tsx) - section included |
| Task 7: Tests and build | ✅ Complete | ✅ Verified | 317 tests passing, build successful |

**Summary: 7 of 7 tasks verified complete, 0 false completions**

### Test Coverage and Gaps

**Test Distribution:**
- Validation schema: 32 tests (comprehensive edge cases)
- useFlexiFacility hook: 24 tests (CRUD, constraint, calc)
- FlexiFacilityForm: 19 tests (render, validation, submit)
- FlexiFacilityCard: 21 tests (display, formatting, actions)
- FlexiFacilitySection: 15 tests (states, modes, delete flow)

**Coverage Assessment:** Excellent - all critical paths covered including:
- Single facility constraint enforcement
- Negative balance handling (available credit scenario)
- Interest rate conversion both directions
- big.js precision for available credit
- Delete with re-add after deletion

### Architectural Alignment

| ADR | Requirement | Status |
|-----|-------------|--------|
| ADR-002 | Dexie.js with useLiveQuery | ✅ Compliant |
| ADR-003 | big.js for monetary calculations | ✅ Compliant |
| ADR-006 | React Hook Form + Zod | ✅ Compliant |

**Tech-Spec Compliance:** Implementation matches tech-spec-epic-2.md hook interface and data model exactly.

### Security Notes

- ✅ All data stored locally (IndexedDB) - no server transmission
- ✅ Zod validation prevents invalid input before database operations
- ✅ No injection vulnerabilities (typed schema validation)

### Best-Practices and References

- [React Hook Form docs](https://react-hook-form.com/)
- [Zod validation](https://zod.dev/)
- [big.js precision math](https://mikemcl.github.io/big.js/)
- [Dexie.js useLiveQuery](https://dexie.org/docs/dexie-react-hooks/useLiveQuery())

### Action Items

**Code Changes Required:**
_None - story approved_

**Advisory Notes:**
- Note: Consider code-splitting for bundle size optimization post-MVP
- Note: MobileNav accessibility warning is pre-existing and should be addressed in future UX polish story
