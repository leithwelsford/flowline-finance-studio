# Story 4.7: Implement Strategy Configuration Options

Status: ready-for-dev

## Story

As a **user**,
I want **to configure strategy parameters such as chunk amounts, payment frequencies, and target account overrides**,
so that **I can customize the debt acceleration calculations to my specific situation and preferences, rather than relying solely on default values**.

## Acceptance Criteria

1. **AC-4.7.1:** User can configure a **custom chunk amount** for flexi strategies (default: full available surplus). When set, strategies use this amount for periodic lump sum transfers instead of surplus.

2. **AC-4.7.2:** User can configure **payment frequency** for strategies (Monthly, Bi-Weekly, Weekly). Calculations adjust for the selected frequency (bi-weekly = 26 payments/year, weekly = 52 payments/year).

3. **AC-4.7.3:** User can configure a **target account override** to manually select which debt to prioritize, bypassing the default strategy targeting logic (smallest balance for snowball, highest rate for avalanche).

4. **AC-4.7.4:** Configuration is stored in the Dexie `settings` table as JSON with key `strategyConfig`.

5. **AC-4.7.5:** Default configuration is created on first access if none exists:
   - chunkAmount: null (use full surplus)
   - paymentFrequency: 'monthly'
   - targetAccountId: null (use strategy default)

6. **AC-4.7.6:** When configuration changes, strategies recalculate using the new parameters.

7. **AC-4.7.7:** The existing `StrategyConfig` interface in `types.ts` is extended to include the new configuration options, maintaining backward compatibility.

8. **AC-4.7.8:** A `useStrategyConfig` hook provides React components access to read and update configuration.

9. **AC-4.7.9:** A `StrategyConfig` UI component allows users to modify configuration via a form with validation:
   - Chunk amount: Currency input (ZAR), optional, must be >= 0 if set
   - Payment frequency: Select dropdown (Monthly/Bi-Weekly/Weekly)
   - Target account: Select dropdown populated from user's accounts, with "Use Strategy Default" option

10. **AC-4.7.10:** Unit tests verify configuration loading, saving, and application to strategy calculations.

11. **AC-4.7.11:** All strategies (8 total) respect the configuration when calculating projections.

## Tasks / Subtasks

- [ ] Task 1: Extend StrategyConfig type (AC: 7)
  - [ ] Update `src/lib/calculations/types.ts` to extend `StrategyConfig` interface
  - [ ] Add `chunkAmount?: string` - custom chunk amount for flexi strategies
  - [ ] Add `paymentFrequency?: 'monthly' | 'bi-weekly' | 'weekly'`
  - [ ] Add `targetAccountId?: number | null` - manual target override
  - [ ] Create `PaymentFrequency` type union
  - [ ] Ensure existing `maxMonths`, `startDate`, `extraPayment` remain intact

- [ ] Task 2: Create StrategyConfigData type for persistence (AC: 4, 5)
  - [ ] Create `src/types/strategy-config.ts`
  - [ ] Define `StrategyConfigData` interface for DB storage
  - [ ] Export from `src/types/index.ts`
  - [ ] Define `STRATEGY_CONFIG_KEY = 'strategyConfig'` constant
  - [ ] Define `DEFAULT_STRATEGY_CONFIG` constant

- [ ] Task 3: Implement useStrategyConfig hook (AC: 4, 5, 6, 8)
  - [ ] Create `src/hooks/useStrategyConfig.ts`
  - [ ] Use `useLiveQuery` from `dexie-react-hooks` to read from settings
  - [ ] Implement `loadConfig()` - reads from DB, returns default if missing
  - [ ] Implement `saveConfig(config)` - saves to DB, validates before save
  - [ ] Return `{ config, updateConfig, isLoading }` from hook
  - [ ] Handle JSON parse/stringify for DB storage

- [ ] Task 4: Update strategy calculations to respect config (AC: 1, 2, 3, 11)
  - [ ] Update `generateProjection()` in projections.ts to accept full StrategyConfig
  - [ ] Implement chunk amount override logic (when set, use instead of surplus)
  - [ ] Implement payment frequency logic:
    - Monthly: current behavior (12 payments/year)
    - Bi-Weekly: 26 payments/year, adjust monthly projection to reflect 2.17 payments/month
    - Weekly: 52 payments/year, adjust monthly projection to reflect 4.33 payments/month
  - [ ] Implement target account override:
    - When `targetAccountId` is set, that account receives extra payment first
    - When target is paid off, fall back to strategy default targeting
  - [ ] Update all 8 strategies to pass config through to projection generator

