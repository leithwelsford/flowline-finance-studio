# Story 6.1: Implement Balance Logging

Status: ready-for-dev

## Story

As a **user**,
I want **to log my actual account balances over time**,
so that **I can track real progress against my chosen strategy projections**.

## Acceptance Criteria

1. **AC-6.1.1:** Given I have accounts and a selected strategy, when I navigate to the Track page, then I see a "Log Balances" section with a date selector that defaults to today.

2. **AC-6.1.2:** Given I'm on the Track page, when I view the Log Balances section, then I see a list of all my debt accounts with current balance input fields pre-populated with their last known balances.

3. **AC-6.1.3:** Given I'm on the Track page, when I view the Log Balances section, then I see my flexi facility (if exists) with a balance input field.

4. **AC-6.1.4:** Given I have entered balances, when I click "Save Snapshot", then a BalanceSnapshot record is created in Dexie for each account with the selected date.

5. **AC-6.1.5:** Given I save a snapshot, when the save completes, then a success toast confirms "Balances logged for [date]" with SA date format (DD/MM/YYYY).

6. **AC-6.1.6:** Given I want to document variances, when I'm logging balances, then I can add an optional notes field explaining variances (e.g., "Unexpected car repair").

7. **AC-6.1.7:** Given I enter an invalid balance (negative number), when I try to save, then validation prevents save and shows error message.

8. **AC-6.1.8:** Given I have previously logged snapshots, when I navigate to the Track page, then I can see a list of recent snapshots with dates and total debt amounts.

9. **AC-6.1.9:** Given I want to edit a snapshot, when I click on a recent snapshot, then I can modify the balances or notes and save the update.

10. **AC-6.1.10:** Given I want to delete a snapshot, when I click delete on a snapshot, then a confirmation dialog appears, and upon confirmation the snapshot is removed.

## Tasks / Subtasks

- [ ] Task 1: Create BalanceLogger component structure (AC: 1, 2, 3)
  - [ ] Create `src/components/tracking/BalanceLogger.tsx`
  - [ ] Define props interface for date, accounts, onSave callback
  - [ ] Create `src/components/tracking/index.ts` barrel export
  - [ ] Add import to TrackPage

- [ ] Task 2: Implement date selector with today default (AC: 1)
  - [ ] Use shadcn/ui DatePicker or Calendar component
  - [ ] Default to current date using date-fns
  - [ ] Format display in SA format (DD/MM/YYYY)
  - [ ] Allow selecting past dates for backdated entry

- [ ] Task 3: Implement account balance input list (AC: 2, 3)
  - [ ] Query all accounts using useAccounts hook
  - [ ] Query flexi facility using useFlexiFacility hook
  - [ ] Display account name, type, and current balance
  - [ ] Pre-populate with last known balance from account record
  - [ ] Use shadcn/ui Input with ZAR currency formatting
  - [ ] Handle flexi facility as separate section

- [ ] Task 4: Implement notes field for variance explanation (AC: 6)
  - [ ] Add optional Textarea field for notes
  - [ ] Placeholder text: "Explain any variance (e.g., unexpected car repair)"
  - [ ] Character limit: 500 characters
  - [ ] Notes apply to entire snapshot, not per-account

- [ ] Task 5: Implement save snapshot functionality (AC: 4, 5)
  - [ ] Create `src/hooks/useProgress.ts` with logBalances function
  - [ ] Use Dexie transaction to save all BalanceSnapshot records atomically
  - [ ] Each record: id, accountId, date (ISO string), balance (string for big.js), notes, createdAt
  - [ ] Show success toast with SA-formatted date
  - [ ] Handle save errors with error toast

- [ ] Task 6: Implement balance validation (AC: 7)
  - [ ] Create Zod schema for balance input (non-negative number)
  - [ ] Show inline validation error for negative values
  - [ ] Disable Save button until all balances are valid
  - [ ] Use React Hook Form for form state management

- [ ] Task 7: Create recent snapshots list component (AC: 8)
  - [ ] Create `src/components/tracking/SnapshotList.tsx`
  - [ ] Query recent snapshots using useLiveQuery
  - [ ] Group by date, show total debt per snapshot
  - [ ] Display most recent 5-10 snapshots
  - [ ] Format dates in SA format

