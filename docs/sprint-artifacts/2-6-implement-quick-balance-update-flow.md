# Story 2.6: Implement Quick Balance Update Flow

Status: ready-for-dev

## Story

As a **user**,
I want **to quickly update my account balances**,
so that **I can complete weekly updates in under 10 minutes**.

## Acceptance Criteria

1. **Given** I have existing accounts **When** I click "Update Balances" **Then** I see a streamlined view with:
   - List of all accounts with current balance displayed
   - Inline edit field for each balance (no modal/popup needed)
   - Current balance pre-filled
   - Auto-save when I click away or press Enter

2. **Given** I update a balance **When** I change the value and move to next field **Then** the new balance is saved immediately (auto-save) **And** I see a brief "Saved" indicator next to the field

3. **Given** I update all balances **When** I'm done **Then** I can see timestamp of "Last updated: [date/time]" **And** total debt reflects new balances

4. **Given** I have a flexi facility **When** I view the quick update view **Then** I can also update the flexi facility current balance inline

5. **Given** I enter an invalid balance (negative number, non-numeric) **When** I try to save **Then** the field shows validation error and does not save

6. **Given** I make no changes to a field **When** I click away **Then** no save operation is triggered (debounce prevents unnecessary writes)

## Tasks / Subtasks

- [ ] Task 1: Create QuickBalanceUpdate component (AC: 1, 4)
  - [ ] Create `src/components/accounts/QuickBalanceUpdate.tsx`
  - [ ] Import useAccounts and useFlexiFacility hooks for data
  - [ ] Display list of all debt accounts with name, type icon, and current balance
  - [ ] Display flexi facility (if exists) with name and current balance
  - [ ] Each balance displayed in an inline editable Input field
  - [ ] Current balance pre-filled in each field
  - [ ] Use shadcn/ui Card as container for the update view
  - [ ] Use shadcn/ui Input for balance fields with ZAR formatting

- [ ] Task 2: Implement inline balance editing with auto-save (AC: 1, 2, 6)
  - [ ] Create local state for each balance field value
  - [ ] Implement onBlur handler that triggers save if value changed
  - [ ] Implement onKeyDown handler for Enter key to trigger save
  - [ ] Use debounce (500ms) to prevent excessive database writes
  - [ ] Only trigger save if new value differs from original value
  - [ ] Track which field is currently being edited for focus management

- [ ] Task 3: Create useDebouncedSave hook (AC: 2, 6)
  - [ ] Create `src/hooks/useDebouncedSave.ts`
  - [ ] Accept callback function and delay (default 500ms)
  - [ ] Return debounced save function
  - [ ] Cancel pending saves on unmount
  - [ ] Export from `src/hooks/index.ts`

- [ ] Task 4: Implement save indicator feedback (AC: 2)
  - [ ] Create `src/components/accounts/BalanceUpdateRow.tsx` sub-component
  - [ ] Props: account (or flexi), onSave callback, showSavedIndicator
  - [ ] Display "Saving..." during save operation
  - [ ] Display "Saved" checkmark for 2 seconds after successful save
  - [ ] Handle error state with red indicator
  - [ ] Use lucide-react icons: Check (saved), Loader2 (saving), AlertCircle (error)

- [ ] Task 5: Implement balance validation (AC: 5)
  - [ ] Create validation function: balance must be >= 0 and numeric
  - [ ] Display inline validation error below field if invalid
  - [ ] Prevent save operation for invalid values
  - [ ] Clear error when user corrects the value
  - [ ] Use Zod schema consistent with existing account validation

- [ ] Task 6: Implement last updated timestamp (AC: 3)
  - [ ] Add `lastUpdated?: string` field to DebtAccount and FlexiFacility types if not present
  - [ ] Update account/flexi record with ISO timestamp on save
  - [ ] Display "Last updated: [date/time]" for each account row
  - [ ] Format timestamp using date-fns and SA date format (DD/MM/YYYY HH:mm)
  - [ ] Show "Never updated" if lastUpdated is null/undefined

- [ ] Task 7: Update account save functions (AC: 2, 3)
  - [ ] Modify useAccounts hook to expose `updateAccountBalance(id, balance)` function
  - [ ] Function updates only balance and lastUpdated fields (not full record)
  - [ ] Modify useFlexiFacility hook to expose `updateFlexiBalance(id, balance)` function
  - [ ] Ensure reactive updates via Dexie useLiveQuery