- [ ] Task 5: Create StrategyConfigForm UI component (AC: 9)
  - [ ] Create `src/components/strategies/StrategyConfigForm.tsx`
  - [ ] Use shadcn/ui Form, Input, Select components
  - [ ] Implement currency input for chunk amount with ZAR formatting
  - [ ] Implement payment frequency dropdown (Monthly, Bi-Weekly, Weekly)
  - [ ] Implement target account dropdown from useLiveQuery on accounts
  - [ ] Add "Use Strategy Default" option for target account
  - [ ] Use React Hook Form + Zod for validation
  - [ ] Call `updateConfig` on form submit
  - [ ] Show toast notification on successful save

- [ ] Task 6: Create Zod validation schema (AC: 9)
  - [ ] Create `src/lib/validation/strategy-config.ts`
  - [ ] Validate chunkAmount: optional, if present must be >= 0
  - [ ] Validate paymentFrequency: must be one of 'monthly', 'bi-weekly', 'weekly'
  - [ ] Validate targetAccountId: optional, if present must be valid account ID

- [ ] Task 7: Write unit tests for configuration (AC: 10)
  - [ ] Create `tests/hooks/useStrategyConfig.test.ts`
  - [ ] Test: Default config returned when none exists
  - [ ] Test: Config loads from DB correctly
  - [ ] Test: Config saves to DB correctly
  - [ ] Test: Invalid config rejected by validation
  - [ ] Create `tests/lib/calculations/config-application.test.ts`
  - [ ] Test: Chunk amount override applied to flexi strategies
  - [ ] Test: Payment frequency adjusts projection correctly
  - [ ] Test: Target account override prioritizes selected account
  - [ ] Test: All 8 strategies respect configuration

- [ ] Task 8: Integration test with orchestrator (AC: 6, 11)
  - [ ] Update `src/lib/calculations/strategies/index.ts` if needed
  - [ ] Verify orchestrator passes config to all strategies
  - [ ] Test: Changing config and recalculating produces different results

- [ ] Task 9: Update barrel exports (AC: all)
  - [ ] Update `src/types/index.ts` with new types
  - [ ] Update `src/hooks/index.ts` with useStrategyConfig
  - [ ] Update `src/components/strategies/index.ts` with StrategyConfigForm

- [ ] Task 10: Verify build and all tests pass (AC: all)
  - [ ] Run `npm run test` and ensure all tests pass
  - [ ] Run `npm run build` and ensure no type errors
  - [ ] Verify no regressions in existing test suite

## Dev Notes

### Architecture Alignment

From [architecture.md](../architecture.md):

**Component Location:**
```
src/
├── components/
│   └── strategies/
│       └── StrategyConfigForm.tsx     # NEW: FR21 UI component
├── hooks/
│   └── useStrategyConfig.ts           # NEW: Config hook
├── lib/
│   ├── calculations/
│   │   ├── types.ts                   # MODIFY: Extend StrategyConfig
│   │   └── projections.ts             # MODIFY: Apply config to projections
│   └── validation/
│       └── strategy-config.ts         # NEW: Zod schema
└── types/
    ├── strategy-config.ts             # NEW: Config data types
    └── index.ts                       # MODIFY: Export new types
```

**Data Persistence Pattern:**
```typescript
// Settings stored as JSON in Dexie settings table
db.settings.put({
  key: 'strategyConfig',
  value: JSON.stringify({
    chunkAmount: '5000.00',       // null = use full surplus
    paymentFrequency: 'monthly',  // 'monthly' | 'bi-weekly' | 'weekly'
    targetAccountId: null         // null = use strategy default
  })
});
```

### Payment Frequency Logic

**Monthly (Default):**
- 12 payments per year
- Current behavior unchanged
- Each projection month = 1 payment

**Bi-Weekly:**
- 26 payments per year
- 26/12 = ~2.167 payments per month
- Monthly projection reflects: surplus × 2.167 effective extra per month
- Use average: each month gets (annual_extra / 12) where annual = bi_weekly_amount × 26

**Weekly:**
- 52 payments per year
- 52/12 = ~4.333 payments per month
- Monthly projection reflects: surplus × 4.333 effective extra per month
- Use average: each month gets (annual_extra / 12) where annual = weekly_amount × 52