- [ ] Task 8: Implement snapshot edit functionality (AC: 9)
  - [ ] Click on snapshot opens edit mode
  - [ ] Load existing balances and notes into form
  - [ ] Save updates existing records (upsert by accountId + date)
  - [ ] Show success toast on update

- [ ] Task 9: Implement snapshot delete functionality (AC: 10)
  - [ ] Add delete button to snapshot list items
  - [ ] Use shadcn/ui AlertDialog for confirmation
  - [ ] Delete all BalanceSnapshot records for that date
  - [ ] Show success toast: "Snapshot deleted"

- [ ] Task 10: Assemble Track page with BalanceLogger (AC: all)
  - [ ] Update `src/pages/TrackPage.tsx`
  - [ ] Add "Log Balances" section header
  - [ ] Add BalanceLogger component
  - [ ] Add SnapshotList component below logger
  - [ ] Responsive layout: single column on mobile, two columns on desktop

- [ ] Task 11: Write unit tests for useProgress hook
  - [ ] Test: logBalances creates correct BalanceSnapshot records
  - [ ] Test: Snapshots saved with correct date and createdAt
  - [ ] Test: Notes field saved correctly
  - [ ] Test: Validation rejects negative balances
  - [ ] Test: Delete removes all records for date

- [ ] Task 12: Write component tests for BalanceLogger
  - [ ] Test: Renders date picker with today's date
  - [ ] Test: Renders all accounts from hook
  - [ ] Test: Renders flexi facility if exists
  - [ ] Test: Notes textarea accepts input
  - [ ] Test: Save button triggers onSave callback
  - [ ] Test: Validation errors display for invalid input

- [ ] Task 13: Write integration tests for snapshot flow
  - [ ] Test: Complete save flow from input to Dexie
  - [ ] Test: Toast appears on successful save
  - [ ] Test: Snapshot appears in SnapshotList after save
  - [ ] Test: Edit flow updates existing snapshot
  - [ ] Test: Delete flow removes snapshot

- [ ] Task 14: Verify build and all tests pass
  - [ ] Run `npm run test` - verify all new tests pass
  - [ ] Run `npm run build` - verify no type errors
  - [ ] Manual test: Log balances for multiple accounts
  - [ ] Manual test: Verify snapshots persist across page reload
  - [ ] Manual test: Edit and delete functionality works

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── hooks/
│   └── useProgress.ts           # NEW: Progress tracking hook
├── components/
│   └── tracking/
│       ├── BalanceLogger.tsx    # NEW: Balance logging form
│       ├── SnapshotList.tsx     # NEW: Recent snapshots display
│       └── index.ts             # NEW: Barrel exports
├── pages/
│   └── TrackPage.tsx            # MODIFY: Add tracking components
├── types/
│   └── tracking.ts              # NEW: Tracking type definitions
```

**Data Model (from tech-spec-epic-6.md):**
```typescript
// src/types/tracking.ts

interface BalanceSnapshot {
  id?: number;
  accountId: number;
  date: string;           // ISO date string (YYYY-MM-DD)
  balance: string;        // big.js string for precision
  notes?: string;         // User annotation explaining variance
  createdAt: string;      // ISO timestamp
}