- [ ] Task 8: Integrate into DataEntryPage (AC: All)
  - [ ] Add "Update Balances" button to DataEntryPage header
  - [ ] Toggle between normal view and QuickBalanceUpdate view
  - [ ] Or: Create as collapsible section at top of DataEntryPage
  - [ ] Show FinancialSnapshot alongside for real-time total debt updates
  - [ ] Ensure total debt in snapshot updates reactively as balances are saved

- [ ] Task 9: Write tests and verify (AC: All)
  - [ ] Write unit tests for useDebouncedSave hook
  - [ ] Write component tests for QuickBalanceUpdate
  - [ ] Write component tests for BalanceUpdateRow
  - [ ] Test validation error display and prevention
  - [ ] Test save indicator state transitions
  - [ ] Test debounce behavior (no save if unchanged)
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/accounts/
│   ├── QuickBalanceUpdate.tsx     # NEW: Streamlined balance update view
│   ├── BalanceUpdateRow.tsx       # NEW: Individual row with inline edit
│   └── index.ts                   # Update barrel exports
├── hooks/
│   └── useDebouncedSave.ts        # NEW: Debounced save utility
```

**ADR-002 (Dexie.js):** Partial updates via `db.accounts.update(id, { balance, lastUpdated })`
**ADR-003 (big.js):** Validate and store balance as string for precision
**NFR-U1:** Data entry efficiency - 10-minute weekly updates target

### Tech Spec Alignment

From [tech-spec-epic-2.md](./tech-spec-epic-2.md) and [epics.md](../epics.md):

**FR5 Requirement:** "User can update account balances manually on weekly or monthly basis"
**FR51 Requirement:** "User can complete weekly data update in under 10 minutes"

**Inline Editing Pattern:**
```typescript
// BalanceUpdateRow component
interface BalanceUpdateRowProps {
  id: number;
  name: string;
  type: string;
  currentBalance: string;
  lastUpdated?: string;
  onSave: (id: number, newBalance: string) => Promise<void>;
}

// State management
const [editValue, setEditValue] = useState(currentBalance);
const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
const [error, setError] = useState<string | null>(null);

// Blur handler
const handleBlur = async () => {
  if (editValue === currentBalance) return; // No change
  if (!isValidBalance(editValue)) {
    setError('Balance must be a positive number');
    return;
  }
  setStatus('saving');
  try {
    await onSave(id, editValue);
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2000);
  } catch (e) {
    setStatus('error');
  }
};
```

### Debounce Pattern

```typescript
// src/hooks/useDebouncedSave.ts
import { useCallback, useRef, useEffect } from 'react';

