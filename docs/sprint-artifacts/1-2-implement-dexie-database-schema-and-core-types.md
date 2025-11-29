# Story 1.2: Implement Dexie Database Schema and Core Types

Status: done

## Story

As a **developer**,
I want **a properly configured IndexedDB database with TypeScript types**,
so that **all financial data can be persisted locally with type safety**.

## Acceptance Criteria

1. **Given** the initialized project **When** I implement the database layer **Then** a Dexie database instance is created with name `flowline-finance-studio`

2. **Given** the database is initialized **When** I check the schema **Then** the `accounts` table exists with fields: id, name, type, balance, interestRate, minimumPayment, lender, interestType, createdAt, updatedAt

3. **Given** the database is initialized **When** I check the schema **Then** the `flexiFacility` table exists with fields: id, name, type, creditLimit, currentBalance, interestRate, createdAt, updatedAt

4. **Given** the database is initialized **When** I check the schema **Then** the `income` table exists with fields: id, source, amount, paymentDate, createdAt

5. **Given** the database is initialized **When** I check the schema **Then** the `expenses` table exists with fields: id, category, amount, date, createdAt

6. **Given** the database is initialized **When** I check the schema **Then** the `balanceSnapshots` table exists with fields: id, accountId, date, balance, notes, createdAt

7. **Given** the database is initialized **When** I check the schema **Then** the `settings` table exists with fields: key, value

8. **Given** the types are created **When** I check `src/types/` **Then** TypeScript interfaces exist for: DebtAccount, FlexiFacility, IncomeEntry, ExpenseEntry, BalanceSnapshot

9. **Given** the types are created **When** I check account types **Then** AccountType enum includes: 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card'

10. **Given** the types are created **When** I check facility types **Then** FlexiFacilityType enum includes: 'fnb_flexi' | 'standard_bank_access'

11. **Given** all types are defined **When** I check monetary value storage **Then** all monetary values (balance, amounts, rates) are stored as strings for big.js precision

12. **Given** all types are defined **When** I check date storage **Then** all dates are stored as ISO strings

13. **Given** the database module is complete **When** I import from `src/lib/db/index.ts` **Then** the database instance is exported and usable

14. **Given** the types module is complete **When** I import from `src/types/index.ts` **Then** all types are re-exported via barrel exports

## Tasks / Subtasks

- [x] Task 1: Create TypeScript interfaces and types (AC: 8, 9, 10, 11, 12, 14)
  - [x] Create `src/types/account.ts` with DebtAccount interface
  - [x] Add AccountType union type: 'home_loan' | 'vehicle_finance' | 'personal_loan' | 'credit_card'
  - [x] Add InterestType union type: 'monthly' | 'daily'
  - [x] Create `src/types/flexi-facility.ts` with FlexiFacility interface
  - [x] Add FlexiFacilityType union type: 'fnb_flexi' | 'standard_bank_access'
  - [x] Create `src/types/income.ts` with IncomeEntry interface
  - [x] Create `src/types/expense.ts` with ExpenseEntry interface
  - [x] Add ExpenseCategory union type: 'housing' | 'transport' | 'food' | 'utilities' | 'insurance' | 'entertainment' | 'other'
  - [x] Create `src/types/balance-snapshot.ts` with BalanceSnapshot interface
  - [x] Create `src/types/settings.ts` with AppSettings interface
  - [x] Update `src/types/index.ts` with barrel exports for all types

- [x] Task 2: Create Dexie database schema (AC: 1, 2, 3, 4, 5, 6, 7, 13)
  - [x] Create `src/lib/db/schema.ts` with FlowlineDB class extending Dexie
  - [x] Define `accounts` table with indexes: '++id, name, type, createdAt'
  - [x] Define `flexiFacility` table with indexes: '++id, name, createdAt'
  - [x] Define `income` table with indexes: '++id, source, date'
  - [x] Define `expenses` table with indexes: '++id, category, date'
  - [x] Define `balanceSnapshots` table with indexes: '++id, accountId, date'
  - [x] Define `settings` table with index: 'key'
  - [x] Set database version to 1
  - [x] Create `src/lib/db/index.ts` exporting database instance

- [x] Task 3: Write unit tests for types and database (AC: All)
  - [x] Create `tests/types/account.test.ts` testing type validation
  - [x] Create `tests/lib/db/schema.test.ts` testing database operations
  - [x] Test CRUD operations: add, get, update, delete for accounts table
  - [x] Test that monetary values store as strings correctly
  - [x] Test that dates store as ISO strings correctly
  - [x] Verify all tests pass with `npm run test`

## Dev Notes

### Architecture Alignment

This story implements the data persistence layer specified in Architecture doc:
- **ADR-002**: Dexie.js for Data Persistence (IndexedDB wrapper)
- **ADR-003**: big.js for Financial Calculations (string storage for precision)