interface TotalDebtSnapshot {
  date: string;
  totalDebt: string;      // Sum of all account balances
  accountSnapshots: BalanceSnapshot[];
}
```

**Dexie Schema (already exists):**
```typescript
balanceSnapshots: '++id, accountId, date'
```

### PRD Requirements Alignment

From [prd.md](../prd.md):

**FR32:** "User can log actual debt account balances on weekly or monthly basis"

This story implements the core balance logging capability that enables the entire progress tracking & validation epic.

### UX Design Alignment

From [ux-design-specification.md](../ux-design-specification.md):

**Flow 4: Progress Validation (Monthly)**
```
1. Navigate to Progress Tracking
2. View Actual vs Projected Chart
3. Check Variance Percentage
4. Add Notes/Annotations (if variance detected)
5. Review Recommendations
```

**Design Patterns:**
- Use shadcn/ui Card for the logging section
- Date picker with SA format (DD/MM/YYYY)
- Currency input with ZAR formatting (R 1,234.56)
- Green success toast for saves, red for errors
- Inline validation with error messages below fields

### Learnings from Previous Story

**From Story 5.6 (Status: done)**

- **Form Patterns Established:**
  - React Hook Form + Zod for validation
  - shadcn/ui Input, Button, Form components
  - Toast notifications via sonner

- **Currency Formatting:**
  - `formatCurrency()` utility available at `src/lib/format/currency.ts`
  - Use for displaying balance values

- **Dexie Patterns:**
  - `db.settings.put()` for key-value storage
  - `useLiveQuery()` for reactive queries
  - Atomic operations via transactions

- **UX Patterns:**
  - Success toasts auto-dismiss after 3 seconds
  - Error toasts require manual dismiss
  - Confirmation dialogs for destructive actions

[Source: docs/sprint-artifacts/5-6-implement-strategy-selection-and-filter.md]

### Tech Spec Reference

From [tech-spec-epic-6.md](./tech-spec-epic-6.md):

**Balance Logging Flow:**
```
1. User navigates to Track page
2. User clicks "Log Balances"
3. System displays all accounts with current balance fields
4. User enters actual balances for each account
5. User optionally adds notes explaining variance
6. User clicks "Save Snapshot"
7. System validates inputs (balance >= 0)
8. System creates BalanceSnapshot records for each account
9. System shows success toast
10. System recalculates variance metrics
11. If variance > 20%, system shows deviation alert
```

**Performance Requirements:**
- Snapshot save: < 200ms (async Dexie writes, non-blocking)

**Security:**
- Input validation: Zod schemas validate balance inputs (non-negative numbers)
- Notes sanitization: Escape HTML in notes display to prevent XSS

### Implementation Notes

**Date Handling:**
```typescript
import { format, parseISO } from 'date-fns';

// Format for display (SA format)
const displayDate = format(new Date(), 'dd/MM/yyyy');

// Format for storage (ISO)
const storageDate = format(new Date(), 'yyyy-MM-dd');
```

**Balance Input Pattern:**
```typescript
// Use controlled input with big.js for precision
const [balance, setBalance] = useState<string>('');

// Parse on save
const balanceValue = new Big(balance);
if (balanceValue.lt(0)) {
  // Show validation error
}
```

**Dexie Transaction Pattern:**
```typescript
await db.transaction('rw', db.balanceSnapshots, async () => {
  for (const account of accounts) {
    await db.balanceSnapshots.add({
      accountId: account.id,
      date: selectedDate,
      balance: balances[account.id],
      notes: notes,
      createdAt: new Date().toISOString(),
    });
  }
});
```

### Edge Cases to Handle

1. **No accounts exist:** Show message "Add accounts in Data Entry first"
2. **Duplicate date entry:** Allow multiple snapshots per day (update existing or create new)
3. **Empty balance field:** Treat as 0 or require input
4. **Very large balances:** Use big.js to handle precision
5. **Notes with special characters:** Sanitize for display
6. **Offline save:** Dexie handles offline persistence automatically

### Visual Reference

**Balance Logger Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ Log Balances                                            📅 Today │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Date: [15/12/2025          ▼]                                  │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Home Loan (FNB)                          R [1,234,567.89] │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Vehicle Finance (MFC)                    R [   234,567.89] │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Credit Card (Nedbank)                    R [    12,345.67] │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Flexi Facility (FNB Flexi)               R [    45,678.90] │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  Notes (optional):                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Paid extra on vehicle loan this month                      │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│                                           [Save Snapshot]       │
└─────────────────────────────────────────────────────────────────┘
```

### References

- [Source: docs/epics.md#Story-6.1] - Original story definition
- [Source: docs/prd.md#FR32] - "User can log actual debt account balances"
- [Source: docs/architecture.md#Data-Architecture] - Dexie schema and patterns
- [Source: docs/sprint-artifacts/tech-spec-epic-6.md] - Epic 6 technical specification
- [Source: docs/ux-design-specification.md#Section-7.1] - UX patterns and consistency rules

## Dev Agent Record

### Context Reference

- [6-1-implement-balance-logging.context.xml](./6-1-implement-balance-logging.context.xml)

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-19 | Story drafted with full context from Epic 6 Tech Spec, PRD (FR32), Architecture, UX Design, and Story 5.6 learnings | SM Agent (Bob) |