export function useDebouncedSave<T>(
  saveFunction: (value: T) => Promise<void>,
  delay: number = 500
) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = useRef<T | null>(null);

  const debouncedSave = useCallback((value: T) => {
    pendingValueRef.current = value;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(async () => {
      if (pendingValueRef.current !== null) {
        await saveFunction(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }, delay);
  }, [saveFunction, delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedSave;
}
```

### Partial Update Functions

```typescript
// In useAccounts hook - add this function
const updateAccountBalance = useCallback(async (id: number, balance: string) => {
  const now = new Date().toISOString();
  await db.accounts.update(id, {
    balance,
    lastUpdated: now
  });
}, []);

// In useFlexiFacility hook - add this function
const updateFlexiBalance = useCallback(async (id: number, balance: string) => {
  const now = new Date().toISOString();
  await db.flexiFacility.update(id, {
    currentBalance: balance,
    lastUpdated: now
  });
}, []);
```

### Visual Design (from UX Spec)

From [ux-design-specification.md](../ux-design-specification.md):

**Quick Update UI:**
- Card-based container with teal header (#0d9488)
- Each account row shows: Type icon | Account Name | Balance Input | Status | Last Updated
- Inline editing with focus highlight (teal ring)
- Status indicators: Saving (spinner), Saved (green check), Error (red alert)

**Save Feedback:**
- "Saved" indicator: green-500 text with Check icon, fades after 2s
- "Saving..." indicator: slate-400 text with Loader2 spinning icon
- Error indicator: red-500 text with AlertCircle icon

**Timestamp Format:**
- Use date-fns `format(date, 'dd/MM/yyyy HH:mm')` for SA format
- Display as muted text (slate-400)

### Project Structure Notes

**Files to Create:**
- `src/components/accounts/QuickBalanceUpdate.tsx`
- `src/components/accounts/BalanceUpdateRow.tsx`
- `src/hooks/useDebouncedSave.ts`
- `tests/components/accounts/QuickBalanceUpdate.test.tsx`
- `tests/components/accounts/BalanceUpdateRow.test.tsx`
- `tests/hooks/useDebouncedSave.test.ts`

**Files to Modify:**
- `src/hooks/useAccounts.ts` - Add updateAccountBalance function
- `src/hooks/useFlexiFacility.ts` - Add updateFlexiBalance function
- `src/hooks/index.ts` - Export useDebouncedSave
- `src/components/accounts/index.ts` - Export new components
- `src/pages/DataEntryPage.tsx` - Add Update Balances button/section
- `src/types/account.ts` - Add lastUpdated field if not present
- `src/types/flexi-facility.ts` - Add lastUpdated field if not present

### Learnings from Previous Story

**From Story 2.5 (Status: done)**

- **586 tests passing** - maintain test hygiene
- **FinancialSnapshot component exists** - shows total debt reactively
- **useAccounts, useFlexiFacility hooks** - already have data queries via useLiveQuery
- **formatCurrency()** available from `@/lib/format/currency` for ZAR display
- **big.js pattern established** - use for balance validation and comparison
- **Bundle size: ~601KB** - monitor for Epic 3+ (warning threshold 500KB)
- **Component patterns** - Card-based layouts with teal header accent

**Reusable from Previous Stories:**
- `formatCurrency()` from `@/lib/format/currency`
- `formatDate()` from `@/lib/format/date` (for timestamp display)
- `useAccounts`, `useFlexiFacility` hooks
- shadcn/ui Card, Input, Button components
- lucide-react icons (Check, Loader2, AlertCircle, Wallet, CreditCard, etc.)
- Toast notifications for error feedback

**New Services/Patterns to Create:**
- `useDebouncedSave` hook - reusable for future inline editing scenarios
- `updateAccountBalance` / `updateFlexiBalance` partial update functions
- Inline edit with status indicator pattern (BalanceUpdateRow)

[Source: docs/sprint-artifacts/2-5-implement-financial-snapshot-view.md#Completion-Notes-List]

### Testing Approach

**Unit Tests:**
- useDebouncedSave: debounce timing, cleanup on unmount, callback invocation
- Balance validation: positive numbers only, numeric only, edge cases

**Component Tests:**
- QuickBalanceUpdate: renders all accounts and flexi, displays balances
- BalanceUpdateRow: edit mode, save on blur, save on Enter, status transitions
- Validation error display
- "No change" detection (doesn't save if value unchanged)

**Integration Test Pattern:**
```typescript
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import 'fake-indexeddb/auto';
import { db } from '@/lib/db';

beforeEach(async () => {
  await db.accounts.clear();
  await db.flexiFacility.clear();
});

test('updates balance on blur and shows saved indicator', async () => {
  // Seed data
  await db.accounts.add({
    name: 'Home Loan',
    balance: '500000',
    // ... other fields
  });

  render(<QuickBalanceUpdate />);

  const input = screen.getByDisplayValue('500000');
  await userEvent.clear(input);
  await userEvent.type(input, '495000');
  fireEvent.blur(input);

  await waitFor(() => {
    expect(screen.getByText('Saved')).toBeInTheDocument();
  });

  // Verify database update
  const updated = await db.accounts.get(1);
  expect(updated?.balance).toBe('495000');
  expect(updated?.lastUpdated).toBeDefined();
});
```

### References

- [Source: docs/architecture.md#Project-Structure] - Component organization
- [Source: docs/architecture.md#ADR-002] - Dexie.js for data persistence
- [Source: docs/architecture.md#ADR-003] - big.js for financial precision
- [Source: docs/epics.md#Story-2.6] - Original story definition with ACs
- [Source: docs/prd.md#FR5] - Manual balance update requirement
- [Source: docs/prd.md#FR51] - 10-minute weekly update requirement
- [Source: docs/ux-design-specification.md#Data-Entry-Patterns] - Inline editing pattern

## Dev Agent Record

### Context Reference

- [Story Context XML](./2-6-implement-quick-balance-update-flow.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-03 | Story drafted with full context from Story 2.5 learnings, PRD, Architecture, and UX Spec | SM Agent (Bob) |
| 2025-12-03 | Story context XML generated, status updated to ready-for-dev | SM Agent (Bob) |