From Architecture doc Section "Database Schema (Dexie.js)":
```typescript
class FlowlineDB extends Dexie {
  accounts!: Dexie.Table<DebtAccount, number>;
  flexiFacility!: Dexie.Table<FlexiFacility, number>;
  income!: Dexie.Table<IncomeEntry, number>;
  expenses!: Dexie.Table<ExpenseEntry, number>;
  balanceSnapshots!: Dexie.Table<BalanceSnapshot, number>;
  settings!: Dexie.Table<AppSettings, string>;
}
```

### Data Type Conventions

From Architecture doc "Core Data Types":
- **Monetary values**: string for big.js precision (e.g., "500000.00")
- **Dates**: ISO string format (e.g., "2025-11-28T00:00:00.000Z")
- **Rates**: decimal as string (0.115 = 11.5%, stored as "0.115")
- **IDs**: auto-incremented number (++id)

### Type Definitions Required

| Interface | Key Fields | Notes |
|-----------|------------|-------|
| DebtAccount | id?, name, type, balance, interestRate, minimumPayment, lender, interestType, createdAt, updatedAt | type: AccountType union |
| FlexiFacility | id?, name, type, creditLimit, currentBalance, interestRate, createdAt, updatedAt | type: FlexiFacilityType union |
| IncomeEntry | id?, source, amount, paymentDate, createdAt | paymentDate: day of month 1-31 |
| ExpenseEntry | id?, category, amount, date, createdAt | category: ExpenseCategory union |
| BalanceSnapshot | id?, accountId, date, balance, notes?, createdAt | For progress tracking |
| AppSettings | key, value | Generic key-value store |

### Project Structure Notes

Files to create:
- `src/types/account.ts` - DebtAccount interface
- `src/types/flexi-facility.ts` - FlexiFacility interface
- `src/types/income.ts` - IncomeEntry interface
- `src/types/expense.ts` - ExpenseEntry interface
- `src/types/balance-snapshot.ts` - BalanceSnapshot interface
- `src/types/settings.ts` - AppSettings interface
- `src/types/index.ts` - Barrel exports (update existing)
- `src/lib/db/schema.ts` - Database class and schema
- `src/lib/db/index.ts` - Export database instance

### Learnings from Previous Story

**From Story 1-1 (Status: done)**
- shadcn/ui components available in `src/components/ui/`
- All core dependencies installed including dexie, dexie-react-hooks
- Path alias `@/` configured - use for all imports
- Folder structure already exists with .gitkeep files
- Test setup at `tests/setup.ts` with Vitest configured

### Testing Approach

Use Vitest with the existing test setup:
```typescript
// tests/lib/db/schema.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { db } from '@/lib/db';

describe('FlowlineDB', () => {
  beforeEach(async () => {
    await db.accounts.clear();
  });

  it('should add an account', async () => {
    const id = await db.accounts.add({
      name: 'Home Loan',
      type: 'home_loan',
      balance: '500000.00',
      // ...
    });
    expect(id).toBeDefined();
  });
});
```

### References

