# Story 2.2: Implement Flexi Facility Management

Status: ready-for-dev

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

- [ ] Task 1: Create Zod validation schema (AC: 1, 2)
  - [ ] Create `src/lib/validation/flexi-facility.ts`
  - [ ] Define flexiFacilitySchema with all fields:
    - name: required string, min 1 char
    - type: required enum ('fnb_flexi', 'standard_bank_access')
    - creditLimit: required string, numeric >= 0
    - currentBalance: required string, numeric (can be negative)
    - interestRate: required string, numeric 0-1 (store as decimal)
  - [ ] Create conversion helpers: `toFormValues()`, `toDbValues()`
  - [ ] Export schema and inferred type
  - [ ] Update `src/lib/validation/index.ts` barrel export
  - [ ] Write tests for validation schema

- [ ] Task 2: Create useFlexiFacility hook (AC: 2, 4, 5, 7, 8)
  - [ ] Create `src/hooks/useFlexiFacility.ts`
  - [ ] Implement `useLiveQuery` for reactive facility from Dexie (first record only)
  - [ ] Implement `saveFacility(data)` function returning `Result<number>`:
    - Check if facility already exists before insert
    - If exists, return error Result
  - [ ] Implement `updateFacility(updates)` function returning `Result<void>`
  - [ ] Implement `deleteFacility()` function returning `Result<void>`
  - [ ] Calculate `availableCredit` using big.js: creditLimit - currentBalance
  - [ ] Add `hasExistingFacility` boolean flag
  - [ ] Add isLoading state
  - [ ] Update `src/hooks/index.ts` barrel export
  - [ ] Write tests for useFlexiFacility hook

- [ ] Task 3: Create FlexiFacilityForm component (AC: 1, 2, 3, 6, 7)
  - [ ] Create `src/components/accounts/FlexiFacilityForm.tsx`
  - [ ] Use React Hook Form with Zod resolver
  - [ ] Implement controlled form with all fields from AC1
  - [ ] Add shadcn/ui Select for facility type dropdown with:
    - "FNB Flexi Option" (value: 'fnb_flexi')
    - "Standard Bank Access Bond" (value: 'standard_bank_access')
  - [ ] Add percentage input handling for interest rate (display %, store decimal)
  - [ ] Support both create and edit modes via optional `facility` prop
  - [ ] Call `toast.success()` on successful save/update
  - [ ] Add proper form validation error display
  - [ ] Write component tests

- [ ] Task 4: Create FlexiFacilityCard component (AC: 5)
  - [ ] Create `src/components/accounts/FlexiFacilityCard.tsx`
  - [ ] Display facility name, type with icon, credit limit (ZAR), current balance (ZAR), available credit (calculated), rate (%)
  - [ ] Add lucide-react icon for facility type (Landmark for bank/flexi)
  - [ ] Show available credit calculation: Credit Limit - Current Balance
  - [ ] If available credit is negative, show in red
  - [ ] Include Edit and Delete action buttons
  - [ ] Use shadcn/ui Card, Badge components
  - [ ] Write component tests

- [ ] Task 5: Create FlexiFacilitySection component (AC: 4, 5, 6, 7, 8)
  - [ ] Create `src/components/accounts/FlexiFacilitySection.tsx`
  - [ ] If no facility exists: Show "Add Flexi Facility" button
  - [ ] If facility exists: Show FlexiFacilityCard
  - [ ] Disable add button when facility exists (show "You can only have one flexi facility")
  - [ ] Implement edit mode: clicking Edit opens FlexiFacilityForm with facility data
  - [ ] Implement delete: clicking Delete opens AlertDialog confirmation
  - [ ] Handle empty state messaging
  - [ ] Use useFlexiFacility hook for data
  - [ ] Write component tests

- [ ] Task 6: Integrate into DataEntryPage (AC: All)
  - [ ] Update `src/pages/DataEntryPage.tsx` to include FlexiFacilitySection
  - [ ] Add section header "Flexi Facility" below Debt Accounts section
  - [ ] Add informational text explaining flexi facility purpose
  - [ ] Style with appropriate spacing and layout
  - [ ] Test full CRUD flow manually

- [ ] Task 7: Run all tests and verify (AC: All)
  - [ ] Create barrel export updates in `src/components/accounts/index.ts`
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify all 8 acceptance criteria are implemented

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

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-01 | Story drafted from tech-spec-epic-2.md with full context from Story 2.1 learnings | SM Agent (Bob) |