**Implementation Note:** Rather than model individual bi-weekly/weekly payments within a month (complex), adjust the effective monthly surplus to reflect the payment frequency. This keeps projections monthly while respecting the frequency impact.

### Target Account Override Logic

```typescript
function applyTargetOverride(
  accounts: SimulatedAccount[],
  targetAccountId: number | null,
  defaultSorter: (accounts: SimulatedAccount[]) => SimulatedAccount[]
): SimulatedAccount[] {
  if (targetAccountId === null) {
    // No override - use strategy default sorting
    return defaultSorter(accounts);
  }

  // Find target account
  const targetIndex = accounts.findIndex(a => a.id === targetAccountId);

  if (targetIndex === -1 || accounts[targetIndex].balance.lte(0)) {
    // Target not found or paid off - fall back to strategy default
    return defaultSorter(accounts);
  }

  // Put target first, then apply default sorting to the rest
  const target = accounts[targetIndex];
  const others = accounts.filter((_, i) => i !== targetIndex);
  return [target, ...defaultSorter(others)];
}
```

### Project Structure Notes

**Files to Create:**
- `src/types/strategy-config.ts`
- `src/hooks/useStrategyConfig.ts`
- `src/components/strategies/StrategyConfigForm.tsx`
- `src/lib/validation/strategy-config.ts`
- `tests/hooks/useStrategyConfig.test.ts`
- `tests/lib/calculations/config-application.test.ts`

**Files to Modify:**
- `src/lib/calculations/types.ts` - Extend StrategyConfig interface
- `src/lib/calculations/projections.ts` - Apply config to projections
- `src/types/index.ts` - Export new types
- `src/hooks/index.ts` - Export new hook (create if not exists)
- `src/components/strategies/index.ts` - Export new component (create if not exists)

### Learnings from Previous Story

**From Story 4.6 (Status: done)**

- **Test Results:** 1176 tests passing
- **Build:** Succeeds with 641KB bundle
- **Strategy Registry:** 8 strategies total (baseline, snowball, avalanche, flexi-chunking, aggressive-flexi, velocity-banking, hybrid-flexi-snowball, hybrid-flexi-avalanche)

- **Available Helper Functions:**
  - `generateProjection(snapshot, allocator, config)` - main projection function
  - `buildStrategyProjection(strategy, projection, baseline)` - builds StrategyProjection with metrics
  - All strategies use consistent patterns - can add config application uniformly

- **Key Implementation Insight:**
  - StrategyConfig already exists with `maxMonths`, `startDate`, `extraPayment`
  - New config options extend (not replace) existing interface
  - All 8 strategies already accept config parameter in calculate()

- **Files Created by Story 4.6:**
  - `src/lib/calculations/strategies/hybrid-snowball.ts`
  - `src/lib/calculations/strategies/hybrid-avalanche.ts`
  - Both implement DebtStrategy interface and accept StrategyConfig

[Source: docs/sprint-artifacts/4-6-implement-hybrid-strategies.md#Dev-Agent-Record]

### UI Component Pattern (from UX Spec)

From [ux-design-specification.md](../ux-design-specification.md):

**Form Pattern:**
- Use shadcn/ui Form, Input, Select components
- React Hook Form + Zod for validation
- Auto-save or explicit Save button
- Toast notifications for feedback

**Color/Style:**
- Primary button: Teal (teal-600)
- Form inputs: Standard shadcn styling
- Currency inputs: ZAR formatting with "R" prefix
- Accessible form labels with help tooltips

### References

- [Source: docs/epics.md#Story-4.7] - Original story definition: "User can configure strategy parameters (chunk amounts, payment frequencies, target accounts)"
- [Source: docs/prd.md#FR21] - "User can configure strategy parameters (chunk amounts, payment frequencies, target accounts)"
- [Source: docs/architecture.md#Data-Architecture] - Dexie settings table for key-value storage
- [Source: docs/architecture.md#ADR-003] - big.js for Financial Calculations (chunk amounts)
- [Source: docs/ux-design-specification.md#Section-7.1] - Form patterns and UX consistency
- [Source: docs/sprint-artifacts/4-6-implement-hybrid-strategies.md#Dev-Agent-Record] - Previous story learnings

## Dev Agent Record

### Context Reference

- docs/sprint-artifacts/4-7-implement-strategy-configuration-options.context.xml

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Completion Notes List

### File List

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2025-12-05 | Story drafted with full context from Epic 4 (FR21), PRD, Architecture, UX Design, and Story 4.6 learnings | SM Agent (Bob) |