- [Source: docs/architecture.md#Database-Schema-(Dexie.js)] - Schema definition
- [Source: docs/architecture.md#Core-Data-Types] - Type conventions
- [Source: docs/architecture.md#ADR-002] - Dexie.js decision rationale
- [Source: docs/architecture.md#ADR-003] - big.js string storage rationale
- [Source: docs/epics.md#Story-1.2] - Acceptance criteria and story details
- [Source: docs/prd.md#FR7] - Local data persistence requirement

## Dev Agent Record

### Context Reference

- [docs/sprint-artifacts/1-2-implement-dexie-database-schema-and-core-types.context.xml](docs/sprint-artifacts/1-2-implement-dexie-database-schema-and-core-types.context.xml)

### Agent Model Used

claude-opus-4-5-20251101

### Debug Log References

- Task 1: Created 6 type files with full TypeScript interfaces
- Task 2: Implemented FlowlineDB class with 6 tables and proper indexes
- Task 3: Encountered fake-indexeddb constraint error with identical createdAt values; resolved by using unique timestamps in tests

### Completion Notes List

- All 14 acceptance criteria satisfied
- 36 tests passing (14 type tests + 21 database tests + 1 placeholder)
- Added fake-indexeddb dev dependency for testing
- FlowlineDB constructor now accepts optional dbName parameter (default: 'flowline-finance-studio')

### File List

**New Files:**
- src/types/account.ts
- src/types/flexi-facility.ts
- src/types/income.ts
- src/types/expense.ts
- src/types/balance-snapshot.ts
- src/types/settings.ts
- src/lib/db/schema.ts
- src/lib/db/index.ts
- tests/types/account.test.ts
- tests/lib/db/schema.test.ts

**Modified Files:**
- src/types/index.ts (added barrel exports)
- tests/setup.ts (added fake-indexeddb import)
- package.json (added fake-indexeddb dev dependency)
- docs/sprint-artifacts/sprint-status.yaml (status updates)

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-11-28 | Story drafted from epics.md | SM Agent (Bob) |
| 2025-11-28 | Story context generated, marked ready-for-dev | SM Agent (Bob) |
| 2025-11-29 | Implementation complete, all tasks done, 36 tests passing | Dev Agent (Amelia) |
| 2025-11-29 | Senior Developer Review: APPROVED | Code Review (AI) |

## Senior Developer Review (AI)

### Reviewer: Leith
### Date: 2025-11-29
### Outcome: **APPROVE**

All 14 acceptance criteria fully implemented with evidence. All 26 tasks/subtasks marked complete are verified complete with corresponding code and tests.

---

### Summary

Story 1.2 is a clean, well-structured implementation of the Dexie database schema and TypeScript types. The code follows the architecture decisions (ADR-002, ADR-003) precisely. All types use string storage for monetary values as required for big.js precision. Test coverage is comprehensive with 36 passing tests covering type validation and CRUD operations.

---

### Key Findings

**No HIGH or MEDIUM severity issues found.**

**LOW Severity:**
- Note: The `income` table indexes `date` but the IncomeEntry interface has `paymentDate` (number). The index comment explains this is intentional for querying by pay day, but this could cause confusion. Consider renaming the index or adding clearer documentation.

---

### Acceptance Criteria Coverage

| AC# | Description | Status | Evidence |
|-----|-------------|--------|----------|
| AC1 | Dexie database with name `flowline-finance-studio` | IMPLEMENTED | src/lib/db/schema.ts:12 |
| AC2 | `accounts` table with required fields | IMPLEMENTED | src/lib/db/schema.ts:46, src/types/account.ts:21-42 |
| AC3 | `flexiFacility` table with required fields | IMPLEMENTED | src/lib/db/schema.ts:49, src/types/flexi-facility.ts:14-31 |
| AC4 | `income` table with required fields | IMPLEMENTED | src/lib/db/schema.ts:53, src/types/income.ts:8-19 |
| AC5 | `expenses` table with required fields | IMPLEMENTED | src/lib/db/schema.ts:56, src/types/expense.ts:21-32 |
| AC6 | `balanceSnapshots` table with required fields | IMPLEMENTED | src/lib/db/schema.ts:59, src/types/balance-snapshot.ts:8-21 |
| AC7 | `settings` table with key/value | IMPLEMENTED | src/lib/db/schema.ts:62, src/types/settings.ts:7-12 |
| AC8 | TypeScript interfaces exist | IMPLEMENTED | src/types/ - 6 interface files |
| AC9 | AccountType union | IMPLEMENTED | src/types/account.ts:5 |
| AC10 | FlexiFacilityType union | IMPLEMENTED | src/types/flexi-facility.ts:5 |
| AC11 | Monetary values as strings | IMPLEMENTED | All interfaces + tests/types/account.test.ts:204-225 |
| AC12 | Dates as ISO strings | IMPLEMENTED | All interfaces + tests/types/account.test.ts:228-251 |
| AC13 | Database exported from src/lib/db/index.ts | IMPLEMENTED | src/lib/db/index.ts:25 |
| AC14 | Barrel exports from src/types/index.ts | IMPLEMENTED | src/types/index.ts:1-20 |

**Summary: 14 of 14 acceptance criteria fully implemented**

---

### Task Completion Validation

| Task | Marked | Verified | Evidence |
|------|--------|----------|----------|
| Task 1: Create TypeScript interfaces and types | [x] | ✅ | 6 type files + barrel exports |
| Task 2: Create Dexie database schema | [x] | ✅ | FlowlineDB class with 6 tables |
| Task 3: Write unit tests | [x] | ✅ | 36 tests passing |

**Summary: 26 of 26 completed tasks verified. 0 questionable. 0 falsely marked complete.**

---

### Test Coverage and Gaps

- Type validation: 14 tests
- Database CRUD: 21 tests
- Total: 36 tests passing
- No significant test gaps identified

---

### Architectural Alignment

- ADR-002 (Dexie.js): ✅ Correctly implemented
- ADR-003 (big.js string storage): ✅ All monetary values are strings
- Project Structure: ✅ Files in correct locations

---

### Security Notes

No security concerns. Data layer story with no user input handling.

---

### Action Items

**Code Changes Required:**
- None

**Advisory Notes:**
- Note: Consider clarifying income table's `date` index maps to `paymentDate` field (no action required)
